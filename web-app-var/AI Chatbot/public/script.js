/* ==============================================
   AI DOCUMENT SEARCH  –  Front-end Logic
   ============================================== */

// ===== Simple markdown renderer (no external dep needed) =====
function renderMarkdown(text) {
    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Unordered lists (simple)
        .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Ordered lists
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        // Paragraphs
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^(?!<[hulo])(.+)$/gm, (m) => m.startsWith('<') ? m : m)
        // Wrap in p
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// ===== Toast =====
const toastEl = document.getElementById('toast');
let toastTimer = null;
function toast(msg, type = '') {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 3000);
}

// ===== Settings =====
const SETTINGS_KEY = 'ai-doc-search-settings';
const DEFAULT_SETTINGS = {
    theme: 'system',
    compactSidebar: false,
    reducedMotion: false,
    pdfOpenMode: 'modal',
};

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

let settings = loadSettings();

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getResolvedTheme(theme) {
    if (theme !== 'system') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applySettings() {
    document.body.dataset.theme = getResolvedTheme(settings.theme);
    document.body.classList.toggle('compact-sidebar', !!settings.compactSidebar);
    document.body.classList.toggle('reduced-motion', !!settings.reducedMotion);
}

// ===== Navigation =====
const navItems   = document.querySelectorAll('.nav-item');
const pages      = document.querySelectorAll('.page');
const topbarTitle = document.getElementById('topbarTitle');
const PAGE_TITLES = {
    dashboard: 'Dashboard',
    upload:    'Upload tài liệu',
    search:    'Hệ thống tra cứu tài liệu AI',
    history:   'Lịch sử hỏi đáp',
    files:     'Quản lý file',
    profile:   'Hồ sơ',
};

function goToPage(pageId) {
    navItems.forEach(n => n.classList.toggle('active', n.dataset.page === pageId));
    pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + pageId));
    topbarTitle.textContent = PAGE_TITLES[pageId] || '';
    if (pageId === 'dashboard') loadDashboard();
    if (pageId === 'history')   loadHistoryPage();
    if (pageId === 'files')     loadFilesPage();
    if (pageId === 'search')    refreshSearchPageFiles();
    if (pageId === 'upload')    refreshUploadPageFiles();
    if (pageId === 'profile')   loadProfilePage();
}
navItems.forEach(n => n.addEventListener('click', () => goToPage(n.dataset.page)));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (settings.theme === 'system') applySettings();
});

// ===== API helpers =====
async function apiFetch(path, opts = {}) {
    // attach auth token if present
    const token = localStorage.getItem('authToken');
    opts.headers = opts.headers || {};
    if (token && !opts.headers.Authorization && !opts.headers.authorization) {
        opts.headers['Authorization'] = 'Bearer ' + token;
    }
    const res = await fetch(path, opts);
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `HTTP ${res.status}`);
    }
    return res.json();
}

// ===== Auth helpers — DISABLED (auth handled by main website bridge) =====
const authModal = null;
const authBackdrop = null;
const authClose = null;
const tabLogin = null;
const tabRegister = null;
const fieldName = null;
const authForm = null;
const authName = null;
const authEmail = null;
const authPassword = null;
const authError = null;
const profileBtn = null;

const PROFILE_SVG = '';
const CHEVRON_SVG = '';

function updateProfileBtn(user) { /* no-op */ }
function showAuthModal(mode) { /* no-op — disabled */ }
function hideAuthModal() { /* no-op — disabled */ }
function setAuthTab(tab) { /* no-op */ }
function showProfileDropdown(anchor) { /* no-op — disabled */ }

// Restore session on page load (profile update disabled)
async function loadAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
        await apiFetch('/api/auth/me');
    } catch (e) {
        localStorage.removeItem('authToken');
    }
}

// ===== Format helpers =====
function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function fmtTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// ===== File icon HTML =====
function fileIconHtml(type) {
    const label = type === 'pdf' ? 'PDF' : 'DOC';
    return `<div class="file-icon ${type}">${label}</div>`;
}

