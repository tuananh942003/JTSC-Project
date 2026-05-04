import User from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const createUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    // Hash password trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi khi tạo người dùng', error: error.message });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, password, role } = req.body;
    const updateData = { name, username, email, role };
    if (password) {
      // Hash password mới trước khi update
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật người dùng', error });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;  
    await User.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa người dùng', error });
  }
};


const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-here';

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    // Kiểm tra user tồn tại và verify password
    if (user && await bcrypt.compare(password, user.password)) {
      // Tạo JWT token
      const payload = { 
        userId: user._id,
        username: user.username,
        role: user.role
      };
      const acesstoken = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256', expiresIn: '24h' });
      const refreshtoken = jwt.sign(payload, SECRET_KEY,  { expiresIn: '7d' });

      res.status(200).json({ 
        message: 'Login successful', 
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role
        },
        acesstoken,
        refreshtoken
      });  
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng nhập', error });
  }
};



