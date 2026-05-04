import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './news-detail.css';
import API_URL from '../../config/api.js';
import { useLang } from '../../context/LanguageContext.jsx';
import pic1 from '../../images/pic1.png';
import pic2 from '../../images/pic2.png';
import pic4 from '../../images/pic4.jpg';
import pic5 from '../../images/pic5.jpg';
import heroBg from '../../images/hero-bg.jpg';
import computerScience from '../../images/computerscience-scaled.jpg';

export const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useLang();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [readProgress, setReadProgress] = useState(0);
    const articleRef = useRef(null);

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
            const response = await fetch(`${API_URL}/api/posts/${id}`);
            
            if (!response.ok) {
                throw new Error('Không thể lấy chi tiết bài viết');
            }
            
            const data = await response.json();
            setPost(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Lỗi khi lấy chi tiết bài viết:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', options);
    };

    // Xác định biến thể bài viết dựa trên ID (deterministic — không random mỗi lần render)
    const getVariant = (p) => {
        const str = String(p._id || p.id || p.title || '');
        const sum = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return sum % 5;
    };

    const generateDetailedContent = (p) => {
        const allImgs = [pic1, pic2, pic4, pic5, heroBg, computerScience];
        const seed = String(p._id || p.id || p.title || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const imgs = [
            allImgs[seed % allImgs.length],
            allImgs[(seed + 2) % allImgs.length],
            allImgs[(seed + 4) % allImgs.length],
        ];
        const ttl = p.title;
        const cnt = p.content;

        const templates = [
            // ── Variant 0: Technology Report ──
            {
                intro: `${cnt} Trong bối cảnh công nghệ không ngừng tiến hóa, ${ttl} nổi lên như một trong những chủ đề được giới chuyên gia và cộng đồng toàn cầu quan tâm đặc biệt.`,
                sections: [
                    { type: 'text-image', title: 'Bức tranh tổng quan', content: `${ttl} đang định hình lại cách chúng ta tiếp cận và giải quyết các thách thức hiện đại. Từ quy mô doanh nghiệp lớn cho đến các startup năng động, xu hướng này đang tạo ra làn sóng chuyển đổi mạnh mẽ trên toàn cầu. Các chuyên gia nhận định đây là bước ngoặt quan trọng không thể bỏ qua.`, image: imgs[0] },
                    { type: 'stats', title: 'Những con số biết nói', stats: [{ value: '87%', label: 'Doanh nghiệp áp dụng' }, { value: '3.2x', label: 'Tăng trưởng hiệu quả' }, { value: '2025', label: 'Năm bứt phá' }, { value: '$4.2T', label: 'Giá trị thị trường' }] },
                    { type: 'text-image', title: 'Phân tích chuyên sâu', content: `Khi đi sâu vào từng khía cạnh, chúng ta nhận thấy sự phức tạp đằng sau những con số bề ngoài. ${cnt} Điều quan trọng là phải hiểu rõ cơ chế vận hành để tận dụng tối đa tiềm năng mà xu hướng này mang lại.`, image: imgs[1] },
                    { type: 'quote', quote: `"${ttl} không chỉ là một xu hướng nhất thời — đây là sự thay đổi căn bản trong cách chúng ta tư duy và hành động trong thế kỷ 21."`, author: 'Chuyên gia phân tích công nghệ' },
                    { type: 'bullets', title: 'Điểm nhấn quan trọng', items: ['Tác động trực tiếp đến hơn 500 triệu người dùng toàn cầu', 'Hợp tác chiến lược với các tổ chức hàng đầu thế giới', 'Giải pháp bền vững cho các thách thức dài hạn', 'Nền tảng đổi mới sáng tạo cho thế hệ tiếp theo'] },
                    { type: 'text', title: 'Nhìn về phía trước', content: `Trong 5 năm tới, ${ttl} được dự báo sẽ tiếp tục tạo ra những bước đột phá đáng kể. Các nghiên cứu mới nhất từ các viện uy tín cho thấy tiềm năng chưa được khai thác vẫn còn rất lớn. Đây là thời điểm vàng để chuẩn bị và đón đầu những cơ hội sắp đến.` },
                ],
            },
            // ── Variant 1: Analysis Article ──
            {
                intro: `${cnt} Bài viết này đưa ra góc nhìn phân tích đa chiều về ${ttl}, từ bối cảnh hình thành cho đến những ảnh hưởng thực tiễn đang diễn ra ngay lúc này.`,
                sections: [
                    { type: 'image-left', title: 'Bối cảnh và nguồn gốc', content: `Để hiểu đúng về ${ttl}, chúng ta cần nhìn lại hành trình hình thành và phát triển của nó. Từ những ý tưởng ban đầu còn nhiều hoài nghi, đến nay ${ttl} đã trở thành một phần không thể thiếu trong hệ sinh thái công nghệ và xã hội hiện đại.`, image: imgs[0] },
                    { type: 'quote', quote: `"Chúng ta đang chứng kiến một trong những sự chuyển đổi lớn nhất trong lịch sử công nghệ. ${ttl} chính là tâm điểm của cuộc cách mạng đó."`, author: 'Viện Nghiên cứu Công nghệ Toàn cầu' },
                    { type: 'text-image', title: 'Phân tích tác động', content: `${cnt} Tác động của ${ttl} không chỉ giới hạn ở một lĩnh vực mà lan rộng ra nhiều ngành nghề: y tế, giáo dục, sản xuất và tài chính. Các tổ chức áp dụng sớm đã ghi nhận mức tăng trưởng vượt trội so với mặt bằng chung của ngành.`, image: imgs[1] },
                    { type: 'numbered', title: '5 giải pháp tiên phong', items: ['Xây dựng nền tảng dữ liệu thống nhất và minh bạch để tối ưu hóa quyết định', 'Đầu tư vào đào tạo nhân lực chất lượng cao phù hợp với yêu cầu mới', 'Thiết lập hệ sinh thái đối tác chiến lược đa quốc gia', 'Ứng dụng công nghệ AI và tự động hóa vào quy trình cốt lõi', 'Xây dựng khung pháp lý linh hoạt hỗ trợ đổi mới sáng tạo'] },
                    { type: 'text', title: 'Kết luận và khuyến nghị', content: `Qua phân tích toàn diện, có thể thấy ${ttl} mang lại nhiều cơ hội hơn là thách thức. Những tổ chức và cá nhân chủ động học hỏi, thích nghi sẽ là những người hưởng lợi nhiều nhất từ làn sóng thay đổi này.` },
                ],
            },
            // ── Variant 2: Feature Story ──
            {
                intro: `${cnt} Đây là câu chuyện về ${ttl} — không chỉ là thông tin, mà là góc nhìn sâu sắc về một hiện tượng đang định hình tương lai của chúng ta.`,
                sections: [
                    { type: 'text-image', title: 'Khởi đầu của mọi sự', content: `Mọi thứ bắt đầu từ một câu hỏi đơn giản: làm thế nào để ${ttl} có thể thực sự thay đổi cuộc sống của hàng triệu người? Câu trả lời không đơn giản, nhưng hành trình tìm kiếm nó đã mở ra những chân trời hoàn toàn mới.`, image: imgs[0] },
                    { type: 'quote', quote: `"Khi ${ttl} lần đầu xuất hiện, nhiều người còn hoài nghi. Giờ đây, không ai có thể phủ nhận vai trò then chốt của nó trong thế giới hiện đại."`, author: 'Nhà phân tích chiến lược hàng đầu' },
                    { type: 'image-right', title: 'Bức tranh toàn cảnh', content: `${cnt} Nhìn từ góc độ vĩ mô, ${ttl} là mảnh ghép quan trọng trong bức tranh chuyển đổi số toàn cầu. Các quốc gia hàng đầu đang chạy đua đầu tư vào lĩnh vực này, với ngân sách R&D tăng đột biến trong 3 năm liên tiếp.`, image: imgs[1] },
                    { type: 'stats', title: 'Số liệu nổi bật', stats: [{ value: '150+', label: 'Quốc gia tham gia' }, { value: '62%', label: 'Tăng đầu tư R&D' }, { value: '18M', label: 'Việc làm mới' }, { value: '2030', label: 'Tầm nhìn chiến lược' }] },
                    { type: 'bullets', title: 'Những điều không thể bỏ lỡ', items: ['Sự hội tụ giữa công nghệ và nhân văn tạo ra giá trị mới', 'Mô hình kinh doanh truyền thống đang được tái định nghĩa', 'Cộng đồng toàn cầu kết nối chặt chẽ hơn bao giờ hết', 'Cơ hội bình đẳng cho mọi cá nhân và tổ chức'] },
                    { type: 'text', title: 'Chương tiếp theo', content: `Câu chuyện về ${ttl} vẫn chưa kết thúc — thực ra, chúng ta mới chỉ đang ở những trang đầu tiên. Mỗi ngày trôi qua mang lại những phát triển mới và cơ hội chưa từng có. Hãy cùng đón chờ hành trình thú vị phía trước.` },
                ],
            },
            // ── Variant 3: Listicle ──
            {
                intro: `${cnt} Dưới đây là những điều quan trọng nhất bạn cần biết về ${ttl} — được tổng hợp từ hàng trăm nguồn thông tin uy tín và ý kiến chuyên gia.`,
                sections: [
                    { type: 'numbered-image', number: '01', title: 'Tại sao điều này quan trọng?', content: `${ttl} không đơn giản là một xu hướng thoáng qua. Đây là sự thay đổi cơ bản trong cách chúng ta hiểu và tương tác với thế giới. Tầm quan trọng của nó được thể hiện qua mức độ đầu tư và sự quan tâm từ các tổ chức lớn nhất toàn cầu.`, image: imgs[0] },
                    { type: 'numbered', number: '02', title: 'Những tác động trực tiếp', items: ['Thay đổi căn bản mô hình làm việc và học tập', 'Tạo ra làn sóng đổi mới sáng tạo chưa từng có', 'Kết nối hàng tỷ người trong một hệ sinh thái chung', 'Giải quyết những vấn đề nan giải của nhân loại'] },
                    { type: 'numbered-image', number: '03', title: 'Ứng dụng thực tiễn nổi bật', content: `${cnt} Thực tế đã chứng minh rằng các ứng dụng của ${ttl} không chỉ dừng lại trên lý thuyết. Từ bệnh viện thông minh, trường học số, đến nhà máy tự động — dấu ấn của nó có mặt ở khắp nơi.`, image: imgs[1] },
                    { type: 'stats', title: '04. Những con số ấn tượng', stats: [{ value: '94%', label: 'Mức độ hài lòng' }, { value: '5x', label: 'Tăng năng suất' }, { value: '$78B', label: 'Đầu tư toàn cầu' }, { value: '2031', label: 'Năm chín muồi' }] },
                    { type: 'quote', quote: `"Không phải câu hỏi liệu ${ttl} có thay đổi thế giới không — mà là chúng ta sẵn sàng đến đâu cho sự thay đổi đó?"`, author: 'Diễn đàn Kinh tế Thế giới' },
                    { type: 'text', title: '05. Bước đi tiếp theo', content: `Hiểu được tầm quan trọng của ${ttl} chỉ là bước đầu tiên. Điều quan trọng hơn là hành động — bắt đầu học hỏi, thử nghiệm và áp dụng ngay hôm nay. Những ai chờ đợi quá lâu sẽ bỏ lỡ cơ hội vàng trong cuộc chuyển đổi lịch sử này.` },
                ],
            },
            // ── Variant 4: Deep Dive / Research ──
            {
                intro: `${cnt} Bài phân tích chuyên sâu này được thực hiện dựa trên dữ liệu từ hơn 200 nghiên cứu độc lập và phỏng vấn trực tiếp với các chuyên gia hàng đầu về ${ttl}.`,
                sections: [
                    { type: 'text', title: 'Phạm vi nghiên cứu', content: `Nghiên cứu này tập trung vào việc hiểu rõ bản chất và tác động đa chiều của ${ttl} trong bối cảnh toàn cầu hóa và chuyển đổi số. Phương pháp tiếp cận kết hợp phân tích định lượng và nghiên cứu định tính nhằm đảm bảo tính toàn diện và khách quan của kết quả.` },
                    { type: 'stats', title: 'Dữ liệu nghiên cứu', stats: [{ value: '200+', label: 'Nghiên cứu tham chiếu' }, { value: '47', label: 'Quốc gia khảo sát' }, { value: '12K', label: 'Đối tượng phỏng vấn' }, { value: '98%', label: 'Độ tin cậy' }] },
                    { type: 'image-left', title: 'Phát hiện chính', content: `Kết quả nghiên cứu chỉ ra rằng ${ttl} có mối tương quan chặt chẽ với sự tăng trưởng kinh tế bền vững. ${cnt} Đặc biệt, tại các nền kinh tế đang phát triển, tác động tích cực này được khuếch đại đáng kể khi có sự đồng hành của chính sách hỗ trợ phù hợp.`, image: imgs[0] },
                    { type: 'quote', quote: `"Dữ liệu không nói dối. ${ttl} đang tạo ra giá trị kinh tế và xã hội lớn hơn bất kỳ công nghệ nào trong thập kỷ qua. Đây là thời điểm để hành động, không phải chờ đợi."`, author: 'Báo cáo Nghiên cứu Chiến lược 2025' },
                    { type: 'text-image', title: 'Phân tích so sánh', content: `So sánh với các xu hướng tương tự trong quá khứ, ${ttl} cho thấy tốc độ phổ biến nhanh hơn đáng kể. Điều này được lý giải bởi sự trưởng thành của hạ tầng công nghệ và sự thay đổi tư duy của thế hệ lãnh đạo mới.`, image: imgs[1] },
                    { type: 'bullets', title: 'Khuyến nghị từ nghiên cứu', items: [`Ưu tiên đầu tư vào nghiên cứu và phát triển trong lĩnh vực ${ttl}`, 'Xây dựng chương trình đào tạo chuyên sâu ở các cấp độ khác nhau', 'Tạo môi trường thử nghiệm an toàn cho các giải pháp đột phá', 'Thiết lập tiêu chuẩn chất lượng và đạo đức rõ ràng', 'Thúc đẩy hợp tác công-tư để tối ưu hóa nguồn lực'] },
                ],
            },
        ];

        return templates[getVariant(p)];
    };

    const handleBack = () => {
        navigate('/news');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>{t('newsDetail.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="detail-container">
                <div className="error">
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

    const detailedContent = generateDetailedContent(post);

    const renderSection = (section, index) => {
        const sid = `section-${index}`;
        switch (section.type) {
            case 'stats':
                return (
                    <div key={index} className="content-section" id={sid}>
                        <h2 className="section-title">{section.title}</h2>
                        <div className="stats-grid">
                            {section.stats.map((s, i) => (
                                <div key={i} className="stat-card">
                                    <span className="stat-card-value">{s.value}</span>
                                    <span className="stat-card-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'quote':
                return (
                    <div key={index} className="content-section" id={sid}>
                        <blockquote className="pull-quote">
                            <p>{section.quote}</p>
                            <cite>{section.author}</cite>
                        </blockquote>
                    </div>
                );
            case 'bullets':
                return (
                    <div key={index} className="content-section" id={sid}>
                        <h2 className="section-title">{section.title}</h2>
                        <ul className="article-bullets">
                            {section.items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                );
            case 'numbered':
                return (
                    <div key={index} className="content-section" id={sid}>
                        <h2 className="section-title">{section.title}</h2>
                        <ol className="article-numbered">
                            {section.items.map((item, i) => <li key={i}>{item}</li>)}
                        </ol>
                    </div>
                );
            case 'image-left':
                return (
                    <div key={index} className="content-section section-side left" id={sid}>
                        <h2 className="section-title">{section.title}</h2>
                        <div className="side-wrap">
                            <div className="side-img"><img src={section.image} alt={section.title} /></div>
                            <p className="section-text">{section.content}</p>
                        </div>
                    </div>
                );
            case 'image-right':
                return (
                    <div key={index} className="content-section section-side right" id={sid}>
                        <h2 className="section-title">{section.title}</h2>
                        <div className="side-wrap">
                            <p className="section-text">{section.content}</p>
                            <div className="side-img"><img src={section.image} alt={section.title} /></div>
                        </div>
                    </div>
                );
            case 'numbered-image':
                return (
                    <div key={index} className="content-section section-numbered-lead" id={sid}>
                        <span className="number-badge">{section.number}</span>
                        <h2 className="section-title">{section.title}</h2>
                        <p className="section-text">{section.content}</p>
                        {section.image && (
                            <div className="section-image">
                                <img src={section.image} alt={section.title} />
                            </div>
                        )}
                    </div>
                );
            case 'text':
            case 'text-image':
            default:
                return (
                    <div key={index} className="content-section" id={sid}>
                        <h2 className="section-title">{section.title}</h2>
                        <p className="section-text">{section.content}</p>
                        {section.image && (
                            <div className="section-image">
                                <img src={section.image} alt={section.title} />
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="detail-container" ref={articleRef}>
            {/* Reading progress bar */}
            <div className="reading-progress" style={{ width: `${readProgress}%` }}></div>

            <div className="detail-wrapper">
                {/* Breadcrumb */}
                <nav className="detail-breadcrumb">
                    <Link to="/">{t('newsDetail.home')}</Link>
                    <i className="fas fa-chevron-right"></i>
                    <Link to="/news">{t('newsDetail.news')}</Link>
                    <i className="fas fa-chevron-right"></i>
                    <span>{t('newsDetail.detail')}</span>
                </nav>

                <button className="back-btn" onClick={handleBack}>
                    <i className="fas fa-arrow-left"></i>
                    {t('newsDetail.backToList')}
                </button>

                <article className="post-detail">
                    <header className="post-header">
                        <h1 className="detail-title">{post.title}</h1>
                        <div className="post-meta">
                            <span className="post-date">
                                <i className="fas fa-calendar-alt"></i>
                                {formatDate(post.createdAt)}
                            </span>
                            <span className="post-reading-time">
                                <i className="fas fa-clock"></i>
                                {t('newsDetail.readingTime')}
                            </span>
                        </div>
                    </header>

                    {post.imageUrl && (
                        <div className="detail-image">
                            <img src={post.imageUrl} alt={post.title} />
                        </div>
                    )}

                    {/* Table of Contents */}
                    <div className="detail-toc">
                        <h4><i className="fas fa-list-ul"></i> {t('newsDetail.toc')}</h4>
                        <ul>
                            {detailedContent.sections
                                .map((section, index) => ({ section, index }))
                                .filter(({ section }) => section.title)
                                .map(({ section, index }) => (
                                    <li key={index}>
                                        <a href={`#section-${index}`}>{section.title}</a>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className="detail-content">
                        <p className="intro-text">{detailedContent.intro}</p>

                        {detailedContent.sections.map((section, index) => renderSection(section, index))}

                        <div className="article-footer">
                            <div className="tags">
                                <i className="fas fa-tags"></i>
                                <span className="tag">{t('newsDetail.tagNews')}</span>
                                <span className="tag">{t('newsDetail.tagUpdate')}</span>
                                <span className="tag">{t('newsDetail.tagTrend')}</span>
                            </div>
                            <div className="share-section">
                                <p>{t('newsDetail.shareArticle')}</p>
                                <div className="share-buttons">
                                    <button className="share-btn facebook">
                                        <i className="fab fa-facebook-f"></i>
                                    </button>
                                    <button className="share-btn twitter">
                                        <i className="fab fa-twitter"></i>
                                    </button>
                                    <button className="share-btn linkedin">
                                        <i className="fab fa-linkedin-in"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default NewsDetail;
