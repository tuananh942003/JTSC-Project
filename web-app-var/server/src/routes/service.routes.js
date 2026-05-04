import express from 'express';
import { createService,getAllServices,updateServiceById,deleteServiceById } from '../controller/service.controller.js';
const serviceRouter = express.Router();
serviceRouter.route('/').post(createService).get(getAllServices);
serviceRouter.route('/:id').put(updateServiceById).delete(deleteServiceById);
export default serviceRouter;