import React, { useState } from 'react'
import "../styles/contact.css"
import "@fortawesome/fontawesome-free/css/all.css";
import API_URL from '../config/api.js';
import { useLang } from '../context/LanguageContext.jsx';
export const Contact = () => {
    const { t } = useLang();
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setSent(true);
                setForm({ full_name: '', email: '', phone: '', company: '', subject: '', message: '' });
                setTimeout(() => setSent(false), 4000);
            } else {
                const data = await res.json();
                alert(data.message || t('contact.errorSend'));
            }
        } catch (err) {
            console.error('Submit contact error', err);
            alert(t('contact.errorConnection'));
        } finally {
            setSending(false);
        }
    };
  return (
    <div className='container-contact'>
        <div className='contact-header'>
            <span className="contact-badge"><i className="fas fa-headset"></i> {t('contact.badge')}</span>
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.subtitle')}</p>
        </div>
        <div className='contact-content'>
            <div className='contact-info'>
                <div className="contact-item">
                    <div className='contact-icon'>
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-detail">
                        <h3>{t('contact.address')}</h3>    
                        <p>	Số nhà 34 ngõ 378, Đường Mỹ Đình, Phường Mỹ Đình 1, Quận Nam Từ Liêm, Thành phố Hà Nội, Việt Nam</p>
                    </div>
                </div>
                <div className="contact-item">
                    <div className='contact-icon'>
                        <i className="fas fa-phone"></i>
                    </div>
                    <div className="contact-detail">
                        <h3>{t('contact.phone')}</h3>    
                        <p>0888833149</p>
                    </div>
                </div>
                <div className="contact-item">
                    <div className='contact-icon'>
                        <i className="fas fa-envelope"></i>
                    </div>
                    <div className="contact-detail">
                        <h3>Email</h3>    
                        <p>varcty@gmail.com</p>
                    </div>
                </div>
                <div className="contact-item">
                    <div className='contact-icon'>
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="contact-detail">
                        <h3>{t('contact.workHours')}</h3>    
                        <p>{t('contact.workHoursValue')}</p>
                    </div>
                </div>
                {/* Map placeholder */}
                <div className="contact-map">
                    <iframe
                        title="map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.4898398043!2d105.7573401!3d21.0339259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454be0db8cd2d%3A0xbbf78632007a7cb0!2zVMOyYSBuaMOgIFZpbmFjb25leCA3!5e0!3m2!1svi!2svn!4v1744000000000!5m2!1svi!2svn"
                        width="100%"
                        height="180"
                        style={{border: 0, borderRadius: '12px', opacity: 0.85}}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
            <form className='contact-form' onSubmit={handleSubmit}>
                {sent && (
                    <div className="contact-success">
                        <i className="fas fa-check-circle"></i>
                        <span>{t('contact.successMessage')}</span>
                    </div>
                )}
                <div className="contact-form-row">
                    <div className="contact-form-input">
                        <i className="fas fa-user"></i>
                        <input value={form.full_name} onChange={handleChange} type="text" name='full_name' placeholder={t('contact.formName')} required />
                    </div>
                    <div className="contact-form-input">
                        <i className="fas fa-envelope"></i>
                        <input value={form.email} onChange={handleChange} type="email" name='email' placeholder={t('contact.formEmail')} required />
                    </div>
                </div>
                <div className="contact-form-row">
                    <div className="contact-form-input">
                        <i className="fas fa-phone"></i>
                        <input value={form.phone} onChange={handleChange} type="tel" name='phone' placeholder={t('contact.formPhone')} />
                    </div>
                    <div className="contact-form-input">
                        <i className="fas fa-building"></i>
                        <input value={form.company} onChange={handleChange} type="text" name='company' placeholder={t('contact.formCompany')} />
                    </div>
                </div>
                <div className="contact-form-input">
                    <i className="fas fa-tag"></i>
                   <input value={form.subject} onChange={handleChange} type="text" name='subject' placeholder={t('contact.formSubject')} />
                </div>
                <div className="contact-form-input contact-form-textarea">
                    <i className="fas fa-comment-dots"></i>
                    <textarea value={form.message} onChange={handleChange} name="message" rows="5" placeholder={t('contact.formMessage')} required></textarea>
                </div>
                <button type='submit' className='btn-submit' disabled={sending}>
                    <i className="fas fa-paper-plane"></i>
                    {sending ? t('contact.sending') : t('contact.sendMessage')}
                </button>
            </form>
        </div>
        
    </div>
  )
}
export default Contact
