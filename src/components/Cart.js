// Cart.js
import React, { useEffect, useState, useCallback } from 'react';
import { fetchUserCart, removeFromCart } from '../services/api';
import { useNavigate } from 'react-router-dom';

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

    if (loading) return <div className="cart-page" style={{padding: '40px'}}><p>Loading your gear...</p></div>;

    const grandTotal = cart?.cartItems?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2) || "0.00";

    return (
        <div className="cart-page" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            
            <button 
                onClick={() => navigate('/')} 
                style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                ← Back to Shopping
            </button>

            <h1>Your Gear Bag</h1>
            
            {error ? (
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            ) : cart && cart.cartItems && cart.cartItems.length > 0 ? (
                <div className="cart-items-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border: '1px solid #ddd' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #333', textAlign: 'left' }}>
                                <th style={columnStyle}>Product</th>
                                <th style={columnStyle}>Price</th>
                                <th style={columnStyle}>Quantity</th>
                                <th style={columnStyle}>Total</th>
                                <th style={{ ...columnStyle, borderRight: 'none' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.cartItems.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={cellStyle}><strong>{item.product.name}</strong></td>
                                    <td style={cellStyle}>${item.product.price.toFixed(2)}</td>
                                    <td style={cellStyle}>{item.quantity}</td>
                                    <td style={cellStyle}>${(item.product.price * item.quantity).toFixed(2)}</td>
                                    <td style={{ ...cellStyle, borderRight: 'none' }}>
                                        <button 
                                            onClick={() => handleRemove(item.product.id)} 
                                            style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Grand Total: ${grandTotal}</h2>
                        <button 
                            onClick={() => setShowCheckout(true)} // Open Checkout Modal
                            style={{ padding: '12px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p style={{ fontSize: '18px' }}>Your bag is empty. Go get some gear!</p>
                </div>
            )}

            {/* --- CHECKOUT MODAL --- */}
            {showCheckout && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Finalize Your Order</h2>
                        <p style={{ color: '#555', marginBottom: '15px' }}>Total Amount: <strong>${grandTotal}</strong></p>
                        
                        <div style={{ border: '2px dashed #ccc', padding: '20px', backgroundColor: '#f9f9f9', marginBottom: '15px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Please pay on this UPI</p>
                            {/* Placeholder QR Code - Replace the src with your actual QR image link */}
                            <img 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YourUPILinkHere" 
                                alt="Payment QR Code" 
                                style={{ width: '200px', height: '200px' }}
                            />
                            <p style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>UPI ID: gearup@upi</p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setShowCheckout(false)} 
                                style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    alert("Thank you! Our team will verify your payment and process the order.");
                                    setShowCheckout(false);
                                }} 
                                style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                I have Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple Modal Styles
const modalOverlayStyle = {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 2000
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
};
const columnStyle = {
    padding: '12px 10px',
    borderRight: '1px solid #ddd', // This creates the vertical line
    fontWeight: 'bold'
};

const cellStyle = {
    padding: '15px 10px',
    borderRight: '1px solid #ddd' // This creates the vertical line
};
export default Cart;