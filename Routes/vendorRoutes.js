import express from 'express';
import { addBankDetails, addPharmacyByVendorId, createMedicine, deleteMedicineByVendor, editBankDetails, editMedicineByVendor, getAllMedicinesByVendor, getAllOrdersByVendor, getCategoriesByVendorId, getMessagesForVendor, getPrescriptionsForVendor, getVendorDashboard, getVendorProfile, updateOrderStatusByVendor, updateVendorProfile, updateVendorStatus, vendorLogin, vendorLogout } from '../Controller/VendorController.js'

const router = express.Router();

// Vendor login route
router.post('/login', vendorLogin);
router.post('/addpharmacy/:vendorId', addPharmacyByVendorId);
router.get('/categories/:vendorId', getCategoriesByVendorId);
router.post('/addmedicine/:vendorId', createMedicine);
router.get('/medicines/:vendorId', getAllMedicinesByVendor);
router.put('/updatemedicines/:vendorId/:medicineId', editMedicineByVendor);
router.delete('/deletemedicines/:vendorId/:medicineId', deleteMedicineByVendor);
router.get('/orders/:vendorId', getAllOrdersByVendor);
router.get('/dashboard/:vendorId', getVendorDashboard);
router.put("/orderstatus/:vendorId/:orderId", updateOrderStatusByVendor);
router.get('/getvendorprofile/:vendorId', getVendorProfile);
router.put('/updatevendorprofile/:vendorId', updateVendorProfile);
router.post('/logout', vendorLogout);
router.get('/getmessages/:vendorId', getMessagesForVendor);
router.put('/updatestatus/:vendorId', updateVendorStatus);
router.post('/addbankdetails/:vendorId', addBankDetails);
router.put('/editbankdetails/:vendorId/:bankDetailId', editBankDetails);
router.get("/getprescriptions/:vendorId", getPrescriptionsForVendor);

export default router;
