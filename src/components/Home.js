
import React, { useEffect, useState } from 'react';
import {
    fetchCategories,
    fetchProducts,
    fetchProductsByCategory,
    addToCart
} from '../services/api';
import ProductCard from '../components/ProductCard';
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const [categoriesResponse, allProductsResponse] =
                    await Promise.all([
                        fetchCategories(),
                        fetchProducts()
                    ]);

                const categoryList = extractArrayData(categoriesResponse);
                const productList = extractArrayData(allProductsResponse);

                setCategories(categoryList);
                setAllProducts(productList);
                setProducts(productList);
            } catch (err) {
                setError(err.message || 'Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            setLoading(true);

            fetchProductsByCategory(selectedCategory)
                .then((res) => {
                    setProducts(extractArrayData(res));
                })
                .catch((err) => {
                    setError(err.message || 'Failed to load products.');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setProducts(Array.isArray(allProducts) ? allProducts : []);
        }
    }, [selectedCategory, allProducts]);

    useEffect(() => {
        if (!selectedProduct) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedProduct(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedProduct]);

    const handleAddToCart = async (productId) => {
        let savedUser;

        try {
            const rawUser = localStorage.getItem('user');

            if (!rawUser) {
                openAuthModal?.();
                return;
            }

            savedUser = JSON.parse(rawUser);
        } catch {
            openAuthModal?.();
            return;
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
            console.error('Error adding to cart:', err);
            alert('Error adding to cart');
        }
    };

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

            <section className="gu-product-section">
                <div className="gu-section-heading">
                    <h2 className="gu-section-title">
                        {selectedCategory && Array.isArray(categories)
                            ? categories.find(
                                  (cat) => cat.id === selectedCategory
                              )?.name
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
                                <ProductCard
                                    key={prod.id}
                                    product={prod}
                                    onViewDetails={setSelectedProduct}
                                    onAddToCart={handleAddToCart}
                                />
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

            {showToast && (
                <div className="gu-toast" role="status">
                    <span className="gu-toast-dot" />
                    Gear added to bag
                </div>
            )}

            {selectedProduct && (
                <div
                    className="gu-detail-overlay"
                    onClick={() => setSelectedProduct(null)}
                >
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
                                    {Number(selectedProduct.price).toFixed(2)}
                                </div>

                                <div className="gu-detail-image">
                                    <img
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.name}
                                    />
                                </div>
                            </div>

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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
