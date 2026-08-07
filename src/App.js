import React, { useState, useEffect } from 'react'; // Added useEffect
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal';
import Home from './components/Home';
import './App.css';

import Cart from './components/Cart'; // Don't forget the import

// ... inside <Routes>


function App() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUsername, setLoggedInUsername] = useState('');
    const navigate = useNavigate();



    const openAuthModal = () => {
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };



    const handleLogout = () => {
        setIsLoggedIn(false);
        setLoggedInUsername('');
        localStorage.removeItem('user'); // Clear the session
        navigate('/');
        console.log('Logged out');
    };

    // Inside App.js
        useEffect(() => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    // Check if user object exists and has a username property
                    if (user && user.username) {
                        setIsLoggedIn(true);
                        setLoggedInUsername(user.username);
                    }
                } catch (e) {
                    console.error("Error parsing user from storage", e);
                }
            }
        }, []);

        const handleLoginSuccess = (user) => {
            setIsLoggedIn(true);
            setLoggedInUsername(user.username); // This fixes your "Welcome" visibility
            closeAuthModal();
            navigate('/');
        };

    return (
        <div className="gu-app">
            <nav className="gu-navbar">
                <div className="gu-navbar-brand">
                    <h1 className="gu-logo">GearUp<span className="gu-logo-dot">.</span></h1>
                    <h2 className="gu-tagline">Explore Our Sports Gear</h2>
                </div>

                <div className="gu-auth-buttons">
                    {!isLoggedIn ? (
                        <button onClick={openAuthModal} className="gu-btn gu-btn--solid">
                            Login / Register
                        </button>
                    ) : (
                        <div className="gu-user-nav">
                            <button onClick={() => navigate('/cart')} className="gu-cart-btn">
                                <span className="gu-cart-icon" aria-hidden="true">🛒</span> Cart
                            </button>
                            <span className="gu-username">
                                <span className="gu-username-eyebrow">Welcome</span>
                                {loggedInUsername}
                            </span>
                            <button onClick={handleLogout} className="gu-btn gu-btn--ghost">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>
            <main className="main-content">
                <Routes>
                    {/* Home now has access to openAuthModal via props */}
                    <Route path="/" element={<Home openAuthModal={openAuthModal} />} />
                    <Route path="/login" element={<AuthModal onClose={closeAuthModal} onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/" element={<Home openAuthModal={openAuthModal} />} />
                    <Route path="/cart" element={<Cart />} />
                </Routes>
                {isAuthModalOpen && (
                    <AuthModal onClose={closeAuthModal} onLoginSuccess={handleLoginSuccess} />
                )}
            </main>
            <footer className="gu-footer">
                <p>&copy; {new Date().getFullYear()} GearUp — All Rights Reserved</p>
            </footer>
        </div>
    );
}

function RootApp() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default RootApp;