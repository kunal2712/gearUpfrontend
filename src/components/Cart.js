// Cart.js
import React, { useEffect, useState, useCallback } from 'react';
import { fetchUserCart, removeFromCart } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false); // State for Checkout Modal
    const navigate = useNavigate();

    const loadCart = useCallback(async () => {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) {
            setError("Please log in to view your cart.");
            setLoading(false);
            return;
        }

        try {
            const savedUser = JSON.parse(rawUser);
            const idToUse = savedUser.id || savedUser.userId;

            if (!idToUse) {
                setError("Session invalid. Please log in again.");
                setLoading(false);
                return;
            }

            setLoading(true);
            const response = await fetchUserCart(idToUse);
            setCart(response.data);
            setError(null);
        } catch (err) {
            console.error("Cart Fetch Error:", err);
            setError("Your gear bag couldn't be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handleRemove = async (productId) => {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) return;
        const savedUser = JSON.parse(rawUser);
        const idToUse = savedUser.id || savedUser.userId;

        try {
            await removeFromCart(idToUse, productId);
            await loadCart();
        } catch (err) {
            alert("Failed to remove item.");
        }
    };

    const grandTotal = cart?.cartItems?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2) || "0.00";

    return (
        <div className="gu-cart-page">
            <button onClick={() => navigate('/')} className="gu-btn gu-btn--ghost-ink gu-cart-back">
                <span aria-hidden="true">←</span> Back to Shopping
            </button>

            <div className="gu-cart-header">
                <h1 className="gu-cart-title">Your Gear Bag</h1>
                <div className="gu-cart-stripe" aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span>
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
                                    <td><div className="gu-cart-shimmer" style={{ width: '80%' }}></div></td>
                                    <td><div className="gu-cart-shimmer" style={{ width: '50%' }}></div></td>
                                    <td><div className="gu-cart-shimmer" style={{ width: '30%' }}></div></td>
                                    <td><div className="gu-cart-shimmer" style={{ width: '50%' }}></div></td>
                                    <td><div className="gu-cart-shimmer" style={{ width: '60%' }}></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : error ? (
                <div className="gu-cart-state">
                    <span className="gu-cart-state-eyebrow">Whistle blown</span>
                    <p className="gu-cart-state-message">{error}</p>
                    <button onClick={() => window.location.reload()} className="gu-btn gu-btn--solid-ink">
                        Retry
                    </button>
                </div>
            ) : cart && cart.cartItems && cart.cartItems.length > 0 ? (
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
                                        <td className="gu-cart-product-name"><strong>{item.product.name}</strong></td>
                                        <td className="gu-cart-mono">${item.product.price.toFixed(2)}</td>
                                        <td className="gu-cart-mono">{item.quantity}</td>
                                        <td className="gu-cart-mono gu-cart-line-total">${(item.product.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <button
                                                onClick={() => handleRemove(item.product.id)}
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
                        <span className="gu-cart-summary-label">Grand total</span>
                        <h2 className="gu-cart-summary-total">${grandTotal}</h2>
                        <button
                            onClick={() => setShowCheckout(true)}
                            className="gu-btn gu-btn--solid-volt gu-cart-checkout-btn"
                        >
                            Proceed to checkout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="gu-cart-state">
                    <span className="gu-cart-state-eyebrow">Empty bag</span>
                    <p className="gu-cart-state-message">Your bag is empty. Go get some gear!</p>
                    <button onClick={() => navigate('/')} className="gu-btn gu-btn--solid-ink">
                        Browse gear
                    </button>
                </div>
            )}

            {/* --- CHECKOUT MODAL --- */}
            {showCheckout && (
                <div className="gu-modal-overlay" onClick={() => setShowCheckout(false)}>
                    <div className="gu-modal-content gu-checkout-content" onClick={(e) => e.stopPropagation()}>
                        <div className="gu-modal-bar" aria-hidden="true"></div>

                        <span className="gu-modal-eyebrow">Final step</span>
                        <h2 className="gu-checkout-title">Finalize Your Order</h2>
                        <p className="gu-checkout-amount">
                            Total amount <strong>${grandTotal}</strong>
                        </p>

                        <div className="gu-checkout-qr-box">
                            <span className="gu-checkout-qr-label">Please pay on this UPI</span>
                            {/* Placeholder QR Code - Replace the src with your actual QR image link */}
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YourUPILinkHere"
                                alt="Payment QR Code"
                                className="gu-checkout-qr-img"
                            />
                            <span className="gu-checkout-upi">UPI ID: gearup@upi</span>
                        </div>

                        <div className="gu-checkout-actions">
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="gu-btn gu-btn--ghost-ink gu-checkout-btn"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert("Thank you! Our team will verify your payment and process the order.");
                                    setShowCheckout(false);
                                }}
                                className="gu-btn gu-btn--solid-ink gu-checkout-btn"
                            >
                                I have paid
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;