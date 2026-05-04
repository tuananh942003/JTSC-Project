import "@fortawesome/fontawesome-free/css/all.css";
import "./home-page.css";
import { useLang } from "../../context/LanguageContext.jsx";
import { Link } from "react-router-dom";
export default function ServiceCard({ icon, title, description, index }) {
    return (
      <div className="feature-item-service">
        <span className="service-card-idx">{String(index).padStart(2, '0')}</span>
        <div className="service-icon">
          <i className={icon}></i>
        </div>
        <div className="feature-item-service-info">
          <h3 className="feature-item-service-info-title">{title}</h3>
          <p className="feature-item-service-info-description">{description}</p>
        </div>
        <div className="card-arrow">
          <i className="fa-solid fa-arrow-right"></i>
        </div>
      </div>
    );
}

export function NewsCard ({title, description, image, extension, id }) {
    const { t } = useLang();
    return (
        <Link to={`/news/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="feature-item-news"> 
          <div className="news-image">
            {image && <img src={image} alt="" />}
            <div className="news-image-overlay"></div>
            <span className="news-tag">{t('card.newsTag')}</span>
          </div>
          <div className="news-info">
            <h3 className="feature-item-news-info-title">{title}</h3>
            <p className="feature-item-news-info-description">{description}</p>
            <div className="news-meta">
              <div className="news-extension">
                <i className={extension.icon}></i>
                <span>{extension.date}</span>
              </div>
              <span className="news-read-more">{t('card.readMore')} <i className="fa-solid fa-arrow-right"></i></span>
            </div>
          </div>
        </div> 
        </Link>
    )
}