import Contact from '../model/contact.model.js';

export const createContact = async (req, res) => {
  try {
    const { full_name, email, phone, company, subject, message } = req.body;
    if (!full_name || !email || !message) {
      return res.status(400).json({ message: 'Thiếu trường bắt buộc' });
    }

    const contact = new Contact({ full_name, email, phone, company, subject, message });
    await contact.save();
    return res.status(201).json(contact);
  } catch (error) {
    console.error('createContact error:', error);
    return res.status(500).json({ message: 'Lỗi khi lưu liên hệ' });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.json(contacts);
  } catch (error) {
    console.error('getContacts error:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách liên hệ' });
  }
};
