import React, { useEffect, useRef, useState } from "react";
import "./about.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { useLang } from "../../context/LanguageContext";

/* Animated counter */
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

interface StatCounterProps {
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

function StatCounter({ icon, value, suffix, label }: StatCounterProps) {
  const [count, ref] = useCountUp(value);
  return (
    <div className="about-counter-card" ref={ref}>
      <div className="counter-icon"><i className={icon}></i></div>
      <div className="counter-value">{count}<span>{suffix}</span></div>
      <div className="counter-label">{label}</div>
    </div>
  );
}

export const About = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { t } = useLang();

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

  const visionMissionData = [
    { icon: "fas fa-eye", title: t('about.visionTitle'), description: t('about.visionDesc') },
    { icon: "fas fa-rocket", title: t('about.missionTitle'), description: t('about.missionDesc') },
    { icon: "fas fa-heart", title: t('about.coreValuesTitle'), description: t('about.coreValuesDesc') },
  ];

  const expertTeam = [
    {
      name: t('about.expert1Name'),
      position: t('about.expert1Position'),
      avatar: "fas fa-user-tie",
      description: t('about.expert1Desc'),
      expertise: `${t('about.expert1Skill1')}, ${t('about.expert1Skill2')}, ${t('about.expert1Skill3')}`,
    },
    {
      name: t('about.expert2Name'),
      position: t('about.expert2Position'),
      avatar: "fas fa-gavel",
      description: t('about.expert2Desc'),
      expertise: `${t('about.expert2Skill1')}, ${t('about.expert2Skill2')}, ${t('about.expert2Skill3')}`,
    },
    {
      name: t('about.expert3Name'),
      position: t('about.expert3Position'),
      avatar: "fas fa-chart-line",
      description: t('about.expert3Desc'),
      expertise: `${t('about.expert3Skill1')}, ${t('about.expert3Skill2')}, ${t('about.expert3Skill3')}`,
    },
  ];

  return (
    <div className="about-container">
      {/* Header Section */}
      <section className="about-header">
        <div className="header-content">
          <h1 className="main-title">{t('about.heroTitle')}</h1>
          <p className="subtitle">{t('about.heroSubtitle')}</p>
        </div>
      </section>

      {/* Về Chúng Tôi Section */}
      <section className="about-intro">
        <div className="intro-container" data-reveal>
          <div className="intro-content">
            <h2 className="section-title">
              <i className="fas fa-building"></i>
              Về Chúng Tôi
            </h2>
            <div className="intro-text">
              <p>
                Với hơn <strong>15 năm kinh nghiệm</strong> trong lĩnh vực tư vấn đấu thầu, chúng tôi tự hào là đơn vị
                tiên phong trong việc cung cấp các giải pháp toàn diện cho doanh nghiệp.
              </p>
              <p>
                Chúng tôi không chỉ đơn thuần là nhà tư vấn, mà còn là người bạn đồng hành đáng tin cậy, luôn đặt
                lợi ích và thành công của khách hàng lên hàng đầu. Với phương châm <em>"Chuyên nghiệp - Uy tín - Hiệu quả"</em>,
                chúng tôi cam kết mang đến dịch vụ chất lượng cao nhất.
              </p>
              <p>
                Hơn <strong>500+ dự án</strong> đã được triển khai thành công và <strong>200+ khách hàng</strong> tin tưởng
                lựa chọn chúng tôi như một minh chứng cho chất lượng dịch vụ mà chúng tôi cung cấp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tầm Nhìn & Sứ Mệnh Section */}
      <section className="vision-mission">
        <div className="section-container">
          <h2 className="section-title">
            <i className="fas fa-compass"></i>
            {t('about.sectionVision')}
          </h2>
          <div className="vision-grid" data-reveal>
            {visionMissionData.map((item, index) => (
              <div key={index} className="vision-card">
                <div className="vision-card-number">0{index + 1}</div>
                <div className="card-icon"><i className={item.icon}></i></div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counter Section */}
      <section className="about-counters">
        <div className="section-container">
          <div className="counters-grid" data-reveal>
            <StatCounter icon="fas fa-briefcase" value={500} suffix="+" label={t('about.counterProjects')} />
            <StatCounter icon="fas fa-users" value={200} suffix="+" label={t('about.counterClients')} />
            <StatCounter icon="fas fa-trophy" value={85} suffix="%" label={t('about.counterWinRate')} />
            <StatCounter icon="fas fa-clock" value={12} suffix="+" label={t('about.counterExperience')} />
          </div>
        </div>
      </section>

      {/* Đội Ngũ Chuyên Gia Section */}
      <section className="expert-team">
        <div className="section-container">
          <h2 className="section-title">
            <i className="fas fa-users"></i>
            {t('about.sectionTeam')}
          </h2>
          <p className="section-subtitle">{t('about.teamSubtitle')}</p>
          <div className="expert-grid" data-reveal>
            {expertTeam.map((expert, index) => (
              <div key={index} className="expert-card">
                <div className="expert-avatar"><i className={expert.avatar}></i></div>
                <div className="expert-info">
                  <h3 className="expert-name">{expert.name}</h3>
                  <p className="expert-position">{expert.position}</p>
                  <p className="expert-description">{expert.description}</p>
                  <div className="expert-expertise">
                    <span className="expertise-label">{t('about.expertiseLabel')}</span>
                    <span className="expertise-value">{expert.expertise}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
