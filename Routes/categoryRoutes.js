import express from 'express';
import { createCategory, deleteCategory, getAllCategories, updateCategory } from '../Controller/categoryController.js';

const router = express.Router();

router.post('/create-category', createCategory);
router.get('/allcategories', getAllCategories);
router.put("/updatecategory/:categoryId", updateCategory);
router.delete("/deletecategory/:categoryId", deleteCategory);


export default router;