function fileActionButtons(docId) {
    return `
        <button class="icon-btn-sm primary view-doc-btn" title="Xem file" data-id="${docId}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="icon-btn-sm danger del-doc-btn" title="Xóa" data-id="${docId}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>`;
}

// ===== Shared state =====
let allDocs    = [];
let allHistory = [];

async function refreshAllData() {
    [allDocs, allHistory] = await Promise.all([
        apiFetch('/api/docs').catch(() => []),
        apiFetch('/api/history').catch(() => []),
    ]);
}

// ====================================================
// UPLOAD & FILE LIST (shared logic)
// ====================================================
async function uploadFiles(files, statusEl, progressWrapper, progressFill, progressText) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);

    for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        if (statusEl) {
            statusEl.textContent = `Đang xử lý: ${f.name}`;
            statusEl.className = 'upload-status';
        }
        if (progressWrapper) {
            progressWrapper.style.display = 'flex';
            progressFill.style.width = '10%';
            progressText.textContent = `Đang xử lý ${f.name}…`;
        }

        try {
            const fd = new FormData();
            fd.append('file', f);
            const res = await apiFetch('/api/docs/upload', { method: 'POST', body: fd });

            if (statusEl) { statusEl.textContent = `✓ Đã upload: ${res.doc.name}`; statusEl.className = 'upload-status success'; }
            if (progressFill) progressFill.style.width = `${Math.round(((i + 1) / arr.length) * 100)}%`;
            toast(`Đã upload: ${res.doc.name}`, 'success');
        } catch (err) {
            if (statusEl) { statusEl.textContent = `✗ Lỗi: ${err.message}`; statusEl.className = 'upload-status error'; }
            toast(`Lỗi upload: ${err.message}`, 'error');
        }
    }

    if (progressWrapper) setTimeout(() => { progressWrapper.style.display = 'none'; }, 1500);
    await refreshAllData();
    refreshSearchPageFiles();
    refreshUploadPageFiles();
    loadFilesPage();
}

function buildFileListHtml(docs, showPages = false) {
    if (!docs.length) return '';
    return docs.map(d => `
        <div class="file-item" data-id="${d.id}">
            ${fileIconHtml(d.type)}
            <span class="file-name" title="${d.name}">${d.name}</span>
            ${showPages ? `<span class="file-meta">${d.pageCount}tr</span>` : ''}
            <span class="file-meta">${fmtSize(d.size)}</span>
            <div class="file-actions">
                ${fileActionButtons(d.id)}
            </div>
        </div>`).join('');
}

const viewerModal = document.getElementById('viewerModal');
const viewerBackdrop = document.getElementById('viewerBackdrop');
const viewerClose = document.getElementById('viewerClose');
const viewerTitle = document.getElementById('viewerTitle');
const viewerSubtitle = document.getElementById('viewerSubtitle');
const viewerBody = document.getElementById('viewerBody');
const viewerOpenLink = document.getElementById('viewerOpenLink');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const settingsBackdrop = document.getElementById('settingsBackdrop');
const settingsClose = document.getElementById('settingsClose');
const themeSelect = document.getElementById('themeSelect');
const compactSidebarToggle = document.getElementById('compactSidebarToggle');
const reducedMotionToggle = document.getElementById('reducedMotionToggle');
const pdfOpenModeSelect = document.getElementById('pdfOpenModeSelect');
const goToFilesBtn = document.getElementById('goToFilesBtn');
const goToHistoryBtn = document.getElementById('goToHistoryBtn');
const clearHistorySettingsBtn = document.getElementById('clearHistorySettingsBtn');
const clearDocsSettingsBtn = document.getElementById('clearDocsSettingsBtn');

