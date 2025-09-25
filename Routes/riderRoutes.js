// router/riderRoutes.js or similar
import express from "express";
import {  addBankDetailsToRider, createRiderQuery, forgotPassword, getAcceptedOrdersForRiderController, getAllActiveOrdersForRiderController, getAllCompletedOrdersForRiderController, getNewOrdersForRiderController, getPickedUpOrdersForRiderController, getRiderBankDetails, getRiderDrivingLicense, getRiderEarningsGraph, getRiderNotifications, getRiderOrdersByStatus, getRiderOrderStats, getRiderProfile, getRiderWalletController, getSingleOrderForRiderController, loginRider, markOrderAsDeliveredController, signupRider, updateRiderLocation, updateRiderProfileImage, updateRiderStatus, updateRiderStatusController, uploadDeliveryProof, withdrawAmountFromWalletController } from "../Controller/RiderController.js";

const router = express.Router();

router.post("/login", loginRider); // 👈 Login route
router.get('/myprofile/:riderId', getRiderProfile);
router.put('/updateprofileimage/:riderId', updateRiderProfileImage);
router.get('/dashboard/:riderId', getRiderOrderStats);
router.get('/neworders/:riderId', getNewOrdersForRiderController);
router.get('/acceptedorders/:riderId', getAcceptedOrdersForRiderController);
router.get("/pickeduporders/:riderId", getPickedUpOrdersForRiderController);
router.put('/update-status/:riderId', updateRiderStatusController);
router.get('/getsingleorder/:riderId/:orderId', getSingleOrderForRiderController);
router.get('/active-orders/:riderId', getAllActiveOrdersForRiderController);
router.get('/previous-orders/:riderId', getAllCompletedOrdersForRiderController);
router.get('/riderwallet/:riderId', getRiderWalletController);
router.post('/add-bank/:riderId', addBankDetailsToRider);
router.get('/bank-details/:riderId', getRiderBankDetails);
router.put("/deliver-order/:riderId/:orderId", markOrderAsDeliveredController);
router.post('/withdraw/:riderId', withdrawAmountFromWalletController);
router.post("/signup", signupRider);
router.post("/forgot-password", forgotPassword);
router.get("/notifications/:riderId", getRiderNotifications);
router.put("/togglerider/:riderId", updateRiderStatus);
router.get("/orders/:riderId", getRiderOrdersByStatus);
router.get("/earnings-graph/:riderId", getRiderEarningsGraph);
router.get("/driving-license/:riderId", getRiderDrivingLicense);
router.post('/update-location/:riderId', updateRiderLocation);
router.post("/uploadDeliveryProof/:riderId/:orderId", uploadDeliveryProof);
router.post('/createQuery', createRiderQuery);







export default router;
