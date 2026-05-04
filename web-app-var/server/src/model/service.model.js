import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
    icon: { type: String, required: false },
    title: { type: String, required: true },
    content: { type: String, required: true },
    description: [String],
}); 
const Service = mongoose.model("Service", serviceSchema);
export default Service;