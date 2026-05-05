import React, { useState, useEffect } from "react";
import "./admin-page.css";
import "./admin-page-enhance.css";
import API_URL from "../../config/api";
import RichTextEditor from "../../component/RichTextEditor";

interface AdminUser {
  _id: string;
  name?: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  createdAt: string;
}

interface AdminPost {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface AdminService {
  _id: string;
  icon: string;
  title: string;
  content: string;
  description: string[];
}

interface AdminContact {
  _id: string;
  full_name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
}

interface SiteSettings {
  siteName: string;
  siteDesc: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebook: string;
  youtube: string;
  linkedin: string;
}

interface AppearSettings {
  primaryColor: string;
  compactSidebar: boolean;
  showBadges: boolean;
  animationsEnabled: boolean;
}

interface NotifSettings {
  emailNewContact: boolean;
  emailNewUser: boolean;
  soundAlert: boolean;
  desktopNotif: boolean;
}

const AdminPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);

  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const itemsPerPage = 6;

  const [showUserModal, setShowUserModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [userForm, setUserForm] = useState({ name: '', username: '', email: '', password: '', role: 'user' });
  const [postForm, setPostForm] = useState({ title: '', content: '', imageUrl: '' });
  const [serviceForm, setServiceForm] = useState({ icon: '', title: '', content: '', description: [] as string[] });
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [settingsTab, setSettingsTab] = useState('account');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [accountForm, setAccountForm] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('adminToken') || '{}');
    return { name: stored.name || 'Administrator', email: stored.email || '', username: stored.username || '' };
  });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [showPwFields, setShowPwFields] = useState<Record<string, boolean>>({ current: false, newPw: false, confirm: false });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() =>
    JSON.parse(localStorage.getItem('siteSettings') || JSON.stringify({
      siteName: 'VAR – Visionary AI & Robotics',
      siteDesc: 'Công ty chuyên cung cấp giải pháp AI và Robotics tiên tiến.',
      contactEmail: 'contact@var.vn',
      contactPhone: '',
      address: '',
      facebook: '',
      youtube: '',
      linkedin: '',
    }))
  );

  const [appearSettings, setAppearSettings] = useState<AppearSettings>(() =>
    JSON.parse(localStorage.getItem('appearSettings') || JSON.stringify({
      primaryColor: '#2563eb',
      compactSidebar: false,
      showBadges: true,
      animationsEnabled: true,
    }))
  );

  const [notifSettings, setNotifSettings] = useState<NotifSettings>(() =>
    JSON.parse(localStorage.getItem('notifSettings') || JSON.stringify({
      emailNewContact: true,
      emailNewUser: false,
      soundAlert: false,
      desktopNotif: false,
    }))
  );

  useEffect(() => {
    const primary = appearSettings.primaryColor || '#2563eb';
    const toHsl = (hex: string): [number, number, number] => {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          default: h = ((r - g) / d + 4) / 6;
        }
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    };
    let darkColor = primary;
    try {
      if (primary.startsWith('#') && primary.length === 7) {
        const [h, s, l] = toHsl(primary);
        darkColor = `hsl(${h},${s}%,${Math.max(l - 10, 5)}%)`;
      }
    } catch (e) { /* ignore */ }
    const container = document.querySelector('.admin-container') as HTMLElement | null;
    if (container) {
      container.style.setProperty('--admin-primary', primary);
      container.style.setProperty('--admin-primary-dark', darkColor);
    }
  }, [appearSettings.primaryColor]);

  const showSavedToast = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSaveSite = (e: React.FormEvent) => { e.preventDefault(); localStorage.setItem('siteSettings', JSON.stringify(siteSettings)); showSavedToast(); };
  const handleSaveAppear = (e: React.FormEvent) => { e.preventDefault(); localStorage.setItem('appearSettings', JSON.stringify(appearSettings)); showSavedToast(); };
  const handleSaveNotif = (e: React.FormEvent) => { e.preventDefault(); localStorage.setItem('notifSettings', JSON.stringify(notifSettings)); showSavedToast(); };
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem('adminToken') || '{}');
    localStorage.setItem('adminToken', JSON.stringify({ ...stored, name: accountForm.name, email: accountForm.email }));
    showSavedToast();
  };
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPw.length < 6) { setPwError('Mật khẩu mới phải ít nhất 6 ký tự.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Mật khẩu xác nhận không khớp.'); return; }
    setPwForm({ current: '', newPw: '', confirm: '' });
    showSavedToast();
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      const user = JSON.parse(adminToken);
      if (user.role === 'admin') {
        setIsLoggedIn(true);
        fetchUsers(); fetchPosts(); fetchServices(); fetchContacts();
      } else {
        localStorage.removeItem('adminToken');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.user.role !== 'admin') { setLoginError('Chỉ admin mới có quyền truy cập trang này!'); return; }
        localStorage.setItem('accessToken', data.acesstoken);
        localStorage.setItem('refreshToken', data.refreshtoken);
        localStorage.setItem('adminToken', JSON.stringify(data.user));
        setIsLoggedIn(true);
        fetchUsers(); fetchPosts(); fetchServices(); fetchContacts();
      } else {
        setLoginError(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối đến server');
    }
  };

  const handleLogout = () => { localStorage.removeItem('adminToken'); setIsLoggedIn(false); setUsers([]); };

  const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users`, { headers: authHeader() });
      if (!response.ok) throw new Error('Không thể lấy dữ liệu người dùng');
      setUsers(await response.json());
      setError(null);
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/posts`, { headers: authHeader() });
      if (!response.ok) throw new Error('Không thể lấy dữ liệu bài viết');
      setPosts(await response.json());
      setError(null);
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/services`, { headers: authHeader() });
      if (!response.ok) throw new Error('Không thể lấy dữ liệu dịch vụ');
      setServices(await response.json());
      setError(null);
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/contacts`, { headers: authHeader() });
      if (!response.ok) throw new Error('Không thể lấy danh sách liên hệ');
      setContacts(await response.json());
      setError(null);
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };

  const getPaginatedData = <T,>(data: T[], currentPage: number): T[] => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = (dataLength: number) => Math.ceil(dataLength / itemsPerPage);

  interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }
  const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return (
      <div className="pagination">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">◀ Trước</button>
        {pages.map(page => (
          <button key={page} onClick={() => onPageChange(page)} className={`pagination-btn ${currentPage === page ? 'active' : ''}`}>{page}</button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">Sau ▶</button>
      </div>
    );
  };

  // USER CRUD
  const handleAddUser = () => { setEditingItem(null); setUserForm({ name: '', username: '', email: '', password: '', role: 'user' }); setShowUserModal(true); };
  const handleEditUser = (user: AdminUser) => { setEditingItem(user); setUserForm({ name: user.name || '', username: user.username, email: user.email, password: user.password || '', role: user.role }); setShowUserModal(true); };
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, { method: 'DELETE', headers: authHeader() });
      if (response.ok) fetchUsers();
    } catch (err) { console.error('Lỗi khi xóa người dùng:', err); }
  };
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `${API_URL}/api/users/${editingItem._id}` : `${API_URL}/api/users`;
      const response = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(userForm) });
      if (response.ok) { setShowUserModal(false); fetchUsers(); }
    } catch (err) { console.error('Lỗi khi lưu người dùng:', err); }
  };

  // POST CRUD
  const handleAddPost = () => { setEditingItem(null); setPostForm({ title: '', content: '', imageUrl: '' }); setShowPostModal(true); };
  const handleEditPost = (post: AdminPost) => { setEditingItem(post); setPostForm({ title: post.title, content: post.content, imageUrl: post.imageUrl || '' }); setShowPostModal(true); };
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, { method: 'DELETE', headers: authHeader() });
      if (response.ok) fetchPosts();
    } catch (err) { console.error('Lỗi khi xóa bài viết:', err); }
  };
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `${API_URL}/api/posts/${editingItem._id}` : `${API_URL}/api/posts`;
      const response = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(postForm) });
      if (response.ok) { setShowPostModal(false); fetchPosts(); }
    } catch (err) { console.error('Lỗi khi lưu bài viết:', err); }
  };

  // SERVICE CRUD
  const handleAddService = () => { setEditingItem(null); setServiceForm({ icon: '', title: '', content: '', description: [] }); setShowServiceModal(true); };
  const handleEditService = (service: AdminService) => { setEditingItem(service); setServiceForm({ icon: service.icon, title: service.title, content: service.content, description: service.description || [] }); setShowServiceModal(true); };
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    try {
      const response = await fetch(`${API_URL}/api/services/${serviceId}`, { method: 'DELETE', headers: authHeader() });
      if (response.ok) fetchServices();
    } catch (err) { console.error('Lỗi khi xóa dịch vụ:', err); }
  };
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `${API_URL}/api/services/${editingItem._id}` : `${API_URL}/api/services`;
      const response = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(serviceForm) });
      if (response.ok) { setShowServiceModal(false); fetchServices(); }
    } catch (err) { console.error('Lỗi khi lưu dịch vụ:', err); }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <h2 className="login-title">Đăng nhập Admin</h2>
          {loginError && <div className="login-error">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập</label>
              <input type="text" className="form-input" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} required placeholder="Nhập username" />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input type="password" className="form-input" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required placeholder="Nhập password" />
            </div>
            <button type="submit" className="login-button">Đăng nhập</button>
          </form>
          <p className="login-note">* Chỉ tài khoản admin mới được phép truy cập</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`admin-container${!appearSettings.animationsEnabled ? ' no-animations' : ''}`}
      style={{ '--admin-primary': appearSettings.primaryColor || '#2563eb' } as React.CSSProperties}
    >
      <div className="admin-layout">
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`sidebar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}${appearSettings.compactSidebar ? ' compact' : ''}`}>
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-name">VAR Admin</span>
              <span className="brand-version">Dashboard</span>
            </div>
          </div>

          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">Điều hướng</div>
            <nav className="sidebar-nav">
              {[
                { key: 'dashboard', label: 'Dashboard', colorClass: 'icon-blue', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg> },
                { key: 'posts', label: 'Bài viết', colorClass: 'icon-cyan', badge: posts.length, icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="14" height="14" rx="2"/><line x1="6" y1="7" x2="14" y2="7" strokeLinecap="round"/><line x1="6" y1="10" x2="14" y2="10" strokeLinecap="round"/><line x1="6" y1="13" x2="10" y2="13" strokeLinecap="round"/></svg> },
                { key: 'users', label: 'Người dùng', colorClass: 'icon-violet', badge: users.length, icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c0-3.1 2.9-5.5 6.5-5.5s6.5 2.4 6.5 5.5" strokeLinecap="round"/></svg> },
                { key: 'services', label: 'Dịch vụ', colorClass: 'icon-emerald', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="11" width="4" height="7" rx="1"/><rect x="8" y="6" width="4" height="12" rx="1"/><rect x="14" y="2" width="4" height="16" rx="1"/></svg> },
                { key: 'contacts', label: 'Liên hệ', colorClass: 'icon-amber', badge: contacts.length, badgeClass: 'menu-badge-amber', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="16" height="12" rx="2"/><polyline points="2,6 10,12 18,6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              ].map(item => (
                <div key={item.key} className="menu-item" onClick={() => { setActiveMenu(item.key); setIsMobileMenuOpen(false); }}>
                  <span className={`menu-link ${activeMenu === item.key ? 'active' : ''}`}>
                    <span className={`menu-icon-wrap ${item.colorClass}`}>{item.icon}</span>
                    <span className="menu-text">{item.label}</span>
                    {appearSettings.showBadges && item.badge && item.badge > 0 && (
                      <span className={`menu-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                    )}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">Hệ thống</div>
            <nav className="sidebar-nav">
              <div className="menu-item" onClick={() => { setActiveMenu('settings'); setIsMobileMenuOpen(false); }}>
                <span className={`menu-link ${activeMenu === 'settings' ? 'active' : ''}`}>
                  <span className="menu-icon-wrap icon-gray">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="2.5"/><path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3l1.3-1.3M14 6l1.3-1.3" strokeLinecap="round"/></svg>
                  </span>
                  <span className="menu-text">Cài đặt</span>
                </span>
              </div>
            </nav>
          </div>

          <div style={{ flex: 1 }}></div>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Administrator</span>
              <span className="sidebar-user-role">VAR System</span>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Đăng xuất">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" strokeLinecap="round"/><polyline points="10 15 13 10 10 5" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="10" x2="13" y2="10" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

        <div className="main-content">
          {/* DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="content-section">
              <div className="dashboard-header">
                <h2 className="section-title">Tổng quan hệ thống</h2>
                <p className="dashboard-subtitle">Quản lý toàn bộ nội dung và người dùng của VAR</p>
              </div>
              <div className="stats-grid">
                {[
                  { key: 'users', label: 'Người dùng', count: users.length, menu: 'users', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c0-3.1 2.9-5.5 6.5-5.5s6.5 2.4 6.5 5.5" strokeLinecap="round"/></svg> },
                  { key: 'posts', label: 'Bài viết', count: posts.length, menu: 'posts', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="14" height="14" rx="2"/><line x1="6" y1="7" x2="14" y2="7" strokeLinecap="round"/><line x1="6" y1="10" x2="14" y2="10" strokeLinecap="round"/><line x1="6" y1="13" x2="10" y2="13" strokeLinecap="round"/></svg> },
                  { key: 'services', label: 'Dịch vụ', count: services.length, menu: 'services', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="11" width="4" height="7" rx="1"/><rect x="8" y="6" width="4" height="12" rx="1"/><rect x="14" y="2" width="4" height="16" rx="1"/></svg> },
                  { key: 'contacts', label: 'Liên hệ', count: contacts.length, menu: 'contacts', icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="4" width="16" height="12" rx="2"/><polyline points="2,6 10,12 18,6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                ].map(s => (
                  <div key={s.key} className={`stat-card stat-${s.key}`} onClick={() => setActiveMenu(s.menu)}>
                    <div className="stat-card-body">
                      <div className="stat-icon-wrap">{s.icon}</div>
                      <div className="stat-info">
                        <span className="stat-number">{s.count}</span>
                        <span className="stat-label">{s.label}</span>
                      </div>
                    </div>
                    <div className="stat-footer">Quản lý <span>→</span></div>
                  </div>
                ))}
              </div>
              <div className="quick-access-section">
                <h3 className="quick-access-title">Truy cập nhanh</h3>
                <div className="quick-access-grid">
                  {[
                    { menu: 'users', label: 'Quản lý người dùng' },
                    { menu: 'posts', label: 'Quản lý bài viết' },
                    { menu: 'services', label: 'Quản lý dịch vụ' },
                    { menu: 'contacts', label: 'Xem liên hệ' },
                    { menu: 'settings', label: 'Cài đặt hệ thống' },
                  ].map(item => (
                    <div key={item.menu} className="quick-access-item" onClick={() => setActiveMenu(item.menu)}>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACTS */}
          {activeMenu === 'contacts' && (
            <div className="content-section">
              <h2 className="section-title-admin">Danh sách liên hệ</h2>
              {loading && <p className="loading-text">Đang tải dữ liệu...</p>}
              {error && <div className="error-message">Lỗi: {error}</div>}
              {!loading && !error && contacts.length === 0 && <p className="no-users">Chưa có liên hệ nào</p>}
              {!loading && !error && contacts.length > 0 && (
                <div className="table-container">
                  <table className="users-table">
                    <thead><tr><th>ID</th><th>Tên</th><th>Email</th><th>Tiêu đề</th><th>Nội dung</th><th>Ngày</th></tr></thead>
                    <tbody>
                      {contacts.map((c) => (
                        <tr key={c._id}>
                          <td>{c._id}</td><td>{c.full_name}</td><td>{c.email}</td>
                          <td>{c.subject || 'N/A'}</td><td>{c.message}</td>
                          <td>{new Date(c.createdAt).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* USERS */}
          {activeMenu === 'users' && (
            <div className="content-section">
              {loading && <p className="loading-text">Đang tải dữ liệu...</p>}
              {error && <div className="error-message">Lỗi: {error}</div>}
              {!loading && !error && (
                <div className="users-section">
                  <div className="users-header">
                    <h2 className="users-title">Người dùng ({users.length})</h2>
                    <div className="header-actions">
                      <button onClick={handleAddUser} className="add-button">+ Thêm mới</button>
                      <button onClick={fetchUsers} className="refresh-button">Làm mới</button>
                    </div>
                  </div>
                  {users.length === 0 ? (
                    <p className="no-users">Chưa có người dùng nào trong hệ thống</p>
                  ) : (
                    <>
                      <div className="table-container">
                        <table className="users-table">
                          <thead><tr><th>ID</th><th>Tên</th><th>Username</th><th>Email</th><th>Role</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
                          <tbody>
                            {getPaginatedData(users, currentUserPage).map((user) => (
                              <tr key={user._id}>
                                <td>{user._id}</td><td>{user.name || 'N/A'}</td><td>{user.username}</td><td>{user.email}</td>
                                <td><span className={`role-badge ${user.role || 'user'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
                                <td>{new Date(user.createdAt).toLocaleString('vi-VN')}</td>
                                <td>
                                  <div className="action-buttons">
                                    <button onClick={() => handleEditUser(user)} className="edit-btn">Sửa</button>
                                    <button onClick={() => handleDeleteUser(user._id)} className="delete-btn">Xóa</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination currentPage={currentUserPage} totalPages={getTotalPages(users.length)} onPageChange={setCurrentUserPage} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* POSTS */}
          {activeMenu === 'posts' && (
            <div className="content-section">
              <div className="users-header posts-header">
                <h2 className="section-title-admin">Bài viết</h2>
                <div className="header-actions">
                  <button onClick={handleAddPost} className="add-button">+ Thêm mới</button>
                  <button onClick={fetchPosts} className="refresh-button">Làm mới</button>
                </div>
              </div>
              {loading && <p className="loading-text">Đang tải dữ liệu...</p>}
              {error && <div className="error-message">Lỗi: {error}</div>}
              {!loading && !error && posts.length === 0 && <p className="no-users">Chưa có bài viết nào</p>}
              {!loading && !error && posts.length > 0 && (
                <>
                  <div className="posts-grid">
                    {getPaginatedData(posts, currentPostPage).map((post) => (
                      <div key={post._id} className="post-card">
                        {post.imageUrl && <div className="post-image"><img src={post.imageUrl} alt={post.title} /></div>}
                        <div className="post-content">
                          <h3 className="post-title">{post.title}</h3>
                          <p className="post-text">{post.content}</p>
                          <div className="post-footer">
                            <span className="post-date">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                            <div className="action-buttons">
                              <button onClick={() => handleEditPost(post)} className="edit-btn">Sửa</button>
                              <button onClick={() => handleDeletePost(post._id)} className="delete-btn">Xóa</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination currentPage={currentPostPage} totalPages={getTotalPages(posts.length)} onPageChange={setCurrentPostPage} />
                </>
              )}
            </div>
          )}

          {/* SERVICES */}
          {activeMenu === 'services' && (
            <div className="content-section">
              <div className="users-header services-header">
                <h2 className="section-title-admin">Dịch vụ</h2>
                <div className="header-actions">
                  <button onClick={handleAddService} className="add-button">+ Thêm mới</button>
                  <button onClick={fetchServices} className="refresh-button">Làm mới</button>
                </div>
              </div>
              {loading && <p className="loading-text">Đang tải dữ liệu...</p>}
              {error && <div className="error-message">Lỗi: {error}</div>}
              {!loading && !error && services.length === 0 && <p className="no-users">Chưa có dịch vụ nào</p>}
              {!loading && !error && services.length > 0 && (
                <>
                  <div className="services-grid">
                    {getPaginatedData(services, currentServicePage).map((service) => (
                      <div key={service._id} className="service-card">
                        <div className="service-header">
                          <div className="service-icon"><i className={service.icon}></i></div>
                          <h3 className="service-title">{service.title}</h3>
                        </div>
                        <p className="service-content">{service.content}</p>
                        <ul className="service-description">{service.description.map((desc, i) => <li key={i}>{desc}</li>)}</ul>
                        <div className="card-actions">
                          <button onClick={() => handleEditService(service)} className="edit-btn">Sửa</button>
                          <button onClick={() => handleDeleteService(service._id)} className="delete-btn">Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination currentPage={currentServicePage} totalPages={getTotalPages(services.length)} onPageChange={setCurrentServicePage} />
                </>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeMenu === 'settings' && (
            <div className="content-section settings-section">
              {settingsSaved && (
                <div className="settings-toast">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8"/><polyline points="7 10 9.5 12.5 13 8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Đã lưu thay đổi!
                </div>
              )}
              <div className="settings-header">
                <div>
                  <h2 className="section-title" style={{ marginBottom: 4 }}>Cài đặt hệ thống</h2>
                  <p className="settings-subtitle">Quản lý cấu hình, tài khoản và giao diện admin</p>
                </div>
              </div>

              <div className="settings-tabs">
                {[
                  { key: 'account', label: 'Tài khoản' },
                  { key: 'site', label: 'Website' },
                  { key: 'appear', label: 'Giao diện' },
                  { key: 'notif', label: 'Thông báo' },
                ].map(tab => (
                  <button key={tab.key} className={`settings-tab-btn ${settingsTab === tab.key ? 'active' : ''}`} onClick={() => setSettingsTab(tab.key)}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {settingsTab === 'account' && (
                <div className="settings-body">
                  <div className="settings-card">
                    <div className="settings-card-head">
                      <div><h3 className="settings-card-title">Hồ sơ quản trị viên</h3><p className="settings-card-desc">Cập nhật tên hiển thị và email tài khoản admin</p></div>
                    </div>
                    <form className="settings-form" onSubmit={handleSaveAccount}>
                      <div className="settings-form-row">
                        <div className="settings-field"><label>Họ và tên</label><input type="text" value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} placeholder="Nhập tên đầy đủ" /></div>
                        <div className="settings-field"><label>Tên đăng nhập</label><input type="text" value={accountForm.username} disabled className="disabled-input" /></div>
                      </div>
                      <div className="settings-field"><label>Email</label><input type="email" value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} placeholder="admin@var.vn" /></div>
                      <div className="settings-form-actions"><button type="submit" className="settings-save-btn">Lưu hồ sơ</button></div>
                    </form>
                  </div>
                  <div className="settings-card">
                    <div className="settings-card-head"><div><h3 className="settings-card-title">Đổi mật khẩu</h3><p className="settings-card-desc">Cập nhật mật khẩu để bảo mật tài khoản</p></div></div>
                    {pwError && <div className="settings-error">{pwError}</div>}
                    <form className="settings-form" onSubmit={handleChangePassword}>
                      {[
                        { key: 'current', label: 'Mật khẩu hiện tại', ph: '••••••••' },
                        { key: 'newPw', label: 'Mật khẩu mới', ph: 'Tối thiểu 6 ký tự' },
                        { key: 'confirm', label: 'Xác nhận mật khẩu', ph: 'Nhập lại mật khẩu mới' },
                      ].map(f => (
                        <div className="settings-field" key={f.key}>
                          <label>{f.label}</label>
                          <div className="settings-pw-wrap">
                            <input
                              type={showPwFields[f.key] ? 'text' : 'password'}
                              value={pwForm[f.key as keyof typeof pwForm]}
                              onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                              placeholder={f.ph}
                              required
                            />
                            <button type="button" className="settings-eye-btn" onClick={() => setShowPwFields(p => ({ ...p, [f.key]: !p[f.key] }))}>
                              <i className={`fas ${showPwFields[f.key] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="settings-form-actions"><button type="submit" className="settings-save-btn">Đổi mật khẩu</button></div>
                    </form>
                  </div>
                  <div className="settings-card">
                    <div className="settings-card-head"><div><h3 className="settings-card-title">Phiên đăng nhập</h3></div></div>
                    <div className="settings-session-info">
                      <div className="session-row"><span className="session-label">Trạng thái</span><span className="session-badge active">Đang hoạt động</span></div>
                      <div className="session-row"><span className="session-label">Đăng nhập lúc</span><span className="session-val">{new Date().toLocaleString('vi-VN')}</span></div>
                      <div className="session-row"><span className="session-label">Quyền hạn</span><span className="session-val">Administrator</span></div>
                    </div>
                    <div className="settings-form-actions">
                      <button type="button" className="settings-danger-btn" onClick={handleLogout}>Đăng xuất tất cả phiên</button>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'site' && (
                <div className="settings-body">
                  <div className="settings-card">
                    <div className="settings-card-head"><div><h3 className="settings-card-title">Thông tin website</h3></div></div>
                    <form className="settings-form" onSubmit={handleSaveSite}>
                      <div className="settings-field"><label>Tên website</label><input type="text" value={siteSettings.siteName} onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })} /></div>
                      <div className="settings-field"><label>Mô tả ngắn</label><textarea rows={3} value={siteSettings.siteDesc} onChange={e => setSiteSettings({ ...siteSettings, siteDesc: e.target.value })} /></div>
                      <div className="settings-form-row">
                        <div className="settings-field"><label>Email liên hệ</label><input type="email" value={siteSettings.contactEmail} onChange={e => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })} /></div>
                        <div className="settings-field"><label>Số điện thoại</label><input type="text" value={siteSettings.contactPhone} onChange={e => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })} /></div>
                      </div>
                      <div className="settings-field"><label>Địa chỉ</label><input type="text" value={siteSettings.address} onChange={e => setSiteSettings({ ...siteSettings, address: e.target.value })} /></div>
                      <div className="settings-form-row">
                        <div className="settings-field"><label>Facebook URL</label><input type="url" value={siteSettings.facebook} onChange={e => setSiteSettings({ ...siteSettings, facebook: e.target.value })} /></div>
                        <div className="settings-field"><label>YouTube URL</label><input type="url" value={siteSettings.youtube} onChange={e => setSiteSettings({ ...siteSettings, youtube: e.target.value })} /></div>
                      </div>
                      <div className="settings-field"><label>LinkedIn URL</label><input type="url" value={siteSettings.linkedin} onChange={e => setSiteSettings({ ...siteSettings, linkedin: e.target.value })} /></div>
                      <div className="settings-form-actions"><button type="submit" className="settings-save-btn">Lưu thông tin website</button></div>
                    </form>
                  </div>
                </div>
              )}

              {settingsTab === 'appear' && (
                <div className="settings-body">
                  <div className="settings-card">
                    <div className="settings-card-head"><div><h3 className="settings-card-title">Giao diện Admin</h3></div></div>
                    <form className="settings-form" onSubmit={handleSaveAppear}>
                      <div className="settings-field">
                        <label>Màu chủ đạo</label>
                        <div className="settings-color-row">
                          {['#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2'].map(c => (
                            <button key={c} type="button" className={`color-swatch ${appearSettings.primaryColor === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setAppearSettings({ ...appearSettings, primaryColor: c })} />
                          ))}
                          <input type="color" className="color-custom-picker" value={appearSettings.primaryColor} onChange={e => setAppearSettings({ ...appearSettings, primaryColor: e.target.value })} />
                        </div>
                      </div>
                      {[
                        { key: 'compactSidebar', label: 'Sidebar thu gọn', desc: 'Ẩn chữ, chỉ hiển thị icon trong sidebar' },
                        { key: 'showBadges', label: 'Hiển thị số badge', desc: 'Hiện số lượng bài viết, người dùng... trên menu' },
                        { key: 'animationsEnabled', label: 'Bật hiệu ứng chuyển động', desc: 'Fade-in, slide khi chuyển trang' },
                      ].map(opt => (
                        <div className="settings-toggle-row" key={opt.key}>
                          <div className="settings-toggle-info">
                            <span className="settings-toggle-label">{opt.label}</span>
                            <span className="settings-toggle-desc">{opt.desc}</span>
                          </div>
                          <button type="button" className={`settings-toggle ${appearSettings[opt.key as keyof AppearSettings] ? 'on' : ''}`} onClick={() => setAppearSettings(p => ({ ...p, [opt.key]: !p[opt.key as keyof AppearSettings] }))}>
                            <span className="settings-toggle-knob" />
                          </button>
                        </div>
                      ))}
                      <div className="settings-form-actions"><button type="submit" className="settings-save-btn">Lưu giao diện</button></div>
                    </form>
                  </div>
                </div>
              )}

              {settingsTab === 'notif' && (
                <div className="settings-body">
                  <div className="settings-card">
                    <div className="settings-card-head"><div><h3 className="settings-card-title">Cài đặt thông báo</h3></div></div>
                    <form className="settings-form" onSubmit={handleSaveNotif}>
                      {[
                        { key: 'emailNewContact', label: 'Email khi có liên hệ mới', desc: 'Nhận email khi khách hàng gửi form liên hệ' },
                        { key: 'emailNewUser', label: 'Email khi có người dùng mới', desc: 'Nhận email khi có tài khoản đăng ký mới' },
                        { key: 'soundAlert', label: 'Âm thanh cảnh báo', desc: 'Phát âm thanh khi có hoạt động quan trọng' },
                        { key: 'desktopNotif', label: 'Thông báo trình duyệt', desc: 'Hiển thị popup thông báo trên desktop' },
                      ].map(opt => (
                        <div className="settings-toggle-row" key={opt.key}>
                          <div className="settings-toggle-info">
                            <span className="settings-toggle-label">{opt.label}</span>
                            <span className="settings-toggle-desc">{opt.desc}</span>
                          </div>
                          <button type="button" className={`settings-toggle ${notifSettings[opt.key as keyof NotifSettings] ? 'on' : ''}`} onClick={() => setNotifSettings(p => ({ ...p, [opt.key]: !p[opt.key as keyof NotifSettings] }))}>
                            <span className="settings-toggle-knob" />
                          </button>
                        </div>
                      ))}
                      <div className="settings-form-actions"><button type="submit" className="settings-save-btn">Lưu cài đặt thông báo</button></div>
                    </form>
                  </div>
                  <div className="settings-card">
                    <div className="settings-card-head"><div><h3 className="settings-card-title">Xuất dữ liệu</h3><p className="settings-card-desc">Tải xuống dữ liệu hệ thống dạng JSON</p></div></div>
                    <div className="settings-export-grid">
                      {[
                        { label: 'Người dùng', data: users, file: 'users' },
                        { label: 'Bài viết', data: posts, file: 'posts' },
                        { label: 'Dịch vụ', data: services, file: 'services' },
                        { label: 'Liên hệ', data: contacts, file: 'contacts' },
                      ].map(ex => (
                        <button key={ex.file} type="button" className="settings-export-btn" onClick={() => {
                          const blob = new Blob([JSON.stringify(ex.data, null, 2)], { type: 'application/json' });
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = `${ex.file}-${new Date().toISOString().slice(0, 10)}.json`;
                          a.click();
                        }}>
                          {ex.label} <span className="export-count">{ex.data.length}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingItem ? 'Sửa người dùng' : 'Thêm người dùng'}</h3>
            <form onSubmit={handleSaveUser}>
              <div className="form-group"><label>Tên đầy đủ</label><input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required placeholder="Nhập tên đầy đủ" /></div>
              <div className="form-group"><label>Username</label><input type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required /></div>
              <div className="form-group">
                <label>Password {editingItem && '(có thể thay đổi mật khẩu mới)'}</label>
                <div className="password-input-wrapper">
                  <input type={showPassword ? "text" : "password"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required={!editingItem} placeholder={editingItem ? "Mật khẩu hiện tại" : "Nhập mật khẩu"} />
                  <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                </div>
              </div>
              <div className="form-group"><label>Role</label><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></select></div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowUserModal(false)} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn">{editingItem ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingItem ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
            <form onSubmit={handleSavePost}>
              <div className="form-group"><label>Tiêu đề</label><input type="text" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} required /></div>
              <div className="form-group">
                <label>Nội dung</label>
                <RichTextEditor value={postForm.content} onChange={(html) => setPostForm({ ...postForm, content: html })} />
              </div>
              <div className="form-group"><label>URL hình ảnh</label><input type="url" value={postForm.imageUrl} onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" /></div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPostModal(false)} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn">{editingItem ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingItem ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h3>
            <form onSubmit={handleSaveService}>
              <div className="form-group"><label>Icon (FontAwesome class)</label><input type="text" value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} placeholder="fa-solid fa-code" required /></div>
              <div className="form-group"><label>Tiêu đề</label><input type="text" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} required /></div>
              <div className="form-group"><label>Nội dung</label><textarea rows={3} value={serviceForm.content} onChange={(e) => setServiceForm({ ...serviceForm, content: e.target.value })} required /></div>
              <div className="form-group">
                <label>Mô tả (mỗi dòng một mục)</label>
                <textarea rows={4} value={serviceForm.description.join('\n')} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value.split('\n') })} placeholder={"Tính năng 1\nTính năng 2\nTính năng 3"} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowServiceModal(false)} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn">{editingItem ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
