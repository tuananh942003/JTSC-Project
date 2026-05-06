import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './news-detail.css';
import API_URL from '../../config/api';
import { useLang } from '../../context/LanguageContext';
import SEO from '../../component/SEO';

interface ApiPost {
  _id: string;
  id?: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** Detect if the content string contains HTML markup from TipTap */
const isHtmlContent = (content: string): boolean =>
  /<[a-z][\s\S]*>/i.test(content);

/** Strip all HTML tags, return plain text */
const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** Parse h2/h3 headings from HTML string for TOC */
const extractToc = (html: string): TocItem[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));
  return headings.map((el, i) => ({
    id: `toc-heading-${i}`,
    text: el.textContent || '',
    level: parseInt(el.tagName[1]),
  })).filter(h => h.text.trim() !== '');
};

/** Inject id attributes into headings so anchor links work */
const injectHeadingIds = (html: string): string => {
  let counter = 0;
  return html.replace(/<(h[123])(\s[^>]*)?>([\s\S]*?)<\/h[123]>/gi, (_match, tag, attrs, text) => {
    const id = `toc-heading-${counter++}`;
    return `<${tag}${attrs || ''} id="${id}">${text}</${tag}>`;
  });
};

const formatDateShort = (dateString: string): string => {
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const el = articleRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setReadProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const [postRes, allRes] = await Promise.all([
        fetch(`${API_URL}/api/posts/${id}`),
        fetch(`${API_URL}/api/posts`),
      ]);
      if (!postRes.ok) throw new Error('Không thể lấy chi tiết bài viết');
      const data: ApiPost = await postRes.json();
      setPost(data);
      if (allRes.ok) {
        const all: ApiPost[] = await allRes.json();
        setRelatedPosts(all.filter(p => p._id !== id).slice(0, 6));
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Lỗi khi lấy chi tiết bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', options);
  };

  const handleBack = () => navigate('/news');

  // ── Derived values — MUST be before early returns (Rules of Hooks) ──
  const htmlContent = isHtmlContent(post?.content ?? '');

  const processedHtml = useMemo(
    () => (post && htmlContent ? injectHeadingIds(post.content) : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post?.content, htmlContent]
  );

  const tocItems = useMemo(
    () => (post && htmlContent ? extractToc(post.content) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post?.content, htmlContent]
  );

  const plainExcerpt = post ? stripHtml(post.content).slice(0, 160) : '';

  if (loading) {
    return (
      <div className="detail-container">
        <div className="detail-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{t('newsDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="detail-container">
        <div className="detail-state">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error || t('newsDetail.notFound')}</p>
          <button className="back-btn" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
            {t('newsDetail.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container" ref={articleRef}>
      <SEO
        title={post.title}
        description={plainExcerpt}
        url={`/news/${id}`}
        image={post.imageUrl || undefined}
        type="article"
        publishedAt={post.createdAt}
        keywords={`${post.title}, JTSC, tin tức công nghệ`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": post.title,
          "url": `https://jtsc.vn/news/${id}`,
          "datePublished": post.createdAt,
          "dateModified": post.createdAt,
          "author": { "@type": "Organization", "name": "JTSC" },
          "publisher": {
            "@type": "Organization",
            "name": "JTSC",
            "logo": { "@type": "ImageObject", "url": "https://jtsc.vn/logo.png" }
          },
          "description": plainExcerpt,
          "image": post.imageUrl || "https://jtsc.vn/og-image.png"
        }}
      />

      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${readProgress}%` }} />

      <div className="detail-page-wrap">

        {/* ─── Breadcrumb ─── */}
        <nav className="detail-breadcrumb">
          <Link to="/">{t('newsDetail.home')}</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/news">{t('newsDetail.news')}</Link>
          <i className="fas fa-chevron-right"></i>
          <span>{post.title.length > 60 ? post.title.slice(0, 60) + '…' : post.title}</span>
        </nav>

        {/* ─── Two-column layout ─── */}
        <div className="detail-layout">

          {/* ══ MAIN ARTICLE COLUMN ══ */}
          <main className="detail-main">
            <article className="post-detail">

              {/* Category badge */}
              <div className="post-category-badge">
                <i className="fas fa-newspaper"></i>
                {t('newsDetail.tagNews')}
              </div>

              {/* Title */}
              <h1 className="detail-title">{post.title}</h1>

              {/* Meta row */}
              <div className="post-meta-row">
                <span className="meta-author">
                  <i className="fas fa-building"></i>
                  JTSC
                </span>
                <span className="meta-dot">·</span>
                <span className="meta-date">
                  <i className="fas fa-calendar-alt"></i>
                  {formatDate(post.createdAt)}
                </span>
                <span className="meta-dot">·</span>
                <span className="meta-read">
                  <i className="fas fa-clock"></i>
                  {t('newsDetail.readingTime')}
                </span>
              </div>

              {/* Share bar */}
              <div className="post-share-bar">
                <span className="share-label">{t('newsDetail.shareArticle')}</span>
                <div className="share-buttons">
                  <button className="share-btn facebook" title="Chia sẻ Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button className="share-btn twitter" title="Chia sẻ Twitter">
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="share-btn linkedin" title="Chia sẻ LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </button>
                  <button
                    className="share-btn copy-link"
                    title="Sao chép liên kết"
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                  >
                    <i className="fas fa-link"></i>
                  </button>
                </div>
              </div>

              {/* Hero image */}
              {post.imageUrl && (
                <div className="detail-hero-image">
                  <img src={post.imageUrl} alt={post.title} />
                </div>
              )}

              {/* Table of Contents */}
              {tocItems.length > 0 && (
                <div className="detail-toc">
                  <div className="toc-header">
                    <i className="fas fa-list-ul"></i>
                    {t('newsDetail.toc')}
                  </div>
                  <ul>
                    {tocItems.map((item) => (
                      <li key={item.id} className={`toc-level-${item.level}`}>
                        <a href={`#${item.id}`}>{item.text}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Body content */}
              <div className="detail-body">
                {htmlContent ? (
                  <div className="rich-text-body" dangerouslySetInnerHTML={{ __html: processedHtml }} />
                ) : (
                  <p className="intro-text">{post.content}</p>
                )}
              </div>

              {/* Tags + back */}
              <div className="post-tags">
                <i className="fas fa-tags"></i>
                <span className="tag">{t('newsDetail.tagNews')}</span>
                <span className="tag">{t('newsDetail.tagUpdate')}</span>
                <span className="tag">{t('newsDetail.tagTrend')}</span>
              </div>

              <button className="back-btn" onClick={handleBack}>
                <i className="fas fa-arrow-left"></i>
                {t('newsDetail.backToList')}
              </button>

            </article>

            {/* ── Related posts (mobile only) ── */}
            {relatedPosts.length > 0 && (
              <div className="related-mobile">
                <div className="sidebar-box-title">
                  <i className="fas fa-fire-alt"></i>
                  Bài viết khác
                </div>
                <div className="related-grid-mobile">
                  {relatedPosts.slice(0, 4).map(rp => (
                    <Link key={rp._id} to={`/news/${rp._id}`} className="related-card-mobile">
                      {rp.imageUrl && <img src={rp.imageUrl} alt={rp.title} />}
                      <div className="rcm-body">
                        <p className="rcm-title">{rp.title}</p>
                        <span className="rcm-date">{formatDateShort(rp.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ══ SIDEBAR ══ */}
          <aside className="detail-sidebar">

            {relatedPosts.length > 0 && (
              <div className="sidebar-box">
                <div className="sidebar-box-title">
                  <i className="fas fa-fire-alt"></i>
                  Bài viết khác
                </div>
                <div className="sidebar-articles">
                  {relatedPosts.map((rp, idx) => (
                    <Link key={rp._id} to={`/news/${rp._id}`} className="sidebar-article-card">
                      <div className="sac-num">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="sac-body">
                        {rp.imageUrl && (
                          <div className="sac-img">
                            <img src={rp.imageUrl} alt={rp.title} />
                          </div>
                        )}
                        <p className="sac-title">{rp.title}</p>
                        <span className="sac-date">
                          <i className="fas fa-calendar-alt"></i>
                          {formatDateShort(rp.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to list CTA */}
            <div className="sidebar-box sidebar-cta">
              <i className="fas fa-newspaper sidebar-cta-icon"></i>
              <p>Xem tất cả tin tức &amp; bài viết mới nhất từ JTSC</p>
              <Link to="/news" className="sidebar-cta-btn">
                <i className="fas fa-arrow-left"></i>
                Danh sách tin tức
              </Link>
            </div>

          </aside>

        </div>{/* /detail-layout */}
      </div>{/* /detail-page-wrap */}
    </div>
  );
};

export default NewsDetail;

