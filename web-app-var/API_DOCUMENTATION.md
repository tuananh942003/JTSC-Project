# 📊 THỐNG KÊ TẤT CẢ API TRONG DỰ ÁN

## 🔧 Cấu hình API

- **Base URL**: `http://localhost:3001` (mặc định) hoặc được cấu hình qua biến môi trường `VITE_API_URL`
- **File cấu hình**: `FE/vite-project/src/config/api.js`
- **Authentication**: JWT Bearer Token
- **Token Storage**: localStorage

---

## 📁 BACKEND APIs (Server)

### 1️⃣ **USER APIs** (`/api/users`)

#### Endpoints

| Method | Endpoint | Chức năng | Authentication | Quyền hạn |
|--------|----------|-----------|----------------|-----------|
| POST | `/api/users/login` | Đăng nhập | ❌ Không | Công khai |
| POST | `/api/users/register` | Đăng ký | ❌ Không | Công khai |
| POST | `/api/users` | Tạo user mới | ✅ Bearer Token | Admin only |
| GET | `/api/users` | Lấy danh sách users | ✅ Bearer Token | Authenticated |
| PUT | `/api/users/:id` | Cập nhật user | ✅ Bearer Token | Authenticated |
| DELETE | `/api/users/:id` | Xóa user | ✅ Bearer Token | Admin only |

#### Request Body Examples

**Login:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Register/Create User:**
```json
{
  "name": "string",
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user|admin"
}
```

**Update User:**
```json
{
  "name": "string",
  "username": "string",
  "email": "string",
  "password": "string (optional)",
  "role": "user|admin"
}
```

#### Response Examples

