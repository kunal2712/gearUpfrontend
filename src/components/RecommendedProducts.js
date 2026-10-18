
import React, { useEffect, useState } from "react";
import { fetchRecommendations }  from '../services/api';;

const RecommendedProducts = ({ productId, excludeIds = [] }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
                const response = await fetchRecommendations(productId, 5);

                if (!cancelled) {
                    const excluded = new Set([
                        Number(productId),
                        ...excludeIds.map(Number)
                    ]);

                    setProducts(
                        response.data.filter(
                            product => !excluded.has(Number(product.id))
                        )
                    );
                }
            } catch (error) {
                console.error("Failed to load recommendations:", error);
                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadRecommendations();

        return () => {
            cancelled = true;
        };
    }, [productId, excludeIds]);

    if (loading) return <p>Finding products for you...</p>;
    if (products.length === 0) return null;

    return (
        <section className="recommended-products">
            <h2>You may also like</h2>

            <div className="recommended-products-grid">
                {products.map(product => (
                    <article
                        className="recommended-product-card"
                        key={product.id}
                    >
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                        />

                        <h3>{product.name}</h3>

                        <p>₹{Number(product.price).toFixed(2)}</p>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default RecommendedProducts;
