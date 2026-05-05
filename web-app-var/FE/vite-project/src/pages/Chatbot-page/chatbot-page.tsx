import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./chatbot-page.css";
import API_URL from "../../config/api";

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || "http://localhost:3000";
const CHATBOT_API = "/chatbot-api";

interface LoadingStep {
  text: string;
  icon: string;
}

const LOADING_STEPS: LoadingStep[] = [
  { text: "Đang khởi tạo hệ thống AI...", icon: "fa-microchip" },
  { text: "Kết nối tới máy chủ...", icon: "fa-server" },
  { text: "Tải mô hình trí tuệ nhân tạo...", icon: "fa-brain" },
  { text: "Chuẩn bị giao diện chat...", icon: "fa-comments" },
  { text: "Sẵn sàng phục vụ!", icon: "fa-check-circle" },
];

const MIN_LOADING_MS = 3500;

const ChatbotPage = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", username: "", email: "", password: "" });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setIsAuthenticated(true);
    setAuthChecked(true);
  }, []);

  const syncAuth = useCallback(async () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const user = JSON.parse(raw);
      const res = await fetch(`${CHATBOT_API}/auth/bridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          username: user.username,
          bridgeSecret: "website-chatbot-bridge-secret-2024",
        }),
      });
      const data = await res.json();
      if (data.ok && data.token && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "AUTH_SYNC", token: data.token },
          CHATBOT_URL
        );
      }
    } catch (e) {
      console.warn("Chatbot auth sync failed:", e);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("accessToken", data.acesstoken);
        localStorage.setItem("refreshToken", data.refreshtoken);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsAuthenticated(true);
        setLoginForm({ username: "", password: "" });
      } else {
        setLoginError(data.message || "Đăng nhập thất bại");
      }
    } catch {
      setLoginError("Không thể kết nối đến server");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok) {
        const loginRes = await fetch(`${API_URL}/api/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: registerForm.username, password: registerForm.password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem("accessToken", loginData.acesstoken);
          localStorage.setItem("refreshToken", loginData.refreshtoken);
          localStorage.setItem("user", JSON.stringify(loginData.user));
          setIsAuthenticated(true);
          setRegisterForm({ name: "", username: "", email: "", password: "" });
        } else {
          setShowRegister(false);
          setLoginError("");
        }
      } else {
        setRegisterError(data.message || "Đăng ký thất bại");
      }
    } catch {
      setRegisterError("Không thể kết nối đến server");
    } finally {
      setRegisterLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const totalSteps = LOADING_STEPS.length;
    const stepDuration = MIN_LOADING_MS / totalSteps;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const target = ((currentStep + 1) / totalSteps) * 100;
        const increment = (target - prev) * 0.15;
        return Math.min(prev + Math.max(increment, 0.5), 100);
      });
    }, 50);

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps) {
        setLoadingStep(currentStep);
      } else {
        clearInterval(stepInterval);
      }
    }, stepDuration);

    splashTimerRef.current = setTimeout(() => {
      setProgress(100);
      setLoadingStep(totalSteps - 1);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setSplashDone(true), 600);
      }, 400);
    }, MIN_LOADING_MS);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
    };
  }, [isAuthenticated]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    syncAuth();
  };

  const showSplash = !splashDone;

  if (!authChecked) return null;

  if (!isAuthenticated) {
    return (
      <div className="chatbot-fullscreen">
        <header className="chatbot-topbar">
          <div className="chatbot-topbar-left">
            <Link to="/" className="chatbot-back-btn">
              <i className="fas fa-arrow-left"></i>
              <span>Về trang chủ</span>
            </Link>
            <div className="chatbot-topbar-divider"></div>
            <div className="chatbot-topbar-brand">
              <div className="chatbot-topbar-icon"><i className="fas fa-robot"></i></div>
              <div className="chatbot-topbar-info">
                <h1>AI Document Search</h1>
                <p>Tra cứu tài liệu thông minh bằng AI</p>
              </div>
            </div>
          </div>
        </header>

        <div className="chatbot-auth-gate">
          <div className="chatbot-auth-particles">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="chatbot-auth-particle" style={{
                '--delay': `${Math.random() * 5}s`,
                '--duration': `${3 + Math.random() * 4}s`,
                '--x': `${Math.random() * 100}%`,
                '--size': `${2 + Math.random() * 4}px`,
              } as React.CSSProperties} />
            ))}
          </div>

          <div className="chatbot-auth-card">
            <div className="chatbot-auth-icon"><i className="fas fa-robot"></i></div>
            <h2>{showRegister ? "Đăng ký tài khoản" : "Đăng nhập"}</h2>
            <p>{showRegister ? "Tạo tài khoản mới để sử dụng AI Chatbot" : "Đăng nhập để sử dụng AI Chatbot"}</p>

            {!showRegister ? (
              <form onSubmit={handleLogin} className="chatbot-auth-form">
                {loginError && <div className="chatbot-auth-error"><i className="fas fa-exclamation-circle"></i> {loginError}</div>}
                <div className="chatbot-auth-field">
                  <i className="fas fa-user"></i>
                  <input type="text" placeholder="Tên đăng nhập" value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} required autoFocus />
                </div>
                <div className="chatbot-auth-field">
                  <i className="fas fa-lock"></i>
                  <input type="password" placeholder="Mật khẩu" value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                </div>
                <button type="submit" className="chatbot-auth-submit" disabled={loginLoading}>
                  {loginLoading ? <><i className="fas fa-spinner fa-spin"></i> Đang đăng nhập...</> : <><i className="fas fa-sign-in-alt"></i> Đăng nhập</>}
                </button>
                <div className="chatbot-auth-switch">
                  Chưa có tài khoản? <button type="button" onClick={() => { setShowRegister(true); setLoginError(""); }}>Đăng ký ngay</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="chatbot-auth-form">
                {registerError && <div className="chatbot-auth-error"><i className="fas fa-exclamation-circle"></i> {registerError}</div>}
                <div className="chatbot-auth-field">
                  <i className="fas fa-user-tag"></i>
                  <input type="text" placeholder="Họ và tên" value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required autoFocus />
                </div>
                <div className="chatbot-auth-field">
                  <i className="fas fa-user"></i>
                  <input type="text" placeholder="Tên đăng nhập" value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} required />
                </div>
                <div className="chatbot-auth-field">
                  <i className="fas fa-envelope"></i>
                  <input type="email" placeholder="Email" value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
                </div>
                <div className="chatbot-auth-field">
                  <i className="fas fa-lock"></i>
                  <input type="password" placeholder="Mật khẩu" value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required minLength={6} />
                </div>
                <button type="submit" className="chatbot-auth-submit" disabled={registerLoading}>
                  {registerLoading ? <><i className="fas fa-spinner fa-spin"></i> Đang đăng ký...</> : <><i className="fas fa-user-plus"></i> Đăng ký</>}
                </button>
                <div className="chatbot-auth-switch">
                  Đã có tài khoản? <button type="button" onClick={() => { setShowRegister(false); setRegisterError(""); }}>Đăng nhập</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-fullscreen">
      <header className="chatbot-topbar">
        <div className="chatbot-topbar-left">
          <Link to="/" className="chatbot-back-btn">
            <i className="fas fa-arrow-left"></i>
            <span>Về trang chủ</span>
          </Link>
          <div className="chatbot-topbar-divider"></div>
          <div className="chatbot-topbar-brand">
            <div className="chatbot-topbar-icon"><i className="fas fa-robot"></i></div>
            <div className="chatbot-topbar-info">
              <h1>AI Document Search</h1>
              <p>Tra cứu tài liệu thông minh bằng AI</p>
            </div>
          </div>
        </div>
        <div className="chatbot-topbar-right">
          <div className="chatbot-status">
            <span className="chatbot-status-dot"></span>
            Online
          </div>
        </div>
      </header>

      {showSplash && (
        <div className={`chatbot-splash ${fadeOut ? "chatbot-splash--fade-out" : ""}`}>
          <div className="chatbot-splash__content">
            <div className="chatbot-splash__particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="chatbot-splash__particle" style={{
                  '--delay': `${Math.random() * 5}s`,
                  '--duration': `${3 + Math.random() * 4}s`,
                  '--x': `${Math.random() * 100}%`,
                  '--size': `${2 + Math.random() * 4}px`,
                } as React.CSSProperties} />
              ))}
            </div>

            <div className="chatbot-splash__icon-wrapper">
              <div className="chatbot-splash__ring chatbot-splash__ring--outer"></div>
              <div className="chatbot-splash__ring chatbot-splash__ring--inner"></div>
              <div className="chatbot-splash__icon"><i className="fas fa-robot"></i></div>
            </div>

            <h2 className="chatbot-splash__title">AI Document Search</h2>
            <p className="chatbot-splash__subtitle">Hệ thống tra cứu tài liệu thông minh</p>

            <div className="chatbot-splash__steps">
              {LOADING_STEPS.map((step, index) => (
                <div key={index} className={`chatbot-splash__step ${
                  index < loadingStep ? "chatbot-splash__step--done" :
                  index === loadingStep ? "chatbot-splash__step--active" : ""
                }`}>
                  <div className="chatbot-splash__step-icon">
                    <i className={`fas ${index < loadingStep ? "fa-check" : step.icon}`}></i>
                  </div>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>

            <div className="chatbot-splash__progress">
              <div className="chatbot-splash__progress-track">
                <div className="chatbot-splash__progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="chatbot-splash__progress-text">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      )}

      {splashDone && !iframeLoaded && (
        <div className="chatbot-loading-overlay">
          <div className="chatbot-loader">
            <div className="chatbot-loader-icon"><i className="fas fa-robot"></i></div>
            <p>Đang tải hệ thống AI...</p>
            <div className="chatbot-loader-bar">
              <div className="chatbot-loader-fill"></div>
            </div>
          </div>
        </div>
      )}

      <div className="chatbot-iframe-container">
        <iframe
          ref={iframeRef}
          src={CHATBOT_URL}
          title="AI Document Search"
          className="chatbot-iframe"
          allow="clipboard-read; clipboard-write"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
};

export default ChatbotPage;
