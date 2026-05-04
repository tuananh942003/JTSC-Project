//create modal for register
import React, { useState } from 'react';
import "../styles/loginModal.css"
import "@fortawesome/fontawesome-free/css/all.css";
import API_URL from "../config/api.js";
import { useLang } from "../context/LanguageContext.jsx";

export const RegisterModal = ({isOpen, onClose, openModalLogin}) => {
    const { t } = useLang();
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        // Kiểm tra mật khẩu xác nhận
        if (formData.password !== formData.confirmPassword) {
            setError(t('register.passwordMismatch'));
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'user' }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
                // Đợi 2 giây rồi chuyển sang modal đăng nhập
                setTimeout(() => {
                    setSuccess(false);
                    openModalLogin();
                }, 2000);
            } else {
                setError(data.message || t('register.errorRegister'));
            }
        } catch (err) {
            setError(t('register.errorConnection'));
            console.error('Register error:', err);
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
                <h2>{t('register.title')}</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">✅ {t('register.success')}</div>}
                <form className='login-form' onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='name'>{t('register.fullName')}</label>
                        <input 
                            type='text' 
                            id='name' 
                            name='name' 
                            placeholder={t('register.fullNamePlaceholder')}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='username'>{t('register.username')}</label>
                        <input 
                            type='text' 
                            id='username' 
                            name='username' 
                            placeholder={t('register.usernamePlaceholder')}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>    
                        <label htmlFor='email'>{t('register.email')}</label>
                        <input 
                            type='email' 
                            id='email' 
                            name='email' 
                            placeholder={t('register.emailPlaceholder')}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>  
                    <div className='form-group'>
                        <label htmlFor='password'>{t('register.password')}</label>
                        <input 
                            type='password' 
                            id='password' 
                            name='password' 
                            placeholder={t('register.passwordPlaceholder')}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='confirmPassword'>{t('register.confirmPassword')}</label>
                        <input 
                            type='password' 
                            id='confirmPassword' 
                            name='confirmPassword' 
                            placeholder={t('register.confirmPasswordPlaceholder')}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type='submit' className='login-button' disabled={loading}>
                        {loading ? t('register.registering') : t('register.registerBtn')}
                    </button>
                    <button type='button' className='signup-button' onClick={openModalLogin}>
                        {t('register.loginBtn')}
                    </button>
                </form> 
            </div>
        </div>
    );
};

export default RegisterModal;