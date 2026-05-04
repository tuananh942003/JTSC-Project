import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './news-page.css';
import API_URL from '../../config/api.js';
import { useLang } from '../../context/LanguageContext.jsx';

export const NewsPage = () => {
    const navigate = useNavigate();
    const { t, lang } = useLang();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 6;
    const observerRef = useRef(null);

    // Lấy dữ liệu bài viết từ server khi component mount
    useEffect(() => {
        fetchPosts();
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
    }, [loading, searchQuery]);

    // Filter posts by search query
    const filteredPosts = posts.filter(post =>
        !searchQuery || post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Grid posts: skip the featured post on page 1 when no search
    const getGridPosts = () => {
        if (currentPage === 1 && !searchQuery && filteredPosts.length > 0) {
            return filteredPosts.slice(1);
        }
        return filteredPosts;
    };

    const getPaginatedData = (data) => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return data.slice(indexOfFirstItem, indexOfLastItem);
    };

    const getTotalPages = () => {
        return Math.ceil(getGridPosts().length / itemsPerPage);
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
                    {t('news.prev')}
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
                    {t('news.next')}
                </button>
            </div>
        );
    };

    // Hàm lấy dữ liệu posts từ API
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/posts`);
            
            if (!response.ok) {
                throw new Error('Không thể lấy dữ liệu bài viết');
            }
            
            const data = await response.json();
            setPosts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Lỗi khi lấy dữ liệu bài viết:', err);
        } finally {
            setLoading(false);
        }
    };

    // Format ngày tháng
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', options);
    };

    // Xem chi tiết bài viết
    const handleReadMore = (postId) => {
        navigate(`/news/${postId}`);
    };

    if (loading) {
        return (
            <div className="news-container">
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>{t('news.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-container">
                <div className="error">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="news-container">
            <div className="news-hero">
                <h1>{t('news.title')}</h1>
                <p className="news-subtitle">{t('news.subtitle')}</p>
                {/* Search bar */}
                <div className="news-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder={t('news.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {filteredPosts.length === 0 && !loading ? (
                <div className="no-posts">
                    <i className="fas fa-newspaper"></i>
                    <p>{searchQuery ? t('news.noPostsSearch') : t('news.noPosts')}</p>
                </div>
            ) : (
                <>
                    {/* Featured post (first post, first page only) */}
                    {currentPage === 1 && !searchQuery && filteredPosts.length > 0 && (
                        <div className="news-featured" data-reveal>
                            <div className="featured-card" onClick={() => handleReadMore(filteredPosts[0]._id)}>
                                {filteredPosts[0].imageUrl && (
                                    <div className="featured-image">
                                        <img src={filteredPosts[0].imageUrl} alt={filteredPosts[0].title} />
                                        <div className="featured-overlay"></div>
                                    </div>
                                )}
                                <div className="featured-content">
                                    <span className="featured-badge"><i className="fas fa-star"></i> {t('news.featured')}</span>
                                    <h2 className="featured-title">{filteredPosts[0].title}</h2>
                                    <p className="featured-desc">{filteredPosts[0].content}</p>
                                    <div className="featured-meta">
                                        <span><i className="fas fa-calendar-alt"></i> {formatDate(filteredPosts[0].createdAt)}</span>
                                        <span className="featured-read">{t('news.readMore')} <i className="fas fa-arrow-right"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="posts-grid" data-reveal>
                        {getPaginatedData(getGridPosts()).map((post) => (
                            <div key={post._id} className="post-card">
                                {post.imageUrl && (
                                    <div className="post-image">
                                        <img src={post.imageUrl} alt={post.title} />
                                    </div>
                                )}
                                <div className="post-content">
                                    <h2 className="post-title">{post.title}</h2>
                                    <p className="post-description">{post.content}</p>
                                    <p className="post-date">
                                        <i className="fas fa-calendar-alt"></i>
                                        {formatDate(post.createdAt)}
                                    </p>
                                    <button className="read-more-btn" onClick={() => handleReadMore(post._id)}>
                                        {t('news.viewDetail')}
                                        <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <Pagination />
                </>
            )}
        </div>
    );
};

export default NewsPage;
