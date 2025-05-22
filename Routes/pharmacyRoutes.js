import express from 'express';
import { createPharmacy, getAllPharmacies, createPharmacyCategory, getAllPharmacyCategories } from '../controllers/pharmacyController.js';

const router = express.Router();

// POST: Create Pharmacy
router.post('/create-pharmacy', createPharmacy);

// GET: All Pharmacies
router.get('/getallpjarmacy', getAllPharmacies);
router.post('/create', createPharmacyCategory);
router.get('/', getAllPharmacyCategories);

export default router;
