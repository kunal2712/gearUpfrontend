
import React, { useEffect, useState, useCallback } from 'react';
import {
    fetchUserCart,
    removeFromCart,
    addToCart
} from '../services/api';
import RecommendedProducts from '../components/RecommendedProducts';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const navigate = useNavigate();

    const loadCart = useCallback(async () => {
        const rawUser = localStorage.getItem('user');

        if (!rawUser) {
            setError('Please log in to view your cart.');
            setLoading(false);
            return;
        }

        try {
            const savedUser = JSON.parse(rawUser);
            const userId = savedUser.id || savedUser.userId;

            if (!userId) {
                setError('Session invalid. Please log in again.');
                setLoading(false);
                return;
            }

            setLoading(true);

            const response = await fetchUserCart(userId);
            setCart(response.data);
            setError(null);
        } catch (err) {
            console.error('Cart Fetch Error:', err);
            setError("Your gear bag couldn't be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    useEffect(() => {
        if (!selectedProduct) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
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

    const handleRemove = async (productId) => {
        const rawUser = localStorage.getItem('user');

        if (!rawUser) return;

        try {
            const savedUser = JSON.parse(rawUser);
            const userId = savedUser.id || savedUser.userId;

            if (!userId) {
                alert('Session invalid. Please log in again.');
                return;
            }

            await removeFromCart(userId, productId);
            await loadCart();
        } catch (err) {
            console.error('Remove from cart error:', err);
            alert('Failed to remove item.');
        }
    };

    const handleAddRecommendedToCart = async (productId) => {
        const rawUser = localStorage.getItem('user');

        if (!rawUser) {
            alert('Please log in to add products to your cart.');
            return;
        }

        try {
            const savedUser = JSON.parse(rawUser);
            const userId = savedUser.id || savedUser.userId;

            if (!userId) {
                alert('Session invalid. Please log in again.');
                return;
            }

            await addToCart(userId, productId, 1);
            await loadCart();
            alert('Product added to your cart!');
        } catch (err) {
            console.error('Failed to add recommended product:', err);
            alert('Unable to add this product to your cart.');
        }
    };

    const grandTotal =
        cart?.cartItems
            ?.reduce(
                (acc, item) =>
                    acc + Number(item.product.price) * item.quantity,
                0
            )
            .toFixed(2) || '0.00';

    return (
        <div className="gu-cart-page">
            <button
                onClick={() => navigate('/')}
                className="gu-btn gu-btn--ghost-ink gu-cart-back"
            >
                <span aria-hidden="true">←</span> Back to Shopping
            </button>

            <div className="gu-cart-header">
                <h1 className="gu-cart-title">Your Gear Bag</h1>

                <div className="gu-cart-stripe" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
            </div>

            {loading ? (
                <div className="gu-cart-table-container">
                    <table className="gu-cart-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i}>
                                    <td>
                                        <div
                                            className="gu-cart-shimmer"
                                            style={{ width: '80%' }}
                                        />
                                    </td>
                                    <td>
                                        <div
                                            className="gu-cart-shimmer"
                                            style={{ width: '50%' }}
                                        />
                                    </td>
                                    <td>
                                        <div
                                            className="gu-cart-shimmer"
                                            style={{ width: '30%' }}
                                        />
                                    </td>
                                    <td>
                                        <div
                                            className="gu-cart-shimmer"
                                            style={{ width: '50%' }}
                                        />
                                    </td>
                                    <td>
                                        <div
                                            className="gu-cart-shimmer"
                                            style={{ width: '60%' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : error ? (
                <div className="gu-cart-state">
                    <span className="gu-cart-state-eyebrow">
                        Whistle blown
                    </span>

                    <p className="gu-cart-state-message">{error}</p>

                    <button
                        onClick={loadCart}
                        className="gu-btn gu-btn--solid-ink"
                    >
                        Retry
                    </button>
                </div>
            ) : cart?.cartItems?.length > 0 ? (
                <div className="gu-cart-items-container">
                    <div className="gu-cart-table-container">
                        <table className="gu-cart-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cart.cartItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="gu-cart-product-name">
                                            <strong>
                                                {item.product.name}
                                            </strong>
                                        </td>

                                        <td className="gu-cart-mono">
                                            $
                                            {Number(
                                                item.product.price
                                            ).toFixed(2)}
                                        </td>

                                        <td className="gu-cart-mono">
                                            {item.quantity}
                                        </td>

                                        <td className="gu-cart-mono gu-cart-line-total">
                                            $
                                            {(
                                                Number(item.product.price) *
                                                item.quantity
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleRemove(
                                                        item.product.id
                                                    )
                                                }
                                                className="gu-btn gu-btn--danger"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="gu-cart-summary">
                        <span className="gu-cart-summary-label">
                            Grand total
                        </span>

                        <h2 className="gu-cart-summary-total">
                            ${grandTotal}
                        </h2>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="gu-btn gu-btn--solid-volt gu-cart-checkout-btn"
                        >
                            Proceed to checkout
                        </button>
                    </div>

                    <RecommendedProducts
                        productId={cart.cartItems[0]?.product?.id}
                        excludeIds={cart.cartItems.map(
                            (item) => item.product.id
                        )}
                        onAddToCart={handleAddRecommendedToCart}
                        onViewDetails={setSelectedProduct}
                    />
                </div>
            ) : (
                <>
                    <div className="gu-cart-state">
                        <span className="gu-cart-state-eyebrow">
                            Empty bag
                        </span>

                        <p className="gu-cart-state-message">
                            Your bag is empty. Go get some gear!
                        </p>

                        <button
                            onClick={() => navigate('/')}
                            className="gu-btn gu-btn--solid-ink"
                        >
                            Browse gear
                        </button>
                    </div>

                    <RecommendedProducts
                        productId={null}
                        excludeIds={[]}
                        onAddToCart={handleAddRecommendedToCart}
                        onViewDetails={setSelectedProduct}
                    />
                </>
            )}

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
                                        handleAddRecommendedToCart(
                                            selectedProduct.id
                                        )
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

export default Cart;
