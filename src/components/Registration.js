import React, { useState } from 'react';
 import { registerUser } from '../services/api';

 function Registration({ onSwitchToLogin, onClose }) {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     const [email, setEmail] = useState('');
     const [error, setError] = useState('');
     const [showSuccessPopup, setShowSuccessPopup] = useState(false);

     const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setShowSuccessPopup(false);
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
    }
 };

     const handleLoginButtonClick = () => {
         if (onSwitchToLogin) {
             onSwitchToLogin();
         }
         setShowSuccessPopup(false);
     };

     return (
         <div className="registration-form">
             <h2>Register</h2>
             {error && <p className="error-message">{error}</p>}
             <form onSubmit={handleSubmit}>
                 <div className="form-group">
                     <label htmlFor="reg-username">Username:</label>
                     <input
                         type="text"
                         id="reg-username"
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         required
                     />
                 </div>
                 <div className="form-group">
                     <label htmlFor="reg-email">Email:</label>
                     <input
                         type="email"
                         id="reg-email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         required
                     />
                 </div>
                 <div className="form-group">
                     <label htmlFor="reg-password">Password:</label>
                     <input
                         type="password"
                         id="reg-password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                     />
                 </div>
                 <button type="submit" className="submit-button">Register</button>
                 {onClose && <button type="button" onClick={onClose} className="cancel-button">Close</button>}
             </form>
             {showSuccessPopup && (
                 <div className="success-popup">
                     <p>Registration successful!</p>
                     <button onClick={handleLoginButtonClick} className="submit-button">Go to Login</button>
                 </div>
             )}
         </div>
     );
 }

 export default Registration;