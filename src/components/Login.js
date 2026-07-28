import React, { useState } from 'react';
import { loginUser } from '../services/api';

function Login({ onLoginSuccess, onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Clear previous errors

        try {const userData = await loginUser(username, password);

if (userData) {
    // Attach the username typed in the form to the backend response object
        const user = { ...userData, username }; 

        localStorage.setItem('user', JSON.stringify(user));
        if (onLoginSuccess) onLoginSuccess(user);
        if (onClose) onClose();
    }} catch (err) {
            console.error("Login failed:", err);
            setError(typeof err === 'string' ? err : "Invalid credentials or server error");
        }
    };

    return (
        <div className="login-form">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login-username">Username:</label>
                    <input type="text" id="login-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Password:</label>
                    <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="submit-button">Login</button>
                {onClose && <button type="button" onClick={onClose} className="cancel-button">Close</button>}
            </form>
        </div>
    );
}

export default Login;