**Login Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "string",
    "name": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  },
  "acesstoken": "string (JWT 24h)",
  "refreshtoken": "string (JWT 7d)"
}
```

**Get All Users Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "username": "string",
    "email": "string",
    "role": "user|admin",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

#### File Backend
- **Routes**: `server/src/routes/user.routes.js`
- **Controller**: `server/src/controller/user.controller.js`
- **Model**: `server/src/model/user.model.js`
- **Middleware**: `server/src/middleware/auth.middleware.js`

---

### 2️⃣ **POST APIs** (`/api/posts`)

#### Endpoints

| Method | Endpoint | Chức năng | Authentication | Trạng thái bảo mật |
|--------|----------|-----------|----------------|---------------------|
| GET | `/api/posts` | Lấy tất cả bài viết | ❌ Không | Công khai |
| GET | `/api/posts/:id` | Lấy chi tiết 1 bài viết | ❌ Không | Công khai |
| POST | `/api/posts` | Tạo bài viết mới | ⚠️ Không (nên thêm) | Nên có auth |
| PUT | `/api/posts/:id` | Cập nhật bài viết | ⚠️ Không (nên thêm) | Nên có auth |
| DELETE | `/api/posts/:id` | Xóa bài viết | ⚠️ Không (nên thêm) | Nên có auth |

#### Request Body Examples

**Create/Update Post:**
```json
{
  "title": "string",
  "content": "string",
  "imageUrl": "string (optional)"
}
```

#### Response Examples

**Get All Posts:**
```json
[
  {
    "_id": "string",
    "title": "string",
    "content": "string",
    "imageUrl": "string",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

**Get Post By ID:**
```json
{
  "_id": "string",
  "title": "string",
  "content": "string",
  "imageUrl": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

#### File Backend
- **Routes**: `server/src/routes/post.routes.js`
- **Controller**: `server/src/controller/post.controller.js`
- **Model**: `server/src/model/posts.model.js`

#### Sorting
- Bài viết được sắp xếp theo `createdAt` giảm dần (mới nhất trước)

---

### 3️⃣ **SERVICE APIs** (`/api/services`)

#### Endpoints

| Method | Endpoint | Chức năng | Authentication | Trạng thái bảo mật |
|--------|----------|-----------|----------------|---------------------|
| GET | `/api/services` | Lấy tất cả dịch vụ | ❌ Không | Công khai |
| POST | `/api/services` | Tạo dịch vụ mới | ⚠️ Không (nên thêm) | Nên có auth |
| PUT | `/api/services/:id` | Cập nhật dịch vụ | ⚠️ Không (nên thêm) | Nên có auth |
| DELETE | `/api/services/:id` | Xóa dịch vụ | ⚠️ Không (nên thêm) | Nên có auth |

#### Request Body Examples

**Create/Update Service:**
```json
{
  "icon": "string",
  "title": "string",
  "content": "string",
  "description": ["string", "string", "..."]
}
```

#### Response Examples

**Get All Services:**
```json
[
  {
    "_id": "string",
    "icon": "string",
    "title": "string",
    "content": "string",
    "description": ["string array"],
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
]
```

#### File Backend
- **Routes**: `server/src/routes/service.routes.js`
- **Controller**: `server/src/controller/service.controller.js`
- **Model**: `server/src/model/service.model.js`

---

## 💻 FRONTEND API CALLS

### 📄 **Login Modal**
- **File**: `FE/vite-project/src/component/loginModal.jsx`
- **API sử dụng**: 
  - `POST ${API_URL}/api/users/login`
- **Chức năng**:
  - Đăng nhập user
  - Lưu `accessToken`, `refreshToken`, `user` vào localStorage
  - Callback `onLoginSuccess()` sau khi đăng nhập thành công
- **Error handling**: Hiển thị lỗi kết nối hoặc thông tin đăng nhập sai

---

### 📄 **Register Modal**
- **File**: `FE/vite-project/src/component/registerModal.jsx`
- **API sử dụng**: 
  - `POST ${API_URL}/api/users/register`
- **Chức năng**:
  - Đăng ký user mới với role mặc định là 'user'
  - Validate password confirmation
  - Auto redirect sang login modal sau 2 giây khi thành công
- **Validation**:
  - Kiểm tra password và confirmPassword khớp nhau
  - Required fields: name, username, email, password

---

### 📄 **Admin Page**
- **File**: `FE/vite-project/src/pages/admin-page/admin-page.jsx`
- **APIs sử dụng**: **TẤT CẢ 15 endpoints**

#### Authentication APIs
- `POST /api/users/login` - Admin login
  - Kiểm tra role phải là 'admin'
  - Lưu token vào localStorage

#### User Management APIs
- `GET /api/users` - Lấy danh sách users (Authorization: Bearer Token)
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật thông tin user
- `DELETE /api/users/:id` - Xóa user

#### Post Management APIs
- `GET /api/posts` - Lấy danh sách bài viết
- `POST /api/posts` - Tạo bài viết mới
- `PUT /api/posts/:id` - Cập nhật bài viết
- `DELETE /api/posts/:id` - Xóa bài viết

#### Service Management APIs
- `GET /api/services` - Lấy danh sách dịch vụ
- `POST /api/services` - Tạo dịch vụ mới
- `PUT /api/services/:id` - Cập nhật dịch vụ
- `DELETE /api/services/:id` - Xóa dịch vụ

#### Features
- **Pagination**: 6 items/page cho mỗi loại data
- **Modal forms**: Separate modals cho User, Post, và Service
- **Role-based access**: Chỉ admin mới truy cập được
- **CRUD operations**: Full Create, Read, Update, Delete cho tất cả entities
- **Responsive design**: Mobile menu với hamburger button

---

### 📄 **News Page**
- **File**: `FE/vite-project/src/pages/News-page/news-page.jsx`
- **API sử dụng**: 
  - `GET ${API_URL}/api/posts`
- **Chức năng**:
  - Hiển thị danh sách bài viết với pagination (6 items/page)
  - Format ngày tháng theo locale 'vi-VN'
  - Navigate đến trang chi tiết khi click "Xem chi tiết"
- **Loading states**: Spinner khi đang tải dữ liệu
- **Error handling**: Hiển thị error message nếu có lỗi

---

### 📄 **News Detail Page**
- **File**: `FE/vite-project/src/pages/News-page/news-detail.jsx`
- **API sử dụng**: 
  - `GET ${API_URL}/api/posts/:id`
- **Chức năng**:
  - Lấy chi tiết 1 bài viết dựa trên ID từ URL params
  - Hiển thị hình ảnh, tiêu đề, nội dung, ngày đăng
- **Dynamic routing**: Sử dụng `useParams()` để lấy ID từ URL

---

### 📄 **Service Page**
- **File**: `FE/vite-project/src/pages/Service-page/service-page.jsx`
- **API sử dụng**: 
  - `GET ${API_URL}/api/services`
- **Chức năng**:
  - Hiển thị danh sách dịch vụ
  - Public access (không cần đăng nhập)
- **Features**: 
  - Loading state với console logs
  - Error handling với try-catch

---

## 🔐 Authentication & Authorization

### JWT Token Configuration
- **Algorithm**: HS256
- **Access Token Expiry**: 24 giờ
- **Refresh Token Expiry**: 7 ngày
- **Secret Key**: `process.env.SECRET_KEY` hoặc `'your-secret-key-here'` (default)

### Middleware
1. **`authenticate`**: 
   - Xác thực JWT token từ Authorization header
   - Format: `Bearer <token>`
   - Attach user info vào `req.user`

2. **`requireAdmin`**: 
   - Kiểm tra `req.user.role === 'admin'`
   - Phải sử dụng sau middleware `authenticate`

### Header Format
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Password Security
- **Hashing**: bcrypt
- **Salt Rounds**: 10
- **Hash on**: Create và Update operations

### LocalStorage Keys
- `accessToken`: JWT access token
- `refreshToken`: JWT refresh token
- `user`: User object (JSON string)
- `adminToken`: Admin user object (JSON string) - chỉ dùng trong admin page

---

## ⚠️ Lưu ý Bảo mật

### 🚨 Issues cần fix ngay:

1. **Post APIs** không có authentication:
   - `POST /api/posts` - Bất kỳ ai cũng có thể tạo bài viết
   - `PUT /api/posts/:id` - Bất kỳ ai cũng có thể sửa bài viết
   - `DELETE /api/posts/:id` - Bất kỳ ai cũng có thể xóa bài viết

2. **Service APIs** không có authentication:
   - `POST /api/services` - Bất kỳ ai cũng có thể tạo dịch vụ
   - `PUT /api/services/:id` - Bất kỳ ai cũng có thể sửa dịch vụ
   - `DELETE /api/services/:id` - Bất kỳ ai cũng có thể xóa dịch vụ

### 💡 Đề xuất cải thiện:

```javascript
// Trong post.routes.js và service.routes.js
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

// Thêm middleware cho các routes
router.route('/')
  .post(authenticate, requireAdmin, createPost)  // Thêm auth
  .get(getAllPosts);

router.route('/:id')
  .get(getPostById)
  .put(authenticate, requireAdmin, updatePostById)  // Thêm auth
  .delete(authenticate, requireAdmin, deletePostById);  // Thêm auth
```

### 🔒 Best Practices cần implement:

1. **Environment Variables**:
   - Lưu `SECRET_KEY` trong `.env`
   - Không commit `.env` vào git

2. **CORS Configuration**:
   - Cấu hình CORS cho production
   - Chỉ cho phép origins đáng tin cậy

3. **Rate Limiting**:
   - Thêm rate limiting cho login endpoint
   - Ngăn chặn brute force attacks

4. **Input Validation**:
   - Validate input data trước khi save vào database
   - Sanitize user input để tránh XSS attacks

5. **Token Refresh**:
   - Implement refresh token endpoint
   - Auto refresh khi access token hết hạn

6. **Error Messages**:
   - Không expose sensitive information trong error messages
   - Use generic messages cho authentication failures

---

## 📈 Tổng kết

### Thống kê APIs
- **Tổng số endpoints**: 15 APIs
- **Protected endpoints**: 5 APIs (User management)
- **Public endpoints**: 10 APIs (cần review)
- **Unprotected but should be**: 6 APIs (Post & Service CUD operations)

### HTTP Methods sử dụng
- **GET**: 6 endpoints
- **POST**: 5 endpoints
- **PUT**: 3 endpoints
- **DELETE**: 3 endpoints

### Technologies
- **Backend**: Node.js + Express.js
- **Frontend**: React + Vite
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **HTTP Client**: Fetch API

### File Structure
```
project/
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.js          # Main router
│   │   │   ├── user.routes.js    # User endpoints
│   │   │   ├── post.routes.js    # Post endpoints
│   │   │   └── service.routes.js # Service endpoints
│   │   ├── controller/
│   │   │   ├── user.controller.js
│   │   │   ├── post.controller.js
│   │   │   └── service.controller.js
│   │   ├── model/
│   │   │   ├── user.model.js
│   │   │   ├── posts.model.js
│   │   │   └── service.model.js
│   │   └── middleware/
│   │       └── auth.middleware.js
│   └── index.js
└── FE/
    └── vite-project/
        └── src/
            ├── config/
            │   └── api.js              # API URL config
            ├── component/
            │   ├── loginModal.jsx      # Login component
            │   └── registerModal.jsx   # Register component
            └── pages/
                ├── admin-page/
                │   └── admin-page.jsx  # Admin dashboard (ALL APIs)
                ├── News-page/
                │   ├── news-page.jsx   # News list
                │   └── news-detail.jsx # News detail
                └── Service-page/
                    └── service-page.jsx # Services list
```

---

## 🎯 Kế hoạch cải thiện

### Priority 1 (Urgent - Security):
- [ ] Thêm authentication cho Post CUD operations
- [ ] Thêm authentication cho Service CUD operations
- [ ] Move SECRET_KEY to environment variables
- [ ] Implement proper error handling

### Priority 2 (Important - Features):
- [ ] Implement refresh token endpoint
- [ ] Add rate limiting for login
- [ ] Add input validation middleware
- [ ] Implement CORS properly

### Priority 3 (Nice to have - UX):
- [ ] Add search functionality
- [ ] Add filtering for posts/services
- [ ] Implement image upload
- [ ] Add user profile management

---

**Last Updated**: December 19, 2025  
**Version**: 1.0  
**Maintained by**: Development Team
