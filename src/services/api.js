 import axios from 'axios';

 const API_BASE_URL = 'https://gearup-sage.vercel.app/gearup'; 

 export const registerUser = async (userData) => {
     try {
         const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
             headers: {
                 'Content-Type': 'application/json',
             },
         });
         return response;
     } catch (error) {
         throw error.response;
     }
 };

 export const loginUser = async (username, password) => {
    
     try {
        
         const response = await axios.post(
             `${API_BASE_URL}/auth/login?username=${username}`,
             {}, 
             {
                 headers: {
                     'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
                 },
             }
         );
         return response;
     } catch (error) {
         throw error.response;
     }
 };

 export const fetchCategories = () => axios.get(`${API_BASE_URL}/category`);

 export const fetchProducts = () => axios.get(`${API_BASE_URL}/products`);


  export const fetchProductsByCategory = (categoryId) => {
     const url = categoryId ? `${API_BASE_URL}/products/category/${categoryId}` : `${API_BASE_URL}/products`;
     return axios.get(url);
 };


        // 1. Add to Cart (POST)
        // Note: We use query params because your Controller uses @RequestParam
        export const addToCart = (userId, productId, quantity = 1) => {
            return axios.post(`${API_BASE_URL}/cart/${userId}/add?productId=${productId}&quantity=${quantity}`);
        };

        // 2. Fetch User Cart (GET)
        export const fetchUserCart = (userId) => {
            return axios.get(`${API_BASE_URL}/cart/${userId}`);
        };

        // 3. Remove from Cart (DELETE)
        // Ensure this matches your @DeleteMapping in Spring Boot
        export const removeFromCart = (userId, productId) => {
            return axios.delete(`${API_BASE_URL}/cart/${userId}/remove/${productId}`);
        };

 


