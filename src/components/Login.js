import React, { useState } from 'react';
 import { loginUser } from '../services/api'; // Import the API function

 function Login({ onLoginSuccess, onClose }) {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');

   const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const response = await loginUser(username, password);
        
        if (response.status === 200) {
            // response.data is now the User OBJECT, not "Login successful"
            const user = response.data; 
            
            localStorage.setItem('user', JSON.stringify(user));
            
            if (onLoginSuccess) {
                onLoginSuccess(user); // Pass the whole object to App.js
            }
            if (onClose) onClose();
        }
    } catch (error) {
        setError("Invalid credentials or server error");
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