function syncSettingsControls() {
    if (themeSelect) themeSelect.value = settings.theme;
    if (compactSidebarToggle) compactSidebarToggle.checked = !!settings.compactSidebar;
    if (reducedMotionToggle) reducedMotionToggle.checked = !!settings.reducedMotion;
    if (pdfOpenModeSelect) pdfOpenModeSelect.value = settings.pdfOpenMode;
}

function openSettings() {
    settingsModal.classList.add('open');
    settingsModal.setAttribute('aria-hidden', 'false');
    syncSettingsControls();
    document.body.style.overflow = 'hidden';
}

function closeSettings() {
    settingsModal.classList.remove('open');
    settingsModal.setAttribute('aria-hidden', 'true');
    if (!viewerModal?.classList.contains('open')) document.body.style.overflow = '';
}

async function clearAllDocs() {
    if (!allDocs.length) {
        toast('Không có file nào để xóa', 'error');
        return;
    }
    if (!confirm('Xóa toàn bộ file đã upload? Không thể hoàn tác.')) return;
    await Promise.all(allDocs.map(doc => apiFetch(`/api/docs/${doc.id}`, { method: 'DELETE' })));
    await refreshAllData();
    refreshSearchPageFiles();
    refreshUploadPageFiles();
    loadFilesPage();
    loadDashboard();
    closeViewer();
    toast('Đã xóa toàn bộ file', 'success');
}

function closeViewer() {
    if (!viewerModal) return;
    viewerModal.classList.remove('open');
    viewerModal.setAttribute('aria-hidden', 'true');
    viewerBody.innerHTML = '<div class="viewer-empty">Chọn một file để xem.</div>';
    viewerBody.className = 'viewer-body';
    viewerOpenLink.style.display = 'none';
    if (!settingsModal?.classList.contains('open')) document.body.style.overflow = '';
}



async function openViewer(docId) {
    const doc = allDocs.find(item => item.id === docId);
    if (!doc) {
        toast('Không tìm thấy tài liệu', 'error');
        return;
    }

    if (doc.type === 'pdf' && settings.pdfOpenMode === 'new-tab') {
        window.open(`/api/docs/${docId}/file`, '_blank', 'noopener');
        return;
    }

    viewerModal.classList.add('open');
    viewerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    viewerTitle.textContent = 'Xem tài liệu';
    viewerSubtitle.textContent = doc.name;
    viewerOpenLink.style.display = 'none';
    viewerBody.innerHTML = '<div class="viewer-loading">Đang tải nội dung tài liệu...</div>';

    try {
        const preview = await apiFetch(`/api/docs/${docId}/preview`);
        viewerTitle.textContent = doc.type === 'pdf' ? 'PDF Preview' : 'Document Preview';
        viewerSubtitle.textContent = doc.name;

        if (preview.type === 'pdf') {
            viewerBody.className = 'viewer-body';
            viewerOpenLink.href = preview.fileUrl;
            viewerOpenLink.style.display = '';
            viewerBody.innerHTML = `<iframe class="viewer-iframe" src="${preview.fileUrl}#toolbar=1&navpanes=0"></iframe>`;
            return;
        }

        if (preview.type === 'word-render') {
            // Link to download the original DOCX
            viewerOpenLink.href = preview.fileUrl;
            viewerOpenLink.style.display = '';
            // Show loading state while Word converts in background
            viewerBody.className = 'viewer-body';
            viewerBody.innerHTML = '<div class="viewer-loading">Đang dựng tài liệu bằng Microsoft Word, vui lòng chờ...</div>';
            // Fetch render (triggers conversion if not cached); once done swap to iframe
            try {
                const probe = await fetch(preview.renderUrl);
                if (!probe.ok) {
                    const j = await probe.json().catch(() => ({}));
                    throw new Error(j.error || `HTTP ${probe.status}`);
                }
                viewerBody.innerHTML = `<iframe class="viewer-iframe" src="${preview.renderUrl}#toolbar=1&navpanes=0"></iframe>`;
            } catch (renderErr) {
                viewerBody.innerHTML = `<div class="viewer-error">Không thể dựng file: ${escHtml(renderErr.message)}</div>`;
            }
            return;
        }

        viewerBody.className = 'viewer-body';
        viewerOpenLink.href = `/api/docs/${docId}/file`;
        viewerOpenLink.style.display = '';
        viewerBody.innerHTML = `<div class="viewer-html">${preview.html}</div>`;
    } catch (error) {
        viewerBody.className = 'viewer-body';
        viewerBody.innerHTML = `<div class="viewer-error">Không thể mở file: ${escHtml(error.message)}</div>`;
    }
}

