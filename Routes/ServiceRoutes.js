import express from 'express';
import { createService, getAllServices } from '../Controller/ServiceController.js'; // Update path if needed

const router = express.Router();

// Route to create a service
router.post('/create-service', createService);
router.get('/allservice', getAllServices);

export default router;
