import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 1. Create a centralized Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor: Automatically attach JWT Bearer token to every request if present
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- AUTH API CALLS ---

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const loginUser = async (username, password) => {
    try {
        const response = await api.post('/auth/login', {
            username: username,
            password: password,
        });

        // Save JWT token and User ID from the backend response
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('userId', response.data.id);
        }

        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
};

// --- PRODUCT & CATEGORY API CALLS ---

export const fetchCategories = () => api.get('/category');

export const fetchProducts = () => api.get('/products');

export const fetchProductsByCategory = (categoryId) => {
    const url = categoryId ? `/products/category/${categoryId}` : '/products';
    return api.get(url);
};

// --- CART API CALLS (Bearer Token automatically attached) ---

// 1. Add to Cart (POST)
export const addToCart = (userId, productId, quantity = 1) => {
    return api.post(`/cart/${userId}/add?productId=${productId}&quantity=${quantity}`);
};

// 2. Fetch User Cart (GET)
export const fetchUserCart = (userId) => {
    return api.get(`/cart/${userId}`);
};

// 3. Remove from Cart (DELETE)
export const removeFromCart = (userId, productId) => {
    return api.delete(`/cart/${userId}/remove/${productId}`);
};

export default api;