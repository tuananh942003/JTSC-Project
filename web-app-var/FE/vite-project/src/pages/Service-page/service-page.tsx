import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './service-page.css';
import API_URL from '../../config/api';
import { useLang } from '../../context/LanguageContext';
import SEO from '../../component/SEO';

interface ApiService {
  _id: string;
  icon: string;
  title: string;
  content: string;
  description: string[];
}

interface FaqItem {
  q: string;
  a: string;
}

export const ServicePage = () => {
  const { t } = useLang();
  const faqData: FaqItem[] = [
    { q: t('service.faq1Q'), a: t('service.faq1A') },
    { q: t('service.faq2Q'), a: t('service.faq2A') },
    { q: t('service.faq3Q'), a: t('service.faq3A') },
    { q: t('service.faq4Q'), a: t('service.faq4A') },
  ];
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const itemsPerPage = 6;
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [loading]);

  const getPaginatedData = (data: ApiService[]) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = () => Math.ceil(services.length / itemsPerPage);

  const Pagination = () => {
    const totalPages = getTotalPages();
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    if (totalPages <= 1) return null;
    return (
      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
          {t('service.prev')}
        </button>
        {pages.map(page => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`pagination-btn ${currentPage === page ? 'active' : ''}`}>
            {page}
          </button>
        ))}
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
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
      if (!response.ok) throw new Error('Không thể tải dữ liệu dịch vụ');
      const data: ApiService[] = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-page">
      <SEO
        title="Dịch Vụ"
        description="Khám phá các dịch vụ công nghệ của JTSC: phát triển phần mềm, ứng dụng web & mobile, giải pháp AI, tư vấn chuyển đổi số và bảo mật hệ thống."
        keywords="dịch vụ công nghệ, phát triển phần mềm, ứng dụng web, ứng dụng mobile, AI, tư vấn IT, chuyển đổi số"
        url="/service"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Dịch Vụ Công Nghệ – JTSC",
          "url": "https://jtsc.vn/service",
          "provider": { "@type": "Organization", "name": "JTSC" },
          "description": "Phát triển phần mềm, ứng dụng web & mobile, AI và tư vấn chuyển đổi số."
        }}
      />
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
                <div key={service._id} className="service-card" style={{ '--card-i': idx } as React.CSSProperties}>
                  <div className="service-card-number">{String(idx + 1 + (currentPage - 1) * itemsPerPage).padStart(2, '0')}</div>
                  <div className="service-icon-wrapper"><i className={service.icon}></i></div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-content">{service.content}</p>
                  {service.description && service.description.length > 0 && (
                    <ul className="service-features">
                      {service.description.map((desc, index) => (
                        <li key={index}><i className="fa-solid fa-check"></i><span>{desc}</span></li>
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
          {[
            { num: '01', icon: 'fa-file-contract', title: t('service.step1Title'), desc: t('service.step1Desc') },
            { num: '02', icon: 'fa-clipboard-check', title: t('service.step2Title'), desc: t('service.step2Desc') },
            { num: '03', icon: 'fa-gear', title: t('service.step3Title'), desc: t('service.step3Desc') },
            { num: '04', icon: 'fa-handshake', title: t('service.step4Title'), desc: t('service.step4Desc') },
          ].map(step => (
            <div key={step.num} className="process-step">
              <div className="step-number">{step.num}</div>
              <div className="step-icon"><i className={`fa-solid ${step.icon}`}></i></div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.desc}</p>
            </div>
          ))}
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
                  <i className="fas fa-chevron-down svc-faq-chevron"></i>
                </button>
                <div className="svc-faq-a"><p>{item.a}</p></div>
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
