import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { useLocation } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye } from 'react-icons/fa';

const ProdByUser = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); 
  const [userId, setUserId] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId'); 
    if (storedUserId) {
      setUserId(storedUserId); 
    } else {
      setError('User not authorized');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchProducts = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/products/user/${userId}`);
          setProducts(response.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch products');
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [userId]);

  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto"> 
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold text-gray-900 text-center mb-12 relative pb-4"
        >
          My Advertisements
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-500 rounded-full"></span>
        </motion.h2>
        
        {products.length > 0 ? (
          <div className="space-y-6"> 
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row"> 
                  <div className="relative md:w-1/3 h-64">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/300'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        {wishlist.includes(product.id) ? (
                          <FaHeart className="text-red-500" />
                        ) : (
                          <FaRegHeart className="text-gray-600" />
                        )}
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <span className="text-white font-semibold">${product.price}</span>
                    </div>
                  </div>

                  <div className="p-5 md:w-2/3">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <div className="flex -space-x-1 overflow-hidden">
                          <img 
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white" 
                            src="https://randomuser.me/api/portraits/women/12.jpg" 
                            alt=""
                          />
                          <img 
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white" 
                            src="https://randomuser.me/api/portraits/men/12.jpg" 
                            alt=""
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-500">12 bought</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                          <FaEye className="mr-2" /> View
                        </button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                          <FaShoppingCart className="mr-2" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">This user hasn't listed any products yet.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProdByUser;