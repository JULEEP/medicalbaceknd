import express from 'express';
import { createPharmacy, getAllPharmacies, createPharmacyCategory, getAllPharmacyCategories, createMedicine, getAllMedicines, getSingleMedicine, getPharmacies, getMedicinesByPharmacyAndCategory, updatePharmacy, deletePharmacy, updateMedicine, deleteMedicine, getPrescriptionsForPharmacy, updatePaymentStatus, getPharmacyById, getAllPaymentHistory, searchMedicines } from '../Controller/pharmacyController.js';

const router = express.Router();

// POST: Create Pharmacy
router.post('/create-pharmacy', createPharmacy);

// GET: All Pharmacies
router.get('/getallpjarmacy', getAllPharmacies);
router.get('/singlepharmacy/:pharmacyId', getPharmacies); // single
router.post('/create', createPharmacyCategory);
router.get('/', getAllPharmacyCategories);


router.post('/create-medicine', createMedicine);
router.get('/allmedicine', getAllMedicines);
router.get('/searchmedicine', searchMedicines);
router.put("/updatemedicine/:medicineId", updateMedicine);
router.delete("/deletemedicine/:medicineId", deleteMedicine);
router.get('/sinle-medicine/:medicineId', getSingleMedicine);
router.get('/getmedicines/:pharmacyId', getMedicinesByPharmacyAndCategory);
router.put('/updatepharmacy/:pharmacyId', updatePharmacy);
router.delete('/deletepharmacy/:pharmacyId', deletePharmacy);
router.get("/pharmacyprescriptions/:pharmacyId", getPrescriptionsForPharmacy);

router.put('/updatepayment/:pharmacyId', updatePaymentStatus);
router.get("/paymenthistory", getAllPaymentHistory);




export default router;
