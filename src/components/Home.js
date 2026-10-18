
import React, { useEffect, useState } from 'react';
import {
    fetchCategories,
    fetchProducts,
    fetchProductsByCategory,
    addToCart
} from '../services/api';
import './Home.css';
import RecommendedProducts from '../components/RecommendedProducts';

function Home({ openAuthModal }) {
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Handle arrays, Axios responses, and Spring Boot Pageable responses.
    const extractArrayData = (response) => {
        const raw = response?.data !== undefined
            ? response.data
            : response;

        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.content)) return raw.content;
        if (Array.isArray(raw?.products)) return raw.products;
        if (Array.isArray(raw?.categories)) return raw.categories;

        return [];
    };

    // Load categories and products.
    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);

            try {
                const [categoriesResponse, allProductsResponse] =
                    await Promise.all([
                        fetchCategories(),
                        fetchProducts()
                    ]);

                if (cancelled) return;

                const categoryList = extractArrayData(categoriesResponse);
                const productList = extractArrayData(allProductsResponse);

                setCategories(categoryList);
                setAllProducts(productList);
                setProducts(productList);
                setError(null);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Failed to load initial data.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    // Filter products by category.
    useEffect(() => {
        let cancelled = false;

        if (selectedCategory) {
            setLoading(true);

            fetchProductsByCategory(selectedCategory)
                .then((res) => {
                    if (!cancelled) {
                        setProducts(extractArrayData(res));
                        setError(null);
                    }
                })
                .catch((err) => {
                    if (!cancelled) {
                        setError(err.message || 'Failed to load products.');
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                });
        } else {
            setProducts(Array.isArray(allProducts) ? allProducts : []);
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [selectedCategory, allProducts]);

    // Close the modal with Escape and lock background scrolling.
    useEffect(() => {
        if (!selectedProduct) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedProduct(null);
            }
        };

        const previousOverflow = document.body.style.overflow;

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [selectedProduct]);

    // Add a product to the user's cart.
    const handleAddToCart = async (productId) => {
        let savedUser;

        try {
            savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            savedUser = null;
        }

        const userId = savedUser?.id || savedUser?.userId;

        if (!userId) {
            openAuthModal?.();
            return;
        }

        try {
            await addToCart(userId, productId, 1);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (err) {
            console.error('Add to cart failed:', err);
            alert('Error adding to cart');
        }
    };

    const skeletonCount = 6;

    if (error) {
        return (
            <div className="gu-state-screen">
                <span className="gu-state-eyebrow">Whistle blown</span>
                <p className="gu-state-message">{error}</p>
                <button
                    className="gu-btn gu-btn--solid"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="gu-home">
            {/* Category navigation */}
            <nav className="gu-category-navbar">
                <ul className="gu-category-list">
                    <li className="gu-category-item">
                        <button
                            className={`gu-pill ${
                                !selectedCategory ? 'gu-pill--active' : ''
                            }`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </button>
                    </li>

                    {Array.isArray(categories) &&
                        categories.map((cat) => (
                            <li key={cat.id} className="gu-category-item">
                                <button
                                    className={`gu-pill ${
                                        selectedCategory === cat.id
                                            ? 'gu-pill--active'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                </ul>
            </nav>

            {/* Product listing */}
            <section className="gu-product-section">
                <div className="gu-section-heading">
                    <h2 className="gu-section-title">
                        {selectedCategory
                            ? categories.find(
                                  (cat) =>
                                      Number(cat.id) === Number(selectedCategory)
                              )?.name || 'Our Products'
                            : 'Our Products'}
                    </h2>

                    <div className="gu-stripe" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                {loading ? (
                    <div className="gu-product-grid">
                        {Array.from({ length: skeletonCount }).map((_, i) => (
                            <div
                                className="gu-card gu-card--skeleton"
                                key={i}
                            >
                                <div className="gu-card-image gu-shimmer" />
                                <div className="gu-card-info">
                                    <div
                                        className="gu-shimmer-line gu-shimmer"
                                        style={{ width: '70%' }}
                                    />
                                    <div
                                        className="gu-shimmer-line gu-shimmer"
                                        style={{ width: '40%' }}
                                    />
                                    <div
                                        className="gu-shimmer-line gu-shimmer"
                                        style={{ width: '90%' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="gu-product-grid">
                        {Array.isArray(products) &&
                            products.map((prod) => (
                                <div key={prod.id} className="gu-card">
                                    <div className="gu-card-image-wrap">
                                        <div className="gu-tag">
                                            <span className="gu-tag-currency">
                                                $
                                            </span>
                                            {Number(prod.price).toFixed(2)}
                                        </div>

                                        <div className="gu-card-image">
                                            <img
                                                src={prod.imageUrl}
                                                alt={prod.name}
                                            />
                                        </div>
                                    </div>

                                    <div className="gu-card-info">
                                        <h3 className="gu-product-name">
                                            {prod.name}
                                        </h3>

                                        <p className="gu-product-description">
                                            {prod.description}
                                        </p>

                                        <div className="gu-card-actions">
                                            <button
                                                className="gu-btn gu-btn--ghost"
                                                onClick={() =>
                                                    setSelectedProduct(prod)
                                                }
                                            >
                                                Details
                                            </button>

                                            <button
                                                className="gu-btn gu-btn--solid"
                                                onClick={() =>
                                                    handleAddToCart(prod.id)
                                                }
                                            >
                                                Add to cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {products.length === 0 && (
                            <div className="gu-empty">
                                <span className="gu-state-eyebrow">
                                    Empty rack
                                </span>
                                <p className="gu-state-message">
                                    No gear in this category yet. Check back
                                    soon.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Add-to-cart confirmation */}
            {showToast && (
                <div className="gu-toast" role="status">
                    <span className="gu-toast-dot" />
                    Gear added to bag
                </div>
            )}

            {/* Product details modal */}
            {selectedProduct && (
                <div
                    className="gu-detail-overlay"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div className="gu-detail-stage">
                        <div
                            className="gu-detail-card"
                            onClick={(event) => event.stopPropagation()}
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

                            {/* Product image */}
                            <div className="gu-detail-image-wrap">
                                <div className="gu-tag gu-detail-tag">
                                    <span className="gu-tag-currency">$</span>
                                    {Number(selectedProduct.price).toFixed(2)}
                                </div>

                                <div className="gu-detail-image">
                                    <img
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.name}
                                    />
                                </div>
                            </div>

                            {/* Product information */}
                            <div className="gu-detail-info">
                                <span className="gu-modal-eyebrow">
                                    Gear details
                                </span>

                                <h3 className="gu-detail-name">
                                    {selectedProduct.name}
                                </h3>

                                <p className="gu-detail-description">
                                    {selectedProduct.description}
                                </p>

                                <button
                                    className="gu-btn gu-btn--solid gu-detail-add"
                                    onClick={() =>
                                        handleAddToCart(selectedProduct.id)
                                    }
                                >
                                    Add to cart
                                </button>
                            </div>

                            {/* AI recommendations in their own section */}
                            <div className="gu-detail-recommendations">
                                <RecommendedProducts
                                    productId={selectedProduct.id}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
