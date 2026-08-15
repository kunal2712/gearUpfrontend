import React, { useState } from 'react';
import { loginUser } from '../services/api';

function Login({ onLoginSuccess, onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Clear previous errors
        setIsLoading(true);

        try {
            const userData = await loginUser(username, password);

            if (userData) {
                // Attach the username typed in the form to the backend response object
                const user = { ...userData, username };

                localStorage.setItem('user', JSON.stringify(user));
                if (onLoginSuccess) onLoginSuccess(user);
                if (onClose) onClose();
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError(typeof err === 'string' ? err : "Invalid credentials or server error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="gu-auth-form">
            <h2 className="gu-auth-title">Login</h2>
            {error && <p className="gu-auth-error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="gu-field">
                    <label htmlFor="login-username" className="gu-label">Username</label>
                    <input
                        type="text"
                        id="login-username"
                        className="gu-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="gu-field">
                    <label htmlFor="login-password" className="gu-label">Password</label>
                    <input
                        type="password"
                        id="login-password"
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
                            Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </button>
                {onClose && (
                    <button type="button" onClick={onClose} className="gu-cancel-btn" disabled={isLoading}>
                        Close
                    </button>
                )}
            </form>
        </div>
    );
}

export default Login;