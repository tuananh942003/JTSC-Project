import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './service-page.css';
import API_URL from '../../config/api.js';
import { useLang } from '../../context/LanguageContext.jsx';

export const ServicePage = () => {
    const { t } = useLang();
    const faqData = [
        { q: t('service.faq1Q'), a: t('service.faq1A') },
        { q: t('service.faq2Q'), a: t('service.faq2A') },
        { q: t('service.faq3Q'), a: t('service.faq3A') },
        { q: t('service.faq4Q'), a: t('service.faq4A') },
    ];
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [openFaq, setOpenFaq] = useState(null);
    const itemsPerPage = 6;
    const observerRef = useRef(null);

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        observerRef.current.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
        document.querySelectorAll("[data-reveal]").forEach((el) => {
            observerRef.current.observe(el);
        });
        return () => observerRef.current?.disconnect();
    }, [loading]);

    const getPaginatedData = (data) => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return data.slice(indexOfFirstItem, indexOfLastItem);
    };

    const getTotalPages = () => {
        return Math.ceil(services.length / itemsPerPage);
    };

    const Pagination = () => {
        const totalPages = getTotalPages();
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        if (totalPages <= 1) return null;

        return (
            <div className="pagination">
                <button 
                    onClick={() => setCurrentPage(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    {t('service.prev')}
                </button>
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    >
                        {page}
                    </button>
                ))}
                <button 
                    onClick={() => setCurrentPage(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    {t('service.next')}
                </button>
            </div>
        );
    };

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/services`);
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu dịch vụ');
            }
            const data = await response.json();
            setServices(data);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="service-page">
            <div className="service-hero">
                <span className="svc-hero-badge"><i className="fas fa-briefcase"></i> {t('service.heroBadge')}</span>
                <h1>{t('service.heroTitle')}</h1>
                <p>{t('service.heroDesc')}</p>
                <div className="svc-hero-stats">
                    <div className="svc-hero-stat"><strong>320+</strong><span>{t('service.statPackages')}</span></div>
                    <div className="svc-hero-stat-divider"></div>
                    <div className="svc-hero-stat"><strong>85%</strong><span>{t('service.statWin')}</span></div>
                    <div className="svc-hero-stat-divider"></div>
                    <div className="svc-hero-stat"><strong>12+</strong><span>{t('service.statYears')}</span></div>
                </div>
            </div>

            <div className="service-container">
                {loading && (
                    <div className="service-loading">
                        <div className="spinner"></div>
                        <p>{t('service.loading')}</p>
                    </div>
                )}

                {error && (
                    <div className="service-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && services.length === 0 && (
                    <div className="service-empty">
                        <i className="fa-solid fa-box-open"></i>
                        <p>{t('service.noServices')}</p>
                    </div>
                )}

                {!loading && !error && services.length > 0 && (
                    <>
                        <div className="services-grid" data-reveal>
                            {getPaginatedData(services).map((service, idx) => (
                                <div key={service._id} className="service-card" style={{'--card-i': idx}}>
                                    <div className="service-card-number">{String(idx + 1 + (currentPage - 1) * itemsPerPage).padStart(2, '0')}</div>
                                    <div className="service-icon-wrapper">
                                        <i className={service.icon}></i>
                                    </div>
                                    <h3 className="service-title">{service.title}</h3>
                                    <p className="service-content">{service.content}</p>
                                    {service.description && service.description.length > 0 && (
                                        <ul className="service-features">
                                            {service.description.map((desc, index) => (
                                                <li key={index}>
                                                    <i className="fa-solid fa-check"></i>
                                                    <span>{desc}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Pagination />
                    </>
                )}
            </div>

            {/* Quy trình làm việc */}
            <div className="process-section">
                <div className="process-header" data-reveal>
                    <span className="process-label"><i className="fas fa-route"></i> {t('service.processBadge')}</span>
                    <h2>{t('service.processTitle')}</h2>
                    <p>Quy trình chuyên nghiệp, minh bạch và hiệu quả</p>
                </div>
                <div className="process-timeline" data-reveal>
                    <div className="process-line"></div>
                    <div className="process-step">
                        <div className="step-number">01</div>
                        <div className="step-icon">
                            <i className="fa-solid fa-file-contract"></i>
                        </div>
                        <h3 className="step-title">{t('service.step1Title')}</h3>
                        <p className="step-description">
                            {t('service.step1Desc')}
                        </p>
                    </div>

                    <div className="process-step">
                        <div className="step-number">02</div>
                        <div className="step-icon">
                            <i className="fa-solid fa-clipboard-check"></i>
                        </div>
                        <h3 className="step-title">{t('service.step2Title')}</h3>
                        <p className="step-description">
                            {t('service.step2Desc')}
                        </p>
                    </div>

                    <div className="process-step">
                        <div className="step-number">03</div>
                        <div className="step-icon">
                            <i className="fa-solid fa-gear"></i>
                        </div>
                        <h3 className="step-title">{t('service.step3Title')}</h3>
                        <p className="step-description">
                            {t('service.step3Desc')}
                        </p>
                    </div>

                    <div className="process-step">
                        <div className="step-number">04</div>
                        <div className="step-icon">
                            <i className="fa-solid fa-handshake"></i>
                        </div>
                        <h3 className="step-title">{t('service.step4Title')}</h3>
                        <p className="step-description">
                            {t('service.step4Desc')}
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="svc-faq-section">
                <div className="svc-faq-inner">
                    <div className="svc-faq-header" data-reveal>
                        <span className="process-label"><i className="fas fa-question-circle"></i> FAQ</span>
                        <h2>{t('service.faqTitle')}</h2>
                        <p>{t('service.faqSubtitle')}</p>
                    </div>
                    <div className="svc-faq-list" data-reveal>
                        {faqData.map((item, i) => (
                            <div key={i} className={`svc-faq-item${openFaq === i ? ' open' : ''}`}>
                                <button className="svc-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <span>{item.q}</span>
                                    <i className={`fas fa-chevron-down svc-faq-chevron`}></i>
                                </button>
                                <div className="svc-faq-a">
                                    <p>{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="svc-cta">
                <div className="svc-cta-inner" data-reveal>
                    <h3>{t('service.ctaTitle')}</h3>
                    <p>{t('service.ctaDesc')}</p>
                    <div className="svc-cta-actions">
                        <Link to="/contact"><button className="cta-btn"><i className="fas fa-phone"></i> {t('service.freeConsult')}</button></Link>
                        <Link to="/about"><button className="cta-btn cta-btn--outline cta-btn--light">{t('service.viewServices')} <i className="fas fa-arrow-right"></i></button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicePage;