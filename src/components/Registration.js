import React, { useState } from 'react';
import { registerUser } from '../services/api';

function Registration({ onSwitchToLogin, onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setShowSuccessPopup(false);
        setIsLoading(true);
        try {
            const newUser = { username, password, email };
            const response = await registerUser(newUser);
            if (response.status === 201) {
                setShowSuccessPopup(true);
            } else {
                const errorData = response?.data; // Add null check
                setError(errorData?.message || 'Registration failed.');
            }
        } catch (error) {
            const responseError = error?.response; // Add null check for error.response
            const dataError = responseError?.data;   // Add null check for responseError.data
            setError(dataError?.message || error.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginButtonClick = () => {
        if (onSwitchToLogin) {
            onSwitchToLogin();
        }
        setShowSuccessPopup(false);
    };

    return (
        <div className="gu-auth-form">
            <h2 className="gu-auth-title">Register</h2>
            {error && <p className="gu-auth-error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="gu-field">
                    <label htmlFor="reg-username" className="gu-label">Username</label>
                    <input
                        type="text"
                        id="reg-username"
                        className="gu-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="gu-field">
                    <label htmlFor="reg-email" className="gu-label">Email</label>
                    <input
                        type="email"
                        id="reg-email"
                        className="gu-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="gu-field">
                    <label htmlFor="reg-password" className="gu-label">Password</label>
                    <input
                        type="password"
                        id="reg-password"
                        className="gu-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <button type="submit" className="gu-submit-btn" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="gu-spinner" aria-hidden="true"></span>
                            Registering...
                        </>
                    ) : (
                        'Register'
                    )}
                </button>
                {onClose && (
                    <button type="button" onClick={onClose} className="gu-cancel-btn" disabled={isLoading}>
                        Close
                    </button>
                )}
            </form>
            {showSuccessPopup && (
                <div className="gu-success-popup">
                    <p>Registration successful!</p>
                    <button onClick={handleLoginButtonClick} className="gu-submit-btn">Go to Login</button>
                </div>
            )}
        </div>
    );
}

export default Registration;