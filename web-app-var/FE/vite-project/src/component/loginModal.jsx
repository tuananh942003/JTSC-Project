//creat modal for login
import React, { useState } from 'react';
import "../styles/loginModal.css"
import "@fortawesome/fontawesome-free/css/all.css";
import API_URL from "../config/api.js";
import { useLang } from "../context/LanguageContext.jsx";

export const LoginModal = ({isOpen, onClose, openModalRegister, onLoginSuccess}) => {
    const { t } = useLang();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu cả 2 token và user vào localStorage
                localStorage.setItem('accessToken', data.acesstoken);
                localStorage.setItem('refreshToken', data.refreshtoken);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
                onClose();
                setFormData({ username: '', password: '' });
            } else {
                setError(data.message || t('login.errorLogin'));
            }
        } catch (err) {
            setError(t('login.errorConnection'));
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className='modal-overlay'>
            <div className='modal-content'>
                <button className='modal-close' onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                <h2>{t('login.title')}</h2>
                {error && <div className="error-message">{error}</div>}
                <form className='login-form' onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='username'>{t('login.username')}</label>
                        <input 
                            type='text' 
                            id='username' 
                            name='username' 
                            placeholder={t('login.usernamePlaceholder')}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>{t('login.password')}</label>
                        <input 
                            type='password' 
                            id='password' 
                            name='password' 
                            placeholder={t('login.passwordPlaceholder')}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type='submit' className='login-button' disabled={loading}>
                        {loading ? t('login.logging') : t('login.loginBtn')}
                    </button>
                    <button type='button' className='signup-button' onClick={openModalRegister}>
                        {t('login.registerBtn')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;  