import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-here';

export const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc không tồn tại' });
    }

    // Tách token từ "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Xác thực token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Gắn thông tin user vào request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    return res.status(500).json({ message: 'Lỗi xác thực', error: error.message });
  }
};

// Middleware kiểm tra role admin
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
  }
};

export default { authenticate, requireAdmin };
