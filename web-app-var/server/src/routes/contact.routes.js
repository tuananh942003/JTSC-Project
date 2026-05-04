import express from 'express';
import { createContact, getContacts } from '../controller/contact.controller.js';

const router = express.Router();

// Public endpoint to submit contact
router.post('/', createContact);

// Admin endpoint to list contacts (could be protected later)
router.get('/', getContacts);

export default router;
