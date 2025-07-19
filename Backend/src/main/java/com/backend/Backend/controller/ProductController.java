package com.backend.Backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.backend.Backend.model.Product;
import com.backend.Backend.model.User;
import com.backend.Backend.repository.ProductRepository;
import com.backend.Backend.repository.UserRepository;

/**
 * @author Anusha
 */
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*") 
public class ProductController {

    @Autowired
    private ProductRepository productRepository;  
    @Autowired
    private UserRepository userRepository;

    @Value("${upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    /**
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
Optional<User> userOptional = userRepository.findById(userId); // Correct way to use the instance
 if (!userOptional.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        
        User user = userOptional.get();
            String imageUrl = null;
            
            if (imageFile != null && !imageFile.isEmpty()) {
                // Create unique filename
                String originalFilename = imageFile.getOriginalFilename();
                String fileExtension = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                        : "";
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(uniqueFilename);
                imageFile.transferTo(filePath.toFile());

                imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/products/images/")
                        .path(uniqueFilename)
                        .toUriString();
            }

            Product product = new Product(title, description, price, imageUrl, user);
            Product savedProduct = productRepository.save(product);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     */
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.IMAGE_JPEG) 
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all products
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    /**
     * Get products by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Product>> getProductsByUser(@PathVariable Long userId) {
        List<Product> products = productRepository.findByUserId(userId);
        return ResponseEntity.ok(products);
    }

    /**
     * Get product by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            Optional<User> userOptional = userRepository.findById(userId); // Correct way to use the instance
 if (!userOptional.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        
        User user = userOptional.get();
            Optional<Product> optionalProduct = productRepository.findById(id);
            
            if (!optionalProduct.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Product product = optionalProduct.get();
            
            if (title != null) product.setTitle(title);
            if (description != null) product.setDescription(description);
            if (price != null) product.setPrice(price);
            if (userId != null) product.setUser(user);
            
            if (imageFile != null && !imageFile.isEmpty()) {
                if (product.getImageUrl() != null) {
                    String oldFilename = product.getImageUrl().substring(product.getImageUrl().lastIndexOf("/") + 1);
                    Path oldFilePath = Paths.get(uploadDir).resolve(oldFilename);
                    Files.deleteIfExists(oldFilePath);
                }
                
                String originalFilename = imageFile.getOriginalFilename();
                String fileExtension = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                        : "";
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(uniqueFilename);
                imageFile.transferTo(filePath.toFile());

                String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/products/images/")
                        .path(uniqueFilename)
                        .toUriString();
                product.setImageUrl(imageUrl);
            }
            
            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Delete a product
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            Optional<Product> optionalProduct = productRepository.findById(id);
            
            if (!optionalProduct.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Product product = optionalProduct.get();
            
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                String filename = product.getImageUrl().substring(product.getImageUrl().lastIndexOf("/") + 1);
                Path filePath = Paths.get(uploadDir).resolve(filename);
                Files.deleteIfExists(filePath);
            }
            
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error deleting product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
