import Service from '../model/service.model.js';

export const createService = async (req, res) => {
  try {
    const { icon, title, content, description } = req.body; 
    const newService = new Service({ icon, title, content, description });
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo dịch vụ', error });
  }
};
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find(); 
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách dịch vụ', error });
  }
};

export const updateServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { icon, title, content, description } = req.body;
    const updatedService = await Service.findByIdAndUpdate(id, { icon, title, content, description }, { new: true });
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật dịch vụ', error });
  }
};

export const deleteServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa dịch vụ', error });
  }
};
