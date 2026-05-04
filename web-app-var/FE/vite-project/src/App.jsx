import { useState, useEffect } from "react";
import "./App.css";
import { Navbar } from "./component/navbar.jsx";
import { Footer } from "./component/footer.jsx";
import "@fortawesome/fontawesome-free/css/all.css";
import HomePage from "./pages/Home-page/home-page.jsx";
import About from "./pages/About-page/about.jsx";
import { Contact } from "./component/contact.jsx";
import AdminPage from "./pages/admin-page/admin-page.jsx";
import ServicePage from "./pages/Service-page/service-page.jsx";
import NewsPage from "./pages/News-page/news-page.jsx";
import NewsDetail from "./pages/News-page/news-detail.jsx";
import ChatbotPage from "./pages/Chatbot-page/chatbot-page.jsx";
import ChatWidget from "./component/ChatWidget.jsx";
import { Route, Routes, Outlet, useLocation } from "react-router-dom";

function ScrollToTop() {  
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function Layout() {
  const location = useLocation();

  // Scroll-reveal: observe [data-reveal] elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <div className="page-enter" key={location.pathname}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <Routes>
        {/* Layout chung: Navbar + Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetail />} />
        </Route>

        {/* Route admin KHÔNG có layout */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Route AI Chatbot - full screen, KHÔNG có Navbar */}
        <Route path="/ai-chatbot" element={<ChatbotPage />} />
      </Routes>

      {/* Floating Chat Widget - hiển thị trên mọi trang */}
      <ChatWidget />
    </>
  );
}

export default App;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          