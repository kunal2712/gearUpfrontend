
import React from 'react';

function ProductCard({
    product,
    onViewDetails,
    onAddToCart
}) {
    if (!product) return null;

    const price = Number(product.price);

    return (
        <article className="gu-card">
            <div className="gu-card-image-wrap">
                <div className="gu-tag">
                    <span className="gu-tag-currency">$</span>
                    {Number.isFinite(price) ? price.toFixed(2) : '0.00'}
                </div>

                <div className="gu-card-image">
                    <img
                        src={product.imageUrl}
                        alt={product.name || 'Product image'}
                        loading="lazy"
                    />
                </div>
            </div>

            <div className="gu-card-info">
                <h3 className="gu-product-name">
                    {product.name}
                </h3>

                <p className="gu-product-description">
                    {product.description}
                </p>

                <div className="gu-card-actions">
                    <button
                        type="button"
                        className="gu-btn gu-btn--ghost"
                        onClick={() => onViewDetails?.(product)}
                    >
                        Details
                    </button>

                    <button
                        type="button"
                        className="gu-btn gu-btn--solid"
                        onClick={() => onAddToCart?.(product.id)}
                    >
                        Add to cart
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