viewerBackdrop?.addEventListener('click', closeViewer);
viewerClose?.addEventListener('click', closeViewer);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && viewerModal?.classList.contains('open')) closeViewer();
    if (e.key === 'Escape' && settingsModal?.classList.contains('open')) closeSettings();
});

settingsButton?.addEventListener('click', openSettings);
settingsButton?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSettings();
    }
});
settingsBackdrop?.addEventListener('click', closeSettings);
settingsClose?.addEventListener('click', closeSettings);
themeSelect?.addEventListener('change', e => {
    settings.theme = e.target.value;
    saveSettings();
    applySettings();
});
compactSidebarToggle?.addEventListener('change', e => {
    settings.compactSidebar = e.target.checked;
    saveSettings();
    applySettings();
});
reducedMotionToggle?.addEventListener('change', e => {
    settings.reducedMotion = e.target.checked;
    saveSettings();
    applySettings();
});
pdfOpenModeSelect?.addEventListener('change', e => {
    settings.pdfOpenMode = e.target.value;
    saveSettings();
});
goToFilesBtn?.addEventListener('click', () => {
    closeSettings();
    goToPage('files');
});
goToHistoryBtn?.addEventListener('click', () => {
    closeSettings();
    goToPage('history');
});
clearHistorySettingsBtn?.addEventListener('click', async () => {
    closeSettings();
    clearHistBtn?.click();
});
clearDocsSettingsBtn?.addEventListener('click', async () => {
    closeSettings();
    try {
        await clearAllDocs();
    } catch (error) {
        toast('Lỗi xóa file: ' + error.message, 'error');
    }
});

async function deleteDoc(id) {
    if (!confirm('Xóa tài liệu này? Không thể hoàn tác.')) return;
    try {
        await apiFetch(`/api/docs/${id}`, { method: 'DELETE' });
        toast('Đã xóa tài liệu', 'success');
        await refreshAllData();
        refreshSearchPageFiles();
        refreshUploadPageFiles();
        loadFilesPage();
        loadDashboard();
    } catch (e) {
        toast('Lỗi xóa: ' + e.message, 'error');
    }
}

document.addEventListener('click', e => {
    const viewBtn = e.target.closest('.view-doc-btn');
    if (viewBtn) {
        openViewer(viewBtn.dataset.id);
        return;
    }
    const btn = e.target.closest('.del-doc-btn');
    if (btn) deleteDoc(btn.dataset.id);
});

// ====================================================
// SEARCH PAGE
// ====================================================
const searchDropzone  = document.getElementById('searchDropzone');
const searchFileInput = document.getElementById('searchFileInput');
const searchUploadBtn = document.getElementById('searchUploadBtn');
const searchUploadSt  = document.getElementById('searchUploadStatus');
const searchFileList  = document.getElementById('searchFileList');
const searchFileEmpty = document.getElementById('searchFileEmpty');

let pendingSearchFiles = null;

setupDropzone(searchDropzone, searchFileInput, f => { pendingSearchFiles = f; });

searchUploadBtn.addEventListener('click', () => {
    const files = pendingSearchFiles || searchFileInput.files;
    if (!files || files.length === 0) { toast('Chưa chọn file nào', 'error'); return; }
    uploadFiles(files, searchUploadSt, null, null, null);
    pendingSearchFiles = null;
});

