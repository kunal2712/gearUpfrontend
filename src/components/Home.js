// Home.js
import React, { useEffect, useState } from 'react';
import { fetchCategories, fetchProducts, fetchProductsByCategory, addToCart } from '../services/api'; 

function Home({ openAuthModal }) {
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]); 
    const [products, setProducts] = useState([]); 
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [categoriesResponse, allProductsResponse] = await Promise.all([
                    fetchCategories(),
                    fetchProducts() 
                ]);
                setCategories(categoriesResponse.data);
                setAllProducts(allProductsResponse.data);
                setProducts(allProductsResponse.data); 
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to load initial data.');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            setLoading(true);
            fetchProductsByCategory(selectedCategory)
                .then(res => {
                    setProducts(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message || 'Failed to load products.');
                    setLoading(false);
                });
        } else {
            setProducts(allProducts); 
        }
    }, [selectedCategory, allProducts]);

    const handleAddToCart = async (productId) => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (!savedUser?.id) return openAuthModal?.();

        try {
            await addToCart(savedUser.id, productId, 1);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (err) {
            alert("Error adding to cart");
        }
    };

    if (loading) return <div className="loading-container"><p>Loading gear...</p></div>;
    if (error) return <div className="error-container"><p>Error: {error}</p></div>;

    return (
        <div className="home-page">
            {/* Horizontal Scrollable Categories for Mobile */}
            <nav className="category-navbar">
                <ul className="category-list">
                    <li className="category-item">
                        <button 
                            className={!selectedCategory ? 'active-cat' : ''} 
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </button>
                    </li>
                    {categories.map(cat => (
                        <li key={cat.id} className="category-item">
                            <button 
                                className={selectedCategory === cat.id ? 'active-cat' : ''}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <section className="product-section">
                <h2 className="section-title">
                    {selectedCategory
                        ? categories.find(cat => cat.id === selectedCategory)?.name
                        : 'Our Products'}
                </h2>
                
                <div className="product-grid">
                    {products.map(prod => (
                        <div key={prod.id} className="product-card">
                            <div className="image-container">
                                <img src={prod.imageUrl} alt={prod.name} className="product-image" />
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{prod.name}</h3>
                                <p className="product-price">${prod.price?.toFixed(2)}</p>
                                <p className="product-description">{prod.description}</p>
                                
                                <div className="product-actions">
                                    <button className="view-details-button" >Details</button>
                                    <button 
                                        className="add-to-cart-button"
                                        onClick={() => handleAddToCart(prod.id)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

   
            {showToast && (
                <div className="toast-notification">
                    🛒 Added to bag!
                </div>
            )}
        </div>
    );
}

export default Home;