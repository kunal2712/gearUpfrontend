
import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from '../services/api';

const RecommendedProducts = ({
    productId,
    excludeIds = [],
    onViewDetails,
    onAddToCart
}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Stable dependency even if the parent creates a new array on each render.
    const excludeKey = excludeIds.map(Number).sort((a, b) => a - b).join(',');

    useEffect(() => {
        if (!productId) {
            setProducts([]);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadRecommendations = async () => {
            setLoading(true);

            try {
                const response = await fetchRecommendations(productId, 3);
                const excluded = new Set([
                    Number(productId),
                    ...excludeKey.split(',').filter(Boolean).map(Number)
                ]);

                if (!cancelled) {
                    setProducts(
                        (response.data || []).filter(
                            product => !excluded.has(Number(product.id))
                        )
                    );
                }
            } catch (error) {
                console.error('Failed to load recommendations:', error);
                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadRecommendations();

        return () => {
            cancelled = true;
        };
    }, [productId, excludeKey]);

    if (loading) {
        return (
            <section className="gu-recommended-section">
                <h2 className="gu-section-title">You may also like</h2>
                <p>Finding products for you...</p>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="gu-recommended-section">
            <div className="gu-section-heading">
                <h2 className="gu-section-title">You may also like</h2>
                <div className="gu-stripe" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div className="gu-recommended-grid">
                {products.map(prod => (
                    <div key={prod.id} className="gu-card">
                        <div className="gu-card-image-wrap">
                            <div className="gu-tag">
                                <span className="gu-tag-currency">$</span>
                                {Number(prod.price).toFixed(2)}
                            </div>

                            <div className="gu-card-image">
                                <img src={prod.imageUrl} alt={prod.name} />
                            </div>
                        </div>

                        <div className="gu-card-info">
                            <h3 className="gu-product-name">{prod.name}</h3>

                            <p className="gu-product-description">
                                {prod.description}
                            </p>

                            <div className="gu-card-actions">
                                <button
                                    className="gu-btn gu-btn--ghost"
                                    onClick={() => onViewDetails?.(prod)}
                                >
                                    Details
                                </button>

                                <button
                                    className="gu-btn gu-btn--solid"
                                    onClick={() => onAddToCart?.(prod.id)}
                                >
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecommendedProducts;
