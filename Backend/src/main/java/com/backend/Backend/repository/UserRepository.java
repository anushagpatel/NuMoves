/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.backend.Backend.repository;

import com.backend.Backend.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 *
 * @author Zainab
 */
public interface UserRepository extends JpaRepository<User, Long> {
     User findByEmail(String email);
     @Override
    Optional<User> findById(Long id); 
}
