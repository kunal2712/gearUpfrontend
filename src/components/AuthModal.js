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
         <div className="auth-modal-overlay">
             <div className="auth-modal-content">
                 <button onClick={onClose} className="close-button">X</button>
                 {isLogin ? (
                     <Login onClose={onClose} onLoginSuccess={onLoginSuccess} />
                 ) : (
                     <Registration onClose={onClose} onSwitchToLogin={switchToLogin} />
                 )}
                 <button onClick={toggleAuthMode} className="toggle-auth-button">
                     {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                 </button>
             </div>
         </div>
     );
 }

 export default AuthModal;