// Payment.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserCart, placeOrder, completePayment } from '../services/api';
import './Payment.css';

const PAYMENT_METHODS = [
    { value: 'COD', label: 'Cash on Delivery' },
    { value: 'UPI', label: 'UPI' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'NET_BANKING', label: 'Net Banking' },
    { value: 'WALLET', label: 'Wallet' },
];

function Payment() {
    const navigate = useNavigate();

    // Cart summary (so the person can see what they're paying for)
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState(null);

    // "form" -> filling shipping + payment method
    // "confirm" -> order created, waiting for payment confirmation
    // "success" -> payment confirmed
    const [stage, setStage] = useState('form');

    const [formData, setFormData] = useState({
        shippingAddress: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'COD',
    });
    const [formError, setFormError] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const [orderResult, setOrderResult] = useState(null); // CheckoutResponseDto
    const [confirmError, setConfirmError] = useState('');
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    const getLoggedInUserId = () => {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) return null;
        try {
            const savedUser = JSON.parse(rawUser);
            return savedUser.id || savedUser.userId || null;
        } catch {
            return null;
        }
    };

    const loadCart = useCallback(async () => {
        const idToUse = getLoggedInUserId();
        if (!idToUse) {
            setCartError('Please log in to check out.');
            setCartLoading(false);
            return;
        }

        try {
            setCartLoading(true);
            const response = await fetchUserCart(idToUse);
            setCart(response.data);
            setCartError(null);
        } catch (err) {
            console.error('Cart Fetch Error:', err);
            setCartError("Your gear bag couldn't be loaded.");
        } finally {
            setCartLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const grandTotal = cart?.cartItems?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2) || '0.00';

    const handleFieldChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setFormError('');

        const idToUse = getLoggedInUserId();
        if (!idToUse) {
            setFormError('Please log in to check out.');
            return;
        }

        setIsPlacingOrder(true);
        try {
            // placeOrder posts CheckoutRequestDto-shaped formData to /orders/checkout.
            // No userId in the URL - your backend resolves the user from the JWT
            // (attached automatically by the request interceptor in api.js).
            const response = await placeOrder(formData);
            setOrderResult(response.data);
            setStage('confirm');
        } catch (err) {
            console.error('Checkout failed:', err);
            const message = err?.response?.data?.message || err?.message || 'Could not place your order. Please try again.';
            setFormError(message);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!orderResult?.orderId) return;
        setConfirmError('');
        setIsConfirmingPayment(true);
        try {
            const response = await completePayment(orderResult.orderId);
            setPaymentResult(response.data);
            setStage('success');
        } catch (err) {
            console.error('Payment confirmation failed:', err);
            const message = err?.response?.data?.message || err?.message || 'Payment could not be confirmed. Please try again.';
            setConfirmError(message);
        } finally {
            setIsConfirmingPayment(false);
        }
    };

    const selectedMethodLabel = PAYMENT_METHODS.find((m) => m.value === formData.paymentMethod)?.label || formData.paymentMethod;

    return (
        <div className="gu-payment-page">
            <button
                onClick={() => navigate('/cart')}
                className="gu-btn gu-btn--ghost-ink gu-payment-back"
                disabled={isPlacingOrder || isConfirmingPayment}
            >
                <span aria-hidden="true">←</span> Back to Bag
            </button>

            <div className="gu-payment-header">
                <h1 className="gu-payment-title">Checkout</h1>
                <div className="gu-payment-stripe" aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span>
                </div>
            </div>

            {/* ---------- Order summary ---------- */}
            {cartLoading ? (
                <div className="gu-payment-summary gu-payment-summary--loading">
                    <div className="gu-cart-shimmer" style={{ width: '60%', height: '14px' }}></div>
                    <div className="gu-cart-shimmer" style={{ width: '40%', height: '14px', marginTop: '10px' }}></div>
                </div>
            ) : cartError ? (
                <div className="gu-payment-state">
                    <span className="gu-payment-state-eyebrow">Whistle blown</span>
                    <p className="gu-payment-state-message">{cartError}</p>
                    <button onClick={() => navigate('/cart')} className="gu-btn gu-btn--solid-ink">
                        Back to bag
                    </button>
                </div>
            ) : (
                <div className="gu-payment-summary">
                    <span className="gu-payment-summary-label">Order summary</span>
                    <ul className="gu-payment-summary-list">
                        {cart?.cartItems?.map((item) => (
                            <li key={item.id}>
                                <span>{item.product.name} &times; {item.quantity}</span>
                                <span className="gu-cart-mono">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="gu-payment-summary-total">
                        <span>Grand total</span>
                        <span className="gu-cart-mono">${grandTotal}</span>
                    </div>
                </div>
            )}

            {/* ---------- Stage: shipping + payment method form ---------- */}
            {!cartLoading && !cartError && stage === 'form' && (
                <form className="gu-payment-form" onSubmit={handlePlaceOrder}>
                    {formError && <p className="gu-auth-error">{formError}</p>}

                    <div className="gu-field">
                        <label htmlFor="shippingAddress" className="gu-label">Shipping address</label>
                        <textarea
                            id="shippingAddress"
                            className="gu-input gu-textarea"
                            rows={3}
                            value={formData.shippingAddress}
                            onChange={handleFieldChange('shippingAddress')}
                            disabled={isPlacingOrder}
                            required
                        />
                    </div>

                    <div className="gu-payment-field-row">
                        <div className="gu-field">
                            <label htmlFor="city" className="gu-label">City</label>
                            <input
                                type="text"
                                id="city"
                                className="gu-input"
                                value={formData.city}
                                onChange={handleFieldChange('city')}
                                disabled={isPlacingOrder}
                                required
                            />
                        </div>
                        <div className="gu-field">
                            <label htmlFor="state" className="gu-label">State</label>
                            <input
                                type="text"
                                id="state"
                                className="gu-input"
                                value={formData.state}
                                onChange={handleFieldChange('state')}
                                disabled={isPlacingOrder}
                                required
                            />
                        </div>
                    </div>

                    <div className="gu-field">
                        <label htmlFor="pincode" className="gu-label">Pincode</label>
                        <input
                            type="text"
                            id="pincode"
                            className="gu-input"
                            inputMode="numeric"
                            pattern="[0-9]{4,10}"
                            value={formData.pincode}
                            onChange={handleFieldChange('pincode')}
                            disabled={isPlacingOrder}
                            required
                        />
                    </div>

                    <div className="gu-field">
                        <label className="gu-label">Payment method</label>
                        <div className="gu-payment-method-grid">
                            {PAYMENT_METHODS.map((method) => (
                                <label
                                    key={method.value}
                                    className={`gu-payment-method-option ${formData.paymentMethod === method.value ? 'gu-payment-method-option--active' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.value}
                                        checked={formData.paymentMethod === method.value}
                                        onChange={handleFieldChange('paymentMethod')}
                                        disabled={isPlacingOrder}
                                    />
                                    {method.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="gu-submit-btn" disabled={isPlacingOrder}>
                        {isPlacingOrder ? (
                            <>
                                <span className="gu-spinner" aria-hidden="true"></span>
                                Placing order...
                            </>
                        ) : (
                            `Place order — $${grandTotal}`
                        )}
                    </button>
                </form>
            )}

            {/* ---------- Stage: payment confirmation ---------- */}
            {stage === 'confirm' && orderResult && (
                <div className="gu-payment-confirm">
                    <span className="gu-payment-order-eyebrow">Order #{orderResult.orderId}</span>
                    <p className="gu-payment-confirm-amount">
                        Total <strong className="gu-cart-mono">${orderResult.totalAmount ?? grandTotal}</strong>
                    </p>

                    {confirmError && <p className="gu-auth-error">{confirmError}</p>}

                    {formData.paymentMethod === 'UPI' ? (
                        <div className="gu-payment-qr-box">
                            <span className="gu-payment-qr-label">Please pay on this UPI</span>
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YourUPILinkHere"
                                alt="Payment QR Code"
                                className="gu-payment-qr-img"
                            />
                            <span className="gu-payment-upi">UPI ID: gearup@upi</span>
                        </div>
                    ) : formData.paymentMethod === 'COD' ? (
                        <p className="gu-payment-note">
                            Pay <strong className="gu-cart-mono">${orderResult.totalAmount ?? grandTotal}</strong> in cash when your gear arrives.
                        </p>
                    ) : (
                        <p className="gu-payment-note">
                            You'd normally be redirected to a secure {selectedMethodLabel.toLowerCase()} gateway here.
                        </p>
                    )}

                    <button
                        onClick={handleConfirmPayment}
                        className="gu-submit-btn"
                        disabled={isConfirmingPayment}
                    >
                        {isConfirmingPayment ? (
                            <>
                                <span className="gu-spinner" aria-hidden="true"></span>
                                Confirming...
                            </>
                        ) : formData.paymentMethod === 'COD' ? (
                            'Confirm order'
                        ) : (
                            'Confirm payment'
                        )}
                    </button>
                </div>
            )}

            {/* ---------- Stage: success ---------- */}
            {stage === 'success' && (
                <div className="gu-payment-success">
                    <span className="gu-payment-success-check" aria-hidden="true">✓</span>
                    <h2 className="gu-payment-success-title">
                        {paymentResult?.orderStatus ? 'Order confirmed' : 'Payment confirmed'}
                    </h2>
                    <p className="gu-payment-state-message">
                        {paymentResult?.message || orderResult?.message || 'Thanks — your order is on its way.'}
                    </p>
                    {orderResult?.orderId && (
                        <p className="gu-payment-success-order">
                            Order <strong>#{orderResult.orderId}</strong> · <span className="gu-cart-mono">${paymentResult?.totalAmount ?? orderResult?.totalAmount ?? grandTotal}</span>
                        </p>
                    )}
                    <button onClick={() => navigate('/')} className="gu-btn gu-btn--solid-ink">
                        Continue shopping
                    </button>
                </div>
            )}
        </div>
    );
}

export default Payment;