import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../model/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const hashExistingPasswords = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Đã kết nối MongoDB');

    // Lấy tất cả users
    const users = await User.find();
    console.log(`📋 Tìm thấy ${users.length} users`);

    for (const user of users) {
      // Kiểm tra nếu password chưa được hash (password hash luôn bắt đầu với $2b$)
      if (!user.password.startsWith('$2b$')) {
        console.log(`🔄 Đang hash password cho user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Cập nhật trực tiếp trong database, bỏ qua validation
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        console.log(`✅ Đã hash password cho user: ${user.username}`);
      } else {
        console.log(`⏭️  Password của user ${user.username} đã được hash, bỏ qua`);
      }
    }

    console.log('🎉 Hoàn thành hash tất cả passwords!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

hashExistingPasswords();
