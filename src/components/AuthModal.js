import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';

function AuthModal({ onClose, onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
    };

    const switchToLogin = () => {
        setIsLogin(true);
    };

    return (
        <div className="gu-modal-overlay" onClick={onClose}>
            <div className="gu-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="gu-modal-bar" aria-hidden="true"></div>

                <button onClick={onClose} className="gu-modal-close" aria-label="Close">
                    &times;
                </button>

                <span className="gu-modal-eyebrow">
                    {isLogin ? 'Welcome back' : 'Join the team'}
                </span>

                {isLogin ? (
                    <Login onClose={onClose} onLoginSuccess={onLoginSuccess} />
                ) : (
                    <Registration onClose={onClose} onSwitchToLogin={switchToLogin} />
                )}

                <button onClick={toggleAuthMode} className="gu-modal-toggle">
                    {isLogin ? "Need an account? Register" : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
}

export default AuthModal;