function refreshSearchPageFiles() {
    if (!allDocs.length) {
        searchFileList.innerHTML = '';
        searchFileEmpty.style.display = '';
        return;
    }
    searchFileEmpty.style.display = 'none';
    searchFileList.innerHTML = buildFileListHtml(allDocs);
}

// ====================================================
// UPLOAD PAGE
// ====================================================
const uploadDropzone   = document.getElementById('uploadDropzone');
const fileInput        = document.getElementById('fileInput');
const uploadPageList   = document.getElementById('uploadPageFileList');
const uploadPageEmpty  = document.getElementById('uploadPageEmpty');
const uploadProgress   = document.getElementById('uploadProgress');
const progressFill     = document.getElementById('progressFill');
const progressText     = document.getElementById('progressText');

let pendingUploadFiles = null;

setupDropzone(uploadDropzone, fileInput, (files) => {
    pendingUploadFiles = files;
    uploadFiles(files, null, uploadProgress, progressFill, progressText);
});

function refreshUploadPageFiles() {
    if (!allDocs.length) {
        uploadPageList.innerHTML = '';
        uploadPageEmpty.style.display = '';
        return;
    }
    uploadPageEmpty.style.display = 'none';
    uploadPageList.innerHTML = buildFileListHtml(allDocs, true);
}

// ====================================================
// DROPZONE HELPER
// ====================================================
function setupDropzone(zone, input, onFiles) {
    if (!zone || !input) return;
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        onFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', () => onFiles(input.files));
}

// ====================================================
// RAG CHAT
// ====================================================
const chatMessages = document.getElementById('chatMessages');
const chatWelcome  = document.getElementById('chatWelcome');
const chatInput    = document.getElementById('chatInput');
const askBtn       = document.getElementById('askBtn');

let isAsking = false;

chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askQuestion(); }
});
askBtn.addEventListener('click', askQuestion);

