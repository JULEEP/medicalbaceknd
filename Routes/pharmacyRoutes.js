import express from 'express';
import { createPharmacy, getAllPharmacies, createPharmacyCategory, getAllPharmacyCategories, createMedicine, getAllMedicines, getSingleMedicine } from '../Controller/pharmacyController.js';

const router = express.Router();

// POST: Create Pharmacy
router.post('/create-pharmacy', createPharmacy);

// GET: All Pharmacies
router.get('/getallpjarmacy', getAllPharmacies);
router.post('/create', createPharmacyCategory);
router.get('/', getAllPharmacyCategories);


router.post('/create-medicine', createMedicine);
router.get('/allmedicine', getAllMedicines);
router.get('/sinle-medicine/:medicineId', getSingleMedicine);

export default router;
