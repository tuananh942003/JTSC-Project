import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";
import "../styles/footer.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { useLang } from "../context/LanguageContext.jsx";
const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export const Footer = () => {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      alert(t('footer.newsletterSuccess'));
      setEmail('');
    }
  };

  return (
    <div className="footer-container">
      {/* Newsletter banner */}
      <div className="footer-newsletter">
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <h3>{t('footer.newsletterTitle')}</h3>
            <p>{t('footer.newsletterDesc')}</p>
          </div>
          <form className="newsletter-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder={t('footer.newsletterPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit"><i className="fas fa-paper-plane"></i> {t('footer.newsletterButton')}</button>
          </form>
        </div>
      </div>

      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <img src={logo} alt="VAR" />
          </div>
          <p>
            {t('footer.companyDesc')}
          </p>
          <div className="social-link">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-linkedin-in"></i>
            <i className="fab fa-instagram"></i>
          </div>
        </div>

        <div className="footer-section">
          <h4>{t('footer.servicesTitle')}</h4>
          <ul>
            <li><Link to="/service" onClick={scrollTop}>{t('footer.service1')}</Link></li>
            <li><Link to="/service" onClick={scrollTop}>{t('footer.service2')}</Link></li>
            <li><Link to="/service" onClick={scrollTop}>{t('footer.service3')}</Link></li>
            <li><Link to="/service" onClick={scrollTop}>{t('footer.service4')}</Link></li>
            <li><Link to="/news" onClick={scrollTop}>{t('footer.service5')}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('footer.exploreTitle')}</h4>
          <ul>
            <li><Link to="/" onClick={scrollTop}>{t('nav.home')}</Link></li>
            <li><Link to="/about" onClick={scrollTop}>{t('nav.about')}</Link></li>
            <li><Link to="/service" onClick={scrollTop}>{t('nav.services')}</Link></li>
            <li><Link to="/news" onClick={scrollTop}>{t('nav.news')}</Link></li>
            <li><Link to="/contact" onClick={scrollTop}>{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>{t('footer.contactTitle')}</h4>
          <div className="contact-info">
            <p><i className="fas fa-map-marker-alt"></i> {t('footer.addressValue')}</p>
            <p><i className="fas fa-phone"></i> {t('footer.phoneValue')}</p>
            <p><i className="fas fa-envelope"></i> {t('footer.emailValue')}</p>
            <p><i className="fas fa-clock"></i> {t('footer.hoursValue')}</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 VAR - Technology Solutions. {t('footer.copyright')}</p>
        <div className="footer-bottom-links">
          <Link to="/contact" onClick={scrollTop}>{t('footer.privacy')}</Link>
          <Link to="/contact" onClick={scrollTop}>{t('footer.terms')}</Link>
        </div>
        <button className="back-to-top" onClick={scrollTop} aria-label="Lên đầu trang">
          <i className="fas fa-chevron-up"></i>
        </button>
      </div>
    </div>
  );
};
export default Footer;
