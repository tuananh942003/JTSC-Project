import React, { useEffect, useRef, useState, useCallback } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import "./home-page.css";
import ServiceCard from "./card";
import { NewsCard } from "./card";
import { Contact } from "../../component/contact";
import { Link } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import API_URL from "../../config/api";
import logo from "../../images/computerscience-scaled.jpg";
import SEO from "../../component/SEO";

interface ApiService {
  _id: string;
  icon: string;
  title: string;
  content: string;
}

interface ApiPost {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

/* ---- Animated counter hook ---- */
function useCountUp(target: number, duration = 2000): [number, React.RefObject<HTMLDivElement | null>] {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.ceil(target / (duration / 16));
          const tick = () => {
            start += step;
            if (start >= target) { setCount(target); return; }
            setCount(start);
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

interface CountUpStatProps {
  value: number;
  suffix: string;
  label: string;
}

function CountUpStat({ value, suffix, label }: CountUpStatProps) {
  const [count, ref] = useCountUp(value);
  return (
    <div className="hero-stat-item" ref={ref}>
      <div className="hero-stat-num">{count}<span className="hero-stat-suffix">{suffix}</span></div>
      <div className="hero-stat-lbl">{label}</div>
    </div>
  );
}

export const HomePage = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { t } = useLang();
  const [services, setServices] = useState<ApiService[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services`);
        if (res.ok) {
          const data: ApiService[] = await res.json();
          setServices(data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy dịch vụ:', err);
      }
    };
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts`);
        if (res.ok) {
          const data: ApiPost[] = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy bài viết:', err);
      }
    };
    fetchServices();
    fetchPosts();
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
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <SEO
        title="Trang Chủ"
        description="JTSC – Giải pháp công nghệ thông minh: phần mềm doanh nghiệp, ứng dụng web & mobile, AI và chuyển đổi số tại Việt Nam."
        keywords="JTSC, giải pháp công nghệ, phần mềm doanh nghiệp, chuyển đổi số, AI, Việt Nam"
        url="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "JTSC – Trang Chủ",
          "url": "https://jtsc.vn/",
          "description": "JTSC cung cấp giải pháp công nghệ thông tin hiện đại cho doanh nghiệp Việt Nam."
        }}
      />
      {/* ===== HERO ===== */}
      <div className="home-page">
        <div className="hero-dots"></div>
        <div className="hero-particles">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div className="left-home-page">
          <div className="hero-badge">
            <span></span> {t('hero.badge')}
          </div>
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.description')}</p>
          <div className="home-page-action">
            <Link to="/service">
              <button>
                <i className="fa-solid fa-arrow-right"></i> {t('hero.exploreServices')}
              </button>
            </Link>
            <button onClick={scrollToContact}>
              <i className="fa-solid fa-phone"></i> {t('hero.contactNow')}
            </button>
          </div>
          <div className="hero-stats">
            <CountUpStat value={320} suffix="+" label={t('hero.statPackages')} />
            <CountUpStat value={1000} suffix="+" label={t('hero.statClients')} />
            <CountUpStat value={85} suffix="%" label={t('hero.statWinRate')} />
          </div>
        </div>
        <div className="right-home-page">
          <div className="hero-image-glow"></div>
          <img src={logo} alt="" />
        </div>
      </div>

      {/* ===== TRUST BAR ===== */}
      <section className="trust-bar">
        <div className="trust-inner">
          <span className="trust-label">{t('trust.trustedBy')}</span>
          <div className="trust-logos">
            <div className="trust-item"><i className="fas fa-city"></i><span>{t('trust.enterprises')}</span></div>
            <div className="trust-item"><i className="fas fa-landmark"></i><span>{t('trust.government')}</span></div>
            <div className="trust-item"><i className="fas fa-globe-asia"></i><span>{t('trust.nationwide')}</span></div>
            <div className="trust-item"><i className="fas fa-award"></i><span>{t('trust.experience')}</span></div>
          </div>
        </div>
      </section>

      <section className="section-about" id="about-section">
        <div className="section-inner">
          <div className="subtitle" data-reveal>
            <p className="section-label"><i className="fa-solid fa-star"></i> {t('homeAbout.badge')}</p>
            <h2>{t('homeAbout.title')}</h2>
            <p>Chuyên gia tư vấn đấu thầu hàng đầu với đội ngũ có nhiều năm kinh nghiệm</p>
          </div>
          <div className="about-content">
            <div className="about-text">
              <div className="feature-item" data-reveal style={{ transitionDelay: '0.1s' }}>
                <div className="icon"><i className="fa-solid fa-clipboard-check"></i></div>
                <div className="info">
                  <h3 className="info-title">{t('homeAbout.feature1Title')}</h3>
                  <p className="info-description">{t('homeAbout.feature1Desc')}</p>
                </div>
              </div>
              <div className="feature-item" data-reveal style={{ transitionDelay: '0.2s' }}>
                <div className="icon"><i className="fa-solid fa-gavel"></i></div>
                <div className="info">
                  <h3 className="info-title">{t('homeAbout.feature2Title')}</h3>
                  <p className="info-description">{t('homeAbout.feature2Desc')}</p>
                </div>
              </div>
              <div className="feature-item" data-reveal style={{ transitionDelay: '0.3s' }}>
                <div className="icon"><i className="fa-solid fa-trophy"></i></div>
                <div className="info">
                  <h3 className="info-title">{t('homeAbout.feature3Title')}</h3>
                  <p className="info-description">{t('homeAbout.feature3Desc')}</p>
                </div>
              </div>
            </div>
            <div className="about-stat" data-reveal>
              <div className="home-stat-card">
                <div className="stat-number">320<span>+</span></div>
                <div className="stat-label">{t('homeAbout.stat1')}</div>
              </div>
              <div className="home-stat-card">
                <div className="stat-number">1000<span>+</span></div>
                <div className="stat-label">{t('homeAbout.stat2')}</div>
              </div>
              <div className="home-stat-card">
                <div className="stat-number">12<span>+</span></div>
                <div className="stat-label">{t('homeAbout.stat3')}</div>
              </div>
              <div className="home-stat-card">
                <div className="stat-number">85<span>%</span></div>
                <div className="stat-label">{t('homeAbout.stat4')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="section-service">
        <div className="section-inner">
          <div className="service-header-home" data-reveal>
            <p className="section-label"><i className="fa-solid fa-briefcase"></i> {t('homeService.badge')}</p>
            <h4>{t('homeService.title')}</h4>
            <p>Dịch vụ tư vấn đấu thầu chuyên nghiệp và toàn diện</p>
          </div>
          <div className="card-wrapper-service" data-reveal>
            {services.slice(0, 6).map((service, idx) => (
              <ServiceCard
                key={service._id}
                icon={service.icon}
                title={service.title}
                description={service.content}
                index={idx + 1}
              />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/service">
              <button className="cta-btn">
                {t('homeService.viewAll')} <i className="fa-solid fa-arrow-right"></i>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <div className="cta-banner-content" data-reveal>
            <h3>{t('cta.title')}</h3>
            <p>{t('cta.description')}</p>
          </div>
          <div className="cta-banner-actions" data-reveal>
            <Link to="/contact">
              <button className="cta-btn">
                <i className="fas fa-phone"></i> {t('cta.freeConsult')}
              </button>
            </Link>
            <Link to="/service">
              <button className="cta-btn cta-btn--outline cta-btn--light">
                {t('cta.viewServices')} <i className="fa-solid fa-arrow-right"></i>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== NEWS ===== */}
      <section className="section-news">
        <div className="section-inner">
          <div className="news-header-home" data-reveal>
            <p className="section-label"><i className="fa-solid fa-newspaper"></i> {t('homeNews.badge')}</p>
            <h5>{t('homeNews.title')}</h5>
            <p>Cập nhật luật đấu thầu và kinh nghiệm thực tế</p>
          </div>
          <div className="card-wrapper-news" data-reveal>
            {posts.slice(0, 3).map((post) => (
              <NewsCard
                key={post._id}
                id={post._id}
                image={post.imageUrl}
                title={post.title}
                description={post.content}
                extension={{
                  icon: "fas fa-calendar",
                  date: new Date(post.createdAt).toLocaleDateString('vi-VN'),
                }}
              />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/news">
              <button className="cta-btn cta-btn--outline">
                {t('homeNews.viewAll')} <i className="fa-solid fa-arrow-right"></i>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact-section">
        <Contact />
      </section>
    </>
  );
};

export default HomePage;
