import express from 'express';
import { createCategory, getAllCategories } from '../Controller/categoryController.js';

const router = express.Router();

router.post('/create-category', createCategory);
router.get('/allcategories', getAllCategories);

export default router;
