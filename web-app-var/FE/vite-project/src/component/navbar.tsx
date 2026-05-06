import React, { useState, useEffect, useCallback } from "react";
import "../styles/navbar.css";
import logo from "../images/Logo (1).png";
import "@fortawesome/fontawesome-free/css/all.css";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export const Navbar = () => {
  const { t, lang, toggleLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const location = useLocation();

  // Apply theme on mount and when darkMode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Scroll-aware navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize above breakpoint
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <div className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="nav-logo">
          <Link to="/"><img src={logo} alt="JTSC" /></Link>
        </div>

        {/* Hamburger toggle */}
        <button className={`nav-hamburger${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>

        <div className={`nav-menu${mobileOpen ? ' nav-menu--open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t('nav.home')}</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>{t('nav.about')}</Link>
          <Link to="/service" className={location.pathname === '/service' ? 'active' : ''}>{t('nav.services')}</Link>
          <Link to="/news" className={location.pathname === '/news' ? 'active' : ''}>{t('nav.news')}</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>{t('nav.contact')}</Link>

        </div>

        {/* Language + Theme toggles */}
        <div className="nav-toggles">
          <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language" title={lang === 'vi' ? 'English' : 'Tiếng Việt'}>
            {lang === 'vi' ? 'EN' : 'VI'}
          </button>

          {/* Theme toggle */}
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode" title={darkMode ? t('nav.lightMode') : t('nav.darkMode')}>
            <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div className="nav-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
};

export default Navbar;
