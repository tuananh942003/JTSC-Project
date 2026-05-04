import Post from '../model/posts.model.js';

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;    
    const newPost = new Post({ title, content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo bài viết', error });
  }
};  
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết', error });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết bài viết', error });
  }
};

export const updatePostById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(id, { title, content, imageUrl }, { new: true });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật bài viết', error });
  }
};

export const deletePostById = async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa bài viết', error });
  }
};