function appendUserMsg(text) {
    chatWelcome?.remove();
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = `
        <div class="user-bubble">${escHtml(text)}</div>
        <div class="user-avatar-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createAiMsg() {
    const div = document.createElement('div');
    div.className = 'chat-msg ai';
    div.innerHTML = `
        <div class="ai-avatar">AI</div>
        <div class="ai-bubble">
            <div class="ai-thinking">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>
            <div class="ai-text" style="display:none"></div>
        </div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function askQuestion() {
    if (isAsking) return;
    const q = chatInput.value.trim();
    if (!q) return;

    isAsking = true;
    chatInput.value = '';
    askBtn.disabled = true;
    askBtn.textContent = '...';

    appendUserMsg(q);
    const aiDiv = createAiMsg();
    const thinkEl = aiDiv.querySelector('.ai-thinking');
    const textEl  = aiDiv.querySelector('.ai-text');

    let fullText = '';
    let contextChunks = [];

    try {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('authToken');
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res = await fetch('/api/query', {
            method: 'POST',
            headers,
            body: JSON.stringify({ question: q }),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.error || 'Lỗi server');
        }

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop();

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const raw = line.slice(6);
                if (raw === '[DONE]') break;
                try {
                    const msg = JSON.parse(raw);
                    if (msg.type === 'context') {
                        contextChunks = msg.chunks;
                        thinkEl.style.display = 'none';
                        textEl.style.display  = '';
                    } else if (msg.type === 'token') {
                        fullText += msg.content;
                        textEl.innerHTML = renderMarkdown(fullText);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    } else if (msg.type === 'error') {
                        throw new Error(msg.message);
                    }
                } catch (parseErr) {
                    if (parseErr.message !== 'Unexpected end of JSON input') throw parseErr;
                }
            }
        }

        // Add context box
        if (contextChunks.length) {
            const ctxDiv = document.createElement('div');
            ctxDiv.className = 'context-box';
            const topChunk = contextChunks[0];
            ctxDiv.innerHTML = `
                <div class="context-header">Context (Đoạn tài liệu liên quan):</div>
                <div class="context-quote">"${escHtml(topChunk.text)}"</div>
                <div class="context-page">Page ${topChunk.page} – ${escHtml(topChunk.docName)}</div>`;
            aiDiv.querySelector('.ai-bubble').appendChild(ctxDiv);
        }

    } catch (err) {
        thinkEl.style.display = 'none';
        textEl.style.display  = '';
        textEl.innerHTML = `<span style="color:var(--danger)">⚠ ${escHtml(err.message)}</span>`;
    } finally {
        isAsking = false;
        askBtn.disabled = false;
        askBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg> Hỏi AI`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Refresh history panels
    await refreshAllData();
    renderMiniHistory();
}

// ====================================================
// MINI HISTORY (search page left panel)
// ====================================================
const miniHistList = document.getElementById('miniHistList');

function renderMiniHistory() {
    if (!allHistory.length) {
        miniHistList.innerHTML = '<div class="empty-hint">Chưa có câu hỏi nào</div>';
        return;
    }
    miniHistList.innerHTML = allHistory.slice(0, 20).map(h => `
        <div class="mini-hist-item">
            <div class="mhi-q">
                <span class="mhi-q-text">${escHtml(h.question)}</span>
                <span class="mhi-time">${fmtTime(h.timestamp)}</span>
            </div>
            <div class="mhi-a">${escHtml(h.answer?.slice(0, 80) || '')}…</div>
        </div>`).join('');
}

// ====================================================
// DASHBOARD
// ====================================================
async function loadDashboard() {
    try {
        const stats = await apiFetch('/api/stats');
        document.getElementById('stat-docs').textContent    = stats.totalDocs;
        document.getElementById('stat-pages').textContent   = stats.totalPages;
        document.getElementById('stat-queries').textContent = stats.totalQueries;
        document.getElementById('stat-today').textContent   = stats.todayQueries;
    } catch {}

    const docListEl  = document.getElementById('dash-doc-list');
    const histListEl = document.getElementById('dash-hist-list');

    if (!allDocs.length) {
        docListEl.innerHTML = '<div class="empty-hint">Chưa có tài liệu</div>';
    } else {
        docListEl.innerHTML = allDocs.slice(0, 6).map(d => `
            <div class="dash-doc-item">
                ${fileIconHtml(d.type)}
                <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(d.name)}</span>
                <span style="font-size:11px;color:var(--text-3);flex-shrink:0">${fmtSize(d.size)}</span>
            </div>`).join('');
    }

    if (!allHistory.length) {
        histListEl.innerHTML = '<div class="empty-hint">Chưa có câu hỏi</div>';
    } else {
        histListEl.innerHTML = allHistory.slice(0, 5).map(h => `
            <div class="dash-hist-item">
                <span class="dhi-q">${escHtml(h.question.slice(0, 80))}</span>
                <span class="dhi-t">${fmtDate(h.timestamp)}</span>
            </div>`).join('');
    }
}

// ====================================================
// HISTORY PAGE
// ====================================================
const histSearchInput = document.getElementById('histSearchInput');
const clearHistBtn    = document.getElementById('clearHistBtn');
const historyList     = document.getElementById('historyList');

histSearchInput?.addEventListener('input', renderHistoryPage);
clearHistBtn?.addEventListener('click', async () => {
    if (!confirm('Xóa toàn bộ lịch sử hỏi đáp?')) return;
    try {
        await apiFetch('/api/history', { method: 'DELETE' });
        toast('Đã xóa toàn bộ lịch sử', 'success');
        await refreshAllData();
        renderHistoryPage();
        renderMiniHistory();
    } catch (e) { toast(e.message, 'error'); }
});

async function loadHistoryPage() {
    await refreshAllData();
    renderHistoryPage();
}

function renderHistoryPage() {
    const q = (histSearchInput?.value || '').toLowerCase();
    const filtered = allHistory.filter(h =>
        !q || h.question.toLowerCase().includes(q) || h.answer?.toLowerCase().includes(q)
    );
    if (!filtered.length) {
        historyList.innerHTML = '<div class="empty-hint">Không có kết quả</div>';
        return;
    }
    historyList.innerHTML = filtered.map(h => {
        const sources = (h.context || []).map(c =>
            `<span class="hi-src">📄 ${escHtml(c.docName)} tr.${c.page}</span>`
        ).join('');
        return `
        <div class="history-item">
            <div class="hi-header" onclick="toggleHiBody(this)">
                <div class="hi-q">Q: ${escHtml(h.question)}</div>
                <div class="hi-meta">
                    <span class="hi-time">${fmtDate(h.timestamp)}</span>
                    <button class="hi-del-btn" onclick="event.stopPropagation();delHistory('${h.id}')">✕</button>
                    <span class="hi-expand-btn">›</span>
                </div>
            </div>
            <div class="hi-body">
                <div class="hi-answer">${escHtml(h.answer?.slice(0, 400) || '')}${(h.answer?.length || 0) > 400 ? '…' : ''}</div>
                ${sources ? `<div class="hi-context">${sources}</div>` : ''}
            </div>
        </div>`;
    }).join('');
}

window.toggleHiBody = function(headerEl) {
    const body = headerEl.nextElementSibling;
    const btn  = headerEl.querySelector('.hi-expand-btn');
    body.classList.toggle('open');
    btn.classList.toggle('open');
};

window.delHistory = async function(id) {
    try {
        await apiFetch(`/api/history/${id}`, { method: 'DELETE' });
        toast('Đã xóa', 'success');
        await refreshAllData();
        renderHistoryPage();
        renderMiniHistory();
    } catch (e) { toast(e.message, 'error'); }
};

// ====================================================
// FILE MANAGER PAGE
// ====================================================
const filesSearchInput = document.getElementById('filesSearchInput');
const fileManagerList  = document.getElementById('fileManagerList');

filesSearchInput?.addEventListener('input', renderFilesPage);

async function loadFilesPage() {
    renderFilesPage();
}

function renderFilesPage() {
    const q = (filesSearchInput?.value || '').toLowerCase();
    const filtered = allDocs.filter(d => !q || d.name.toLowerCase().includes(q));
    if (!filtered.length) {
        fileManagerList.innerHTML = '<div class="empty-hint">Không có file nào</div>';
        return;
    }
    fileManagerList.innerHTML = filtered.map(d => `
        <div class="fm-item">
            <div class="fm-icon ${d.type}">${d.type === 'pdf' ? 'PDF' : 'DOC'}</div>
            <div class="fm-info">
                <div class="fm-name" title="${escHtml(d.name)}">${escHtml(d.name)}</div>
                <div class="fm-meta">${d.pageCount} trang · ${fmtSize(d.size)} · ${fmtDate(d.uploadedAt)}</div>
            </div>
            <div class="fm-actions">
                <button class="fm-view" onclick="fmView('${d.id}')">Xem</button>
                <button class="fm-del" onclick="fmDelete('${d.id}')">Xóa</button>
            </div>
        </div>`).join('');
}

window.fmDelete = async function(id) {
    await deleteDoc(id);
    renderFilesPage();
};

window.fmView = function(id) {
    openViewer(id);
};

// ====================================================
// Bridge auth listener (receive token from parent website)
// ====================================================
window.addEventListener('message', async (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'AUTH_SYNC' && data.token) {
        localStorage.setItem('authToken', data.token);
        await loadAuth();
        await refreshAllData();
        renderMiniHistory();
        loadDashboard();
    }

    if (data.type === 'AUTH_LOGOUT') {
        localStorage.removeItem('authToken');
        updateProfileBtn(null);
        location.reload();
    }
});

// ====================================================
// INIT
// ====================================================
(async () => {
    applySettings();
    syncSettingsControls();
    await loadAuth();
    await refreshAllData();
    refreshSearchPageFiles();
    refreshUploadPageFiles();
    renderMiniHistory();
    loadDashboard();
})();

