import 'dotenv/config';
import express from 'express';
import Groq from 'groq-sdk';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import mammoth from 'mammoth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const execAsync = promisify(exec);

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ===== Multer setup (PDF/DOCX) =====
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(name).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.doc') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file PDF hoặc DOCX'));
  },
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json({ limit: '10mb' }));

// CORS for integration with React FE
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/docx-preview', express.static(path.join(__dirname, 'node_modules', 'docx-preview', 'dist')));
// Serve uploaded files (avatars, docs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure directories exist
['uploads', 'data', 'renders'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const RENDERS_DIR = path.join(__dirname, 'renders');
const PS1_SCRIPT  = path.join(__dirname, 'scripts', 'docx-to-pdf.ps1');

// Convert DOCX → PDF using Word COM automation (Windows only)
function convertDocxToPdf(inputPath, outputPath) {
  const absIn  = path.resolve(inputPath);
  const absOut = path.resolve(outputPath);

  // Word requires the file to have a .docx extension to detect the format.
  // Use TEMP dir to avoid issues with spaces in the project path.
  const tmpIn  = path.join(process.env.TEMP || process.env.TMP || 'C:\\Temp',
                           `aidoc_${Date.now()}.docx`);
  const tmpOut = path.join(process.env.TEMP || process.env.TMP || 'C:\\Temp',
                           `aidoc_${Date.now()}.pdf`);

  fs.copyFileSync(absIn, tmpIn);

  // Build inline PowerShell so no -File path ambiguity; single-quote escaping for PS strings
  const sq = (s) => s.replace(/'/g, "''");
  const cmd = [
    `$w = New-Object -ComObject Word.Application`,
    `$w.Visible = $false`,
    `$w.DisplayAlerts = 0`,
    `try {`,
    `  $d = $w.Documents.Open('${sq(tmpIn)}', $false, $true)`,
    `  $d.SaveAs2('${sq(tmpOut)}', 17)`,
    `  $d.Close($false)`,
    `} catch { Write-Error $_.Exception.Message; exit 1 }`,
    `finally { $w.Quit() }`,
  ].join('; ');

  return new Promise((resolve, reject) => {
    const ps = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-Command', cmd],
                     { windowsHide: true });

    let stderr = '';
    ps.stderr.on('data', d => { stderr += d.toString(); });
    ps.on('close', code => {
      // Move PDF from TEMP to dest regardless of code (file might still exist)
      try {
        if (fs.existsSync(tmpOut)) {
          fs.copyFileSync(tmpOut, absOut);
          fs.unlinkSync(tmpOut);
        }
      } catch {}
      try { fs.unlinkSync(tmpIn); } catch {}

      if (code !== 0) return reject(new Error(stderr.trim() || `PowerShell exit ${code}`));
      if (!fs.existsSync(absOut)) return reject(new Error('PDF không được tạo ra'));
      resolve();
    });
    ps.on('error', err => {
      try { fs.unlinkSync(tmpIn); } catch {}
      try { fs.unlinkSync(tmpOut); } catch {}
      reject(err);
    });
    // Safety timeout: 2 minutes
    setTimeout(() => { try { ps.kill(); } catch {} }, 120_000);
  });
}

// ===== Data helpers =====
const DOCS_FILE    = path.join(__dirname, 'data', 'documents.json');
const HISTORY_FILE = path.join(__dirname, 'data', 'qa_history.json');

const loadDocs    = () => { try { if (fs.existsSync(DOCS_FILE))    return JSON.parse(fs.readFileSync(DOCS_FILE,    'utf-8')); } catch {} return { documents: [] }; };
const saveDocs    = d  => fs.writeFileSync(DOCS_FILE,    JSON.stringify(d, null, 2));
const loadHistory = () => { try { if (fs.existsSync(HISTORY_FILE)) return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')); } catch {} return { history: [] }; };
const saveHistory = h  => fs.writeFileSync(HISTORY_FILE, JSON.stringify(h, null, 2));

function findDocById(docId) {
  const store = loadDocs();
  return store.documents.find(d => d.id === docId) || null;
}

// ===== Website Knowledge Base =====
const WEBSITE_KNOWLEDGE_FILE = path.join(__dirname, 'data', 'website-knowledge.json');
const MAIN_API_URL = process.env.MAIN_API_URL || 'http://localhost:3001';

function loadWebsiteKnowledge() {
  try {
    if (fs.existsSync(WEBSITE_KNOWLEDGE_FILE))
      return JSON.parse(fs.readFileSync(WEBSITE_KNOWLEDGE_FILE, 'utf-8'));
  } catch (e) { console.error('loadWebsiteKnowledge error', e); }
  return null;
}

// Build flat text chunks from website knowledge for keyword search
function getWebsiteChunks() {
  const kb = loadWebsiteKnowledge();
  if (!kb) return [];
  const chunks = [];

  // Website general info
  if (kb.website) {
    chunks.push({
      text: `Website: ${kb.website.name}. Lĩnh vực: ${kb.website.domain}. ${kb.website.description}`,
      source: 'Thông tin chung website',
      type: 'website'
    });
  }

  // Pages & sections
  for (const page of (kb.pages || [])) {
    for (const section of (page.sections || [])) {
      chunks.push({
        text: `[Trang: ${page.page} - ${section.section}] ${section.content}`,
        source: `${page.page} > ${section.section}`,
        type: 'website'
      });
    }
  }

  // Navigation
  if (kb.navigation) {
    const navText = kb.navigation.map(n => `${n.label} (${n.path})`).join(', ');
    chunks.push({
      text: `Điều hướng website: Các trang chính gồm ${navText}`,
      source: 'Điều hướng',
      type: 'website'
    });
  }

  // Features
  if (kb.features) {
    chunks.push({
      text: `Tính năng website: ${kb.features.join('. ')}`,
      source: 'Tính năng website',
      type: 'website'
    });
  }

  return chunks;
}

// Fetch live data from main backend API (services & posts)
async function fetchLiveWebsiteData() {
  const results = [];
  try {
    const svcRes = await fetch(`${MAIN_API_URL}/api/services`);
    if (svcRes.ok) {
      const services = await svcRes.json();
      if (Array.isArray(services) && services.length > 0) {
        const svcText = services.map((s, i) =>
          `${i + 1}. ${s.title || s.icon || ''}: ${s.content || ''} ${(s.description || []).join('. ')}`
        ).join('\n');
        results.push({
          text: `[Danh sách dịch vụ hiện tại trên website]\n${svcText}`,
          source: 'Dịch vụ (API live)',
          type: 'live-api'
        });
      }
    }
  } catch (e) { /* main API might be down, skip */ }

  try {
    const postRes = await fetch(`${MAIN_API_URL}/api/posts`);
    if (postRes.ok) {
      const posts = await postRes.json();
      if (Array.isArray(posts) && posts.length > 0) {
        const postsText = posts.slice(0, 20).map((p, i) => {
          const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '';
          return `${i + 1}. "${p.title}" (${date}): ${(p.content || '').slice(0, 300)}`;
        }).join('\n');
        results.push({
          text: `[Danh sách bài viết/tin tức hiện tại trên website]\n${postsText}`,
          source: 'Tin tức (API live)',
          type: 'live-api'
        });
      }
    }
  } catch (e) { /* skip */ }

  return results;
}

// Search website chunks by keywords (same approach as document search)
function findRelevantWebsiteChunks(chunks, query, topK = 8) {
  const words = query.toLowerCase()
    .replace(/[^\wÀ-ỹ\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);

  const scored = [];
  for (const chunk of chunks) {
    const lower = chunk.text.toLowerCase();
    let score = 0;
    for (const w of words) {
      const rx = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      score += (lower.match(rx) || []).length;
    }
    if (score > 0) scored.push({ ...chunk, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

function getMimeType(type) {
  if (type === 'pdf') return 'application/pdf';
  if (type === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (type === 'doc') return 'application/msword';
  return 'application/octet-stream';
}

function buildTextPreview(doc) {
  const paragraphs = (doc.chunks || [])
    .map(chunk => chunk.text?.trim())
    .filter(Boolean)
    .slice(0, 120)
    .map(text => `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');
  return paragraphs || '<p>Khong co noi dung de preview.</p>';
}

// ===== Simple file-based user auth =====
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (e) { console.error('loadUsers error', e); }
  return [];
}

function saveUsers(users) {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8'); } catch (e) { console.error('saveUsers error', e); }
}

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const JWT_EXPIRES = '7d';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// helper: get authenticated user object from Authorization header (returns user or null)
function getUserFromReq(req) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET);
    const users = loadUsers();
    return users.find(u => u.id === payload.id) || null;
  } catch (e) { return null; }
}

// multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'avatars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('image/')) cb(null, true);
    else cb(new Error('Only image uploads allowed'));
  }
});

// ===== Auth endpoints =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });

    const users = loadUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(400).json({ error: 'Email đã được đăng ký' });

    const hashed = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(36), name: name || '', email, password: hashed, createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);

    const token = generateToken(user);
    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (e) {
    console.error('register error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });

    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });

    const token = generateToken(user);
    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (e) {
    console.error('login error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // Client should drop JWT on logout; server has no session state in this simple model
  res.json({ ok: true });
});

// Return current authenticated user (with avatar if set)
app.get('/api/auth/me', (req, res) => {
  try {
    const user = getUserFromReq(req);
    if (!user) return res.json({ user: null });
    const safe = { id: user.id, name: user.name, email: user.email, avatar: user.avatar || null };
    res.json({ user: safe });
  } catch (e) {
    res.json({ user: null });
  }
});

// Update profile (name, change password)
app.put('/api/auth/me', async (req, res) => {
  try {
    const cur = getUserFromReq(req);
    if (!cur) return res.status(401).json({ error: 'Unauthorized' });
    const { name, password } = req.body || {};
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === cur.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    if (typeof name === 'string') users[idx].name = name;
    if (password && password.length >= 6) {
      users[idx].password = await bcrypt.hash(password, 10);
    }
    saveUsers(users);
    const safe = { id: users[idx].id, name: users[idx].name, email: users[idx].email, avatar: users[idx].avatar || null };
    res.json({ ok: true, user: safe });
  } catch (e) {
    console.error('profile update error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload avatar
app.post('/api/auth/avatar', avatarUpload.single('avatar'), (req, res) => {
  try {
    const user = getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    // remove old avatar if present and stored locally
    try {
      const old = users[idx].avatar;
      if (old && old.startsWith('/uploads/')) {
        const p = path.join(__dirname, old.replace(/^[/\\]/, ''));
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    } catch (e) {}

    const relPath = `/uploads/avatars/${req.file.filename}`;
    users[idx].avatar = relPath;
    saveUsers(users);
    res.json({ ok: true, avatar: relPath, user: { id: users[idx].id, name: users[idx].name, email: users[idx].email } });
  } catch (e) {
    console.error('avatar upload error', e);
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
});

// ===== Bridge auth (sync from main website) =====
// Accepts user info from the main website and returns a chatbot JWT token.
// If the user doesn't exist in chatbot's user store, auto-create them.
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || 'website-chatbot-bridge-secret-2024';

app.post('/api/auth/bridge', async (req, res) => {
  try {
    const { name, email, username, bridgeSecret } = req.body || {};
    if (bridgeSecret !== BRIDGE_SECRET) return res.status(403).json({ error: 'Invalid bridge secret' });
    if (!email && !username) return res.status(400).json({ error: 'Email or username required' });

    const users = loadUsers();
    const identifier = (email || username || '').toLowerCase();
    let user = users.find(u => (u.email || '').toLowerCase() === identifier || (u.username || '').toLowerCase() === identifier);

    if (!user) {
      // Auto-create user from website data (no password needed — bridge-only auth)
      user = {
        id: Date.now().toString(36),
        name: name || username || '',
        email: email || `${username}@bridge.local`,
        username: username || '',
        password: '',  // no direct login — only via bridge
        createdAt: new Date().toISOString(),
        bridged: true,
      };
      users.push(user);
      saveUsers(users);
    } else {
      // Update name if changed
      if (name && name !== user.name) {
        user.name = name;
        saveUsers(users);
      }
    }

    const token = generateToken(user);
    res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    console.error('bridge auth error', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== Text chunking =====
function chunkText(text, chunkSize = 600, overlap = 120) {
  // Try paragraph-based first
  const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 30);
  const chunks = [];
  let buf = '';
  for (const p of paras) {
    if (buf.length + p.length > chunkSize && buf) {
      chunks.push(buf.trim());
      buf = p;
    } else {
      buf += (buf ? '\n\n' : '') + p;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());

  // Fallback: size-based
  if (chunks.length === 0) {
    for (let i = 0; i < text.length; i += chunkSize - overlap)
      chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// ===== Keyword-based chunk search =====
function findRelevantChunks(documents, query, topK = 5) {
  const words = query.toLowerCase()
    .replace(/[^\wÀ-ỹ\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const scored = [];
  for (const doc of documents) {
    for (const chunk of (doc.chunks || [])) {
      const lower = chunk.text.toLowerCase();
      let score = 0;
      for (const w of words) {
        const rx = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        score += (lower.match(rx) || []).length;
      }
      if (score > 0) scored.push({ ...chunk, docName: doc.name, docId: doc.id, score });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

// ===== DOCUMENT ENDPOINTS =====

// Upload
app.post('/api/docs/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Không có file được gửi lên' });

  // multer reads multipart headers as latin1; re-decode to utf-8 for Vietnamese names
  const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

  try {
    const ext = path.extname(originalName).toLowerCase();
    let text = '';
    let pageCount = 1;

    if (ext === '.pdf') {
      const buf  = fs.readFileSync(file.path);
      const data = await pdfParse(buf);
      text      = data.text;
      pageCount = data.numpages || 1;
    } else {
      const result = await mammoth.extractRawText({ path: file.path });
      text = result.value;
    }

    if (!text.trim()) {
      fs.unlinkSync(file.path);
      return res.status(422).json({ error: 'Không thể trích xuất văn bản từ file này' });
    }

    const rawChunks = chunkText(text);
    const chunks = rawChunks.map((c, i) => ({
      index: i,
      page:  Math.max(1, Math.ceil(((i + 1) / rawChunks.length) * pageCount)),
      text:  c,
    }));

    const doc = {
      id:         crypto.randomUUID(),
      name:       originalName,
      type:       ext.slice(1),
      size:       file.size,
      pageCount,
      chunkCount: chunks.length,
      uploadedAt: new Date().toISOString(),
      filePath:   file.path,
      chunks,
    };

    const store = loadDocs();
    store.documents.push(doc);
    saveDocs(store);

    res.json({
      ok: true,
      doc: { id: doc.id, name: doc.name, type: doc.type, size: doc.size,
             pageCount: doc.pageCount, chunkCount: doc.chunkCount, uploadedAt: doc.uploadedAt },
    });
  } catch (err) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List
app.get('/api/docs', (req, res) => {
  const store = loadDocs();
  res.json(store.documents.map(d => ({
    id: d.id, name: d.name, type: d.type, size: d.size,
    pageCount: d.pageCount, chunkCount: d.chunkCount, uploadedAt: d.uploadedAt,
  })));
});

// View raw file inline (best for PDF)
app.get('/api/docs/:id/file', (req, res) => {
  const doc = findDocById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Khong tim thay tai lieu' });
  if (!doc.filePath || !fs.existsSync(doc.filePath)) {
    return res.status(404).json({ error: 'File da bi xoa hoac khong con ton tai' });
  }

  res.setHeader('Content-Type', getMimeType(doc.type));
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(doc.name)}`);
  res.sendFile(path.resolve(doc.filePath));
});

// Render DOCX → PDF via Word COM, then serve the PDF
app.get('/api/docs/:id/render', async (req, res) => {
  const doc = findDocById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Không tìm thấy tài liệu' });
  if (doc.type !== 'docx') return res.status(400).json({ error: 'Chỉ hỗ trợ DOCX' });
  if (!doc.filePath || !fs.existsSync(doc.filePath))
    return res.status(404).json({ error: 'File không còn tồn tại' });

  const renderPath = path.join(RENDERS_DIR, `${doc.id}.pdf`);

  if (!fs.existsSync(renderPath)) {
    try {
      await convertDocxToPdf(doc.filePath, renderPath);
    } catch (err) {
      console.error('Word render error:', err);
      return res.status(500).json({ error: 'Không thể chuyển đổi file: ' + err.message });
    }
  }

  const pdfName = doc.name.replace(/\.docx?$/i, '.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(pdfName)}`);
  res.sendFile(path.resolve(renderPath));
});

// Preview document content in-app
app.get('/api/docs/:id/preview', async (req, res) => {
  const doc = findDocById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Khong tim thay tai lieu' });

  if (doc.type === 'pdf') {
    return res.json({
      ok: true,
      type: 'pdf',
      name: doc.name,
      fileUrl: `/api/docs/${doc.id}/file`,
    });
  }

  if (doc.type === 'docx' && doc.filePath && fs.existsSync(doc.filePath)) {
    return res.json({
      ok: true,
      type: 'word-render',
      name: doc.name,
      renderUrl: `/api/docs/${doc.id}/render`,
      fileUrl:   `/api/docs/${doc.id}/file`,
    });
  }

  return res.json({
    ok: true,
    type: 'html',
    name: doc.name,
    html: buildTextPreview(doc),
  });
});

// Delete
app.delete('/api/docs/:id', (req, res) => {
  const store = loadDocs();
  const idx   = store.documents.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy tài liệu' });

  const doc = store.documents[idx];
  if (doc.filePath && fs.existsSync(doc.filePath)) {
    try { fs.unlinkSync(doc.filePath); } catch {}
  }
  // Remove cached PDF render if exists
  const renderPath = path.join(RENDERS_DIR, `${doc.id}.pdf`);
  if (fs.existsSync(renderPath)) { try { fs.unlinkSync(renderPath); } catch {} }
  store.documents.splice(idx, 1);
  saveDocs(store);
  res.json({ ok: true });
});

// ===== RAG QUERY (streaming SSE) — Website + Documents =====
app.post('/api/query', async (req, res) => {
  const { question } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });

  // 1. Gather website knowledge chunks (static + live API)
  const websiteChunks = getWebsiteChunks();
  let liveChunks = [];
  try { liveChunks = await fetchLiveWebsiteData(); } catch {}
  const allWebsiteChunks = [...websiteChunks, ...liveChunks];

  // 2. Search website knowledge
  const relevantWebsite = findRelevantWebsiteChunks(allWebsiteChunks, question, 8);

  // 3. Search uploaded documents (if any)
  const store = loadDocs();
  const relevantDocs = store.documents.length > 0
    ? findRelevantChunks(store.documents, question, 5)
    : [];

  // Combine results
  const hasWebsite = relevantWebsite.length > 0;
  const hasDocs = relevantDocs.length > 0;

  if (!hasWebsite && !hasDocs) {
    return res.status(400).json({ error: 'Không tìm thấy nội dung liên quan. Hãy thử đặt câu hỏi khác về website hoặc tài liệu đã upload.' });
  }

  // Build context text
  let contextText = '';
  if (hasWebsite) {
    contextText += '=== THÔNG TIN WEBSITE ===\n\n';
    contextText += relevantWebsite
      .map(c => `[${c.source}]\n${c.text}`)
      .join('\n\n---\n\n');
  }
  if (hasDocs) {
    contextText += '\n\n=== TÀI LIỆU ĐÃ UPLOAD ===\n\n';
    contextText += relevantDocs
      .map(c => `[Tài liệu: "${c.docName}" – Trang ${c.page}]\n${c.text}`)
      .join('\n\n---\n\n');
  }

  const systemPrompt = `Bạn là trợ lý AI thông minh của website VAR - chuyên tư vấn đấu thầu. Bạn có thể trả lời mọi câu hỏi liên quan đến nội dung, dịch vụ, tin tức, thông tin liên hệ, đội ngũ, quy trình làm việc và tất cả các mục trên website.

Quy tắc:
- Trả lời dựa trên thông tin được cung cấp trong context (gồm thông tin website VÀ tài liệu đã upload).
- Nếu câu hỏi về website (dịch vụ, liên hệ, giới thiệu, tin tức, tính năng...), ưu tiên trả lời từ phần "THÔNG TIN WEBSITE".
- Nếu câu hỏi về nội dung tài liệu đã upload, trả lời từ phần "TÀI LIỆU ĐÃ UPLOAD" và trích dẫn tên tài liệu bằng **in đậm**.
- Nếu không tìm thấy thông tin, nói rõ và gợi ý người dùng liên hệ qua trang Liên hệ (/contact) hoặc hotline.
- Trả lời bằng tiếng Việt, thân thiện, rõ ràng, có cấu trúc.
- Đưa ra thông tin hữu ích, cụ thể — không trả lời chung chung.
- Khi nói về các trang trên website, có thể gợi ý đường dẫn (VD: /service, /about, /contact, /news).`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send context metadata first
  const contextMeta = [
    ...relevantWebsite.map(c => ({ docName: c.source, page: 0, text: c.text.slice(0, 250) })),
    ...relevantDocs.map(c => ({ docName: c.docName, page: c.page, text: c.text.slice(0, 250) })),
  ];
  res.write(`data: ${JSON.stringify({ type: 'context', chunks: contextMeta })}\n\n`);

  let fullAnswer = '';
  try {
    const stream = await groq.chat.completions.create({
      model:       'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',
          content: `CONTEXT:\n${contextText}\n\nCÂU HỎI CỦA NGƯỜI DÙNG: ${question}` },
      ],
      temperature: 0.3,
      max_tokens:  2048,
      stream:      true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullAnswer += content;
        res.write(`data: ${JSON.stringify({ type: 'token', content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Query error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
    return;
  }

  // Persist to Q&A history
  try {
    const hist = loadHistory();
    hist.history.unshift({
      id:        crypto.randomUUID(),
      question,
      answer:    fullAnswer,
      context:   contextMeta.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
    if (hist.history.length > 200) hist.history = hist.history.slice(0, 200);
    saveHistory(hist);
  } catch {}
});

// ===== Q&A HISTORY =====
app.get('/api/history', (req, res) => {
  res.json(loadHistory().history);
});

app.delete('/api/history/:id', (req, res) => {
  const hist = loadHistory();
  hist.history = hist.history.filter(h => h.id !== req.params.id);
  saveHistory(hist);
  res.json({ ok: true });
});

app.delete('/api/history', (req, res) => {
  saveHistory({ history: [] });
  res.json({ ok: true });
});

// ===== STATS =====
app.get('/api/stats', (req, res) => {
  const docs = loadDocs();
  const hist = loadHistory();
  const today = new Date().toDateString();
  res.json({
    totalDocs:    docs.documents.length,
    totalPages:   docs.documents.reduce((s, d) => s + (d.pageCount  || 0), 0),
    totalChunks:  docs.documents.reduce((s, d) => s + (d.chunkCount || 0), 0),
    totalQueries: hist.history.length,
    todayQueries: hist.history.filter(h => new Date(h.timestamp).toDateString() === today).length,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

