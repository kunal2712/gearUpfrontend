// Home.js
import React, { useEffect, useState } from 'react';
import { fetchCategories, fetchProducts, fetchProductsByCategory, addToCart } from '../services/api';
import './Home.css';

function Home({ openAuthModal }) {
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Helper function to handle raw arrays, Axios wrappers, or Spring Boot Pageable objects
    const extractArrayData = (response) => {
        const raw = response?.data !== undefined ? response.data : response;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.content)) return raw.content; // Spring Data Pageable
        if (Array.isArray(raw?.products)) return raw.products; // Custom payload wrapper
        if (Array.isArray(raw?.categories)) return raw.categories;
        return [];
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [categoriesResponse, allProductsResponse] = await Promise.all([
                    fetchCategories(),
                    fetchProducts()
                ]);

                const categoryList = extractArrayData(categoriesResponse);
                const productList = extractArrayData(allProductsResponse);

                setCategories(categoryList);
                setAllProducts(productList);
                setProducts(productList);
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
                    setProducts(extractArrayData(res));
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message || 'Failed to load products.');
                    setLoading(false);
                });
        } else {
            setProducts(Array.isArray(allProducts) ? allProducts : []);
        }
    }, [selectedCategory, allProducts]);

    // Detail modal: close on Escape, lock background scroll while open
    useEffect(() => {
        if (!selectedProduct) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedProduct(null);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedProduct]);

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

    // Purely presentational: number of skeleton placeholders shown while loading
    const skeletonCount = 6;

    if (error) {
        return (
            <div className="gu-state-screen">
                <span className="gu-state-eyebrow">Whistle blown</span>
                <p className="gu-state-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="gu-home">
            {/* Horizontal Scrollable Categories for Mobile */}
            <nav className="gu-category-navbar">
                <ul className="gu-category-list">
                    <li className="gu-category-item">
                        <button
                            className={`gu-pill ${!selectedCategory ? 'gu-pill--active' : ''}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </button>
                    </li>
                    {Array.isArray(categories) && categories.map(cat => (
                        <li key={cat.id} className="gu-category-item">
                            <button
                                className={`gu-pill ${selectedCategory === cat.id ? 'gu-pill--active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <section className="gu-product-section">
                <div className="gu-section-heading">
                    <h2 className="gu-section-title">
                        {selectedCategory && Array.isArray(categories)
                            ? categories.find(cat => cat.id === selectedCategory)?.name
                            : 'Our Products'}
                    </h2>
                    <div className="gu-stripe" aria-hidden="true">
                        <span></span><span></span><span></span><span></span><span></span>
                    </div>
                </div>

                {loading ? (
                    <div className="gu-product-grid">
                        {Array.from({ length: skeletonCount }).map((_, i) => (
                            <div className="gu-card gu-card--skeleton" key={i}>
                                <div className="gu-card-image gu-shimmer"></div>
                                <div className="gu-card-info">
                                    <div className="gu-shimmer-line gu-shimmer" style={{ width: '70%' }}></div>
                                    <div className="gu-shimmer-line gu-shimmer" style={{ width: '40%' }}></div>
                                    <div className="gu-shimmer-line gu-shimmer" style={{ width: '90%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="gu-product-grid">
                        {Array.isArray(products) && products.map(prod => (
                            <div key={prod.id} className="gu-card">
                                <div className="gu-card-image-wrap">
                                    <div className="gu-tag">
                                        <span className="gu-tag-currency">$</span>
                                        {prod.price?.toFixed(2)}
                                    </div>
                                    <div className="gu-card-image">
                                        <img src={prod.imageUrl} alt={prod.name} />
                                    </div>
                                </div>
                                <div className="gu-card-info">
                                    <h3 className="gu-product-name">{prod.name}</h3>
                                    <p className="gu-product-description">{prod.description}</p>

                                    <div className="gu-card-actions">
                                        <button
                                            className="gu-btn gu-btn--ghost"
                                            onClick={() => setSelectedProduct(prod)}
                                        >
                                            Details
                                        </button>
                                        <button
                                            className="gu-btn gu-btn--solid"
                                            onClick={() => handleAddToCart(prod.id)}
                                        >
                                            Add to cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {products.length === 0 && (
                            <div className="gu-empty">
                                <span className="gu-state-eyebrow">Empty rack</span>
                                <p className="gu-state-message">No gear in this category yet. Check back soon.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {showToast && (
                <div className="gu-toast" role="status">
                    <span className="gu-toast-dot"></span>
                    Gear added to bag
                </div>
            )}

            {selectedProduct && (
                <div className="gu-detail-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="gu-detail-stage">
                        <div
                            className="gu-detail-card"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label={selectedProduct.name}
                        >
                            <button
                                className="gu-detail-close"
                                onClick={() => setSelectedProduct(null)}
                                aria-label="Close details"
                            >
                                &times;
                            </button>

                            <div className="gu-detail-image-wrap">
                                <div className="gu-tag gu-detail-tag">
                                    <span className="gu-tag-currency">$</span>
                                    {selectedProduct.price?.toFixed(2)}
                                </div>
                                <div className="gu-detail-image">
                                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                                </div>
                            </div>

                            <div className="gu-detail-info">
                                <span className="gu-modal-eyebrow">Gear details</span>
                                <h3 className="gu-detail-name">{selectedProduct.name}</h3>
                                <p className="gu-detail-description">{selectedProduct.description}</p>

                                <button
                                    className="gu-btn gu-btn--solid gu-detail-add"
                                    onClick={() => handleAddToCart(selectedProduct.id)}
                                >
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;