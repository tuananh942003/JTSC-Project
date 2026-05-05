import "@fortawesome/fontawesome-free/css/all.css";
import "./home-page.css";
import { useLang } from "../../context/LanguageContext";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

interface NewsExtension {
  icon: string;
  date: string;
}

interface NewsCardProps {
  title: string;
  description: string;
  image: string;
  extension: NewsExtension;
  id: string | number;
}

export default function ServiceCard({ icon, title, description, index }: ServiceCardProps) {
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

export function NewsCard({ title, description, image, extension, id }: NewsCardProps) {
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
  );
}
