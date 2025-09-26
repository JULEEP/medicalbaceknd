// routes/order.routes.js

import express from 'express';
import { acceptWithdrawalRequest, createAd, createBanner, createRider, deleteAd, deleteBanner, deleteMessage, deleteNotification, deleteOrder, deletePeriodicOrder, deletePrescriptionForAdmin, deleteQuery, deleteRider, deleteRiderQuery, deleteUser, deleteWithdrawalRequest, getAllAds, getAllBanners, getAllMessages, getAllNotifications, getAllOrders, getAllPayments, getAllPreodicOrders, getAllPrescriptionsForAdmin, getAllQueries, getAllRiderQueries, getAllRiders, getAllUsers, getAllWithdrawalRequestsController, getDashboardData, getDeliveredOrders, getRefundOrders, getSingleOrder, getSingleUser, loginAdmin, logoutAdmin, registerAdmin, sendMessage, updateAd, updateBanner, updateOrderStatus, updatePeriodicOrder, updateQueryStatus, updateRider, updateRiderQuery, updateUser, updateUserStatus } from '../Controller/AdminControler.js';

const router = express.Router();

// PUT - Update order status and notify user
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.put('/ordersstatus/:userId/:orderId', updateOrderStatus);
router.get('/getallusers', getAllUsers);
router.get('/getsingleuser/:userId', getSingleUser);
router.put('/updateusers/:userId', updateUser);
router.delete('/deleteusers/:userId', deleteUser);
router.get('/getallorders', getAllOrders);
router.get('/getallpayments', getAllPayments);
router.get('/singleorder/:orderId', getSingleOrder);
router.delete('/deleteorder/:orderId', deleteOrder);
router.put("/updatestatus/:userId", updateUserStatus)
router.post("/create-rider", createRider);
router.put("/update-rider/:riderId", updateRider);
router.delete("/delete-rider/:riderId", deleteRider);
router.get("/allriders", getAllRiders);
router.post("/create-ads", createAd);
router.get("/allads", getAllAds);
router.put("/updateads/:id", updateAd);
router.delete("/deleteads/:id", deleteAd);
router.get("/allqueries", getAllQueries);
router.put("/updatequeries/:id", updateQueryStatus);
router.delete("/deletequeries/:id", deleteQuery);
router.get("/alluploadprescription", getAllPrescriptionsForAdmin);
router.delete("/deleteprescription/:id", deletePrescriptionForAdmin);
router.get("/allnotifications", getAllNotifications);
router.delete("/deletenotification/:id", deleteNotification);
router.get("/delivered-orders", getDeliveredOrders);
router.get("/refund-orders", getRefundOrders);
router.get("/dashboard", getDashboardData);
router.post("/createplan", createBanner);
router.get("/getallbanners", getAllBanners);
router.put("/updatebanner/:id", updateBanner);
router.delete("/deletebanner/:id", deleteBanner);
router.get("/withdrawal-requests", getAllWithdrawalRequestsController);
router.put("/approvewithdrawalrequests/:requestId", acceptWithdrawalRequest);
router.delete("/deletewithdrawal-requests/:requestId", deleteWithdrawalRequest);
router.post("/send-message", sendMessage);
router.get("/allmessages", getAllMessages);
router.delete("/deletemessages/:id", deleteMessage);
router.get('/riderqueries', getAllRiderQueries);
router.put('/updatequeries/:queryId', updateRiderQuery); // :queryId in URL params
router.delete('/deletequeries/:queryId', deleteRiderQuery); // :queryId in URL params
router.get('/allpreodicorders', getAllPreodicOrders);
router.put('/updatepreodicorders/:orderId', updatePeriodicOrder);
router.delete('/deletepreodicorders/:orderId', deletePeriodicOrder);







export default router;
