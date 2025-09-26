
import Pharmacy from "../Models/Pharmacy.js";
import Medicine from '../Models/Medicine.js';
import cloudinary from '../config/cloudinary.js';





import dotenv from 'dotenv';
import Order from "../Models/Order.js";
import Message from "../Models/Message.js";
import Prescription from "../Models/Prescription.js";
import Query from "../Models/Query.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const vendorLogin = async (req, res) => {
  try {
    const { vendorId, password } = req.body;

    // 🛡️ Validate inputs
    if (!vendorId || !password) {
      return res.status(400).json({ message: 'vendorId and password are required' });
    }

    // 🔍 Find vendor by vendorId
    const vendor = await Pharmacy.findOne({ vendorId });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // ✅ Check password
    if (vendor.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // ✅ Check status
    if (vendor.status !== 'Active') {
      return res.status(403).json({ message: `Vendor is not active. Current status: ${vendor.status}` });
    }

    // ✅ Successful login
    return res.status(200).json({
      message: 'Login successful',
      vendor: {
        id: vendor._id,
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        vendorEmail: vendor.vendorEmail,
        vendorPhone: vendor.vendorPhone,
        pharmacyName: vendor.name,
        pharmacyImage: vendor.image,
        location: vendor.location,
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        categories: vendor.categories,
        status: vendor.status,
      }
    });

  } catch (error) {
    console.error('Vendor Login Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 📋 Get vendor profile by ID (complete)
export const getVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    // Find vendor by ID with all fields
    const vendor = await Pharmacy.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Return the complete vendor object including categories, location, products, etc.
    return res.status(200).json({
      message: "Vendor profile fetched successfully",
      vendor, // sending whole vendor document
    });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const addPharmacyByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params; // This is pharmacy _id
    const {
      name,
      image,
      latitude,
      longitude,
      categories,
      products,
      vendorName,
      vendorEmail,
      vendorPhone
    } = req.body;

    // Find the pharmacy by its _id (which is vendorId here)
    const pharmacy = await Pharmacy.findById(vendorId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Update fields if provided
    if (name) pharmacy.name = name;
    if (latitude) pharmacy.latitude = parseFloat(latitude);
    if (longitude) pharmacy.longitude = parseFloat(longitude);
    if (vendorName) pharmacy.vendorName = vendorName;
    if (vendorEmail) pharmacy.vendorEmail = vendorEmail;
    if (vendorPhone) pharmacy.vendorPhone = vendorPhone;

    // Handle image upload
    if (req.files?.image) {
      const uploaded = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'pharmacies',
      });
      pharmacy.image = uploaded.secure_url;
    } else if (image?.startsWith('http')) {
      pharmacy.image = image;
    }

    // Parse categories
    if (categories) {
      let parsedCategories = [];
      if (typeof categories === 'string') {
        parsedCategories = JSON.parse(categories);
      } else if (Array.isArray(categories)) {
        parsedCategories = categories;
      }
      pharmacy.categories = parsedCategories;
    }

    // Parse products
    if (products) {
      let parsedProducts = [];
      if (typeof products === 'string') {
        parsedProducts = JSON.parse(products);
      } else if (Array.isArray(products)) {
        parsedProducts = products;
      }
      pharmacy.products = parsedProducts;
    }

    // Save the updated pharmacy document
    await pharmacy.save();

    return res.status(200).json({
      message: 'Pharmacy updated successfully',
      pharmacy,
    });
  } catch (error) {
    console.error('Error updating pharmacy:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getCategoriesByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const pharmacy = await Pharmacy.findById(vendorId);

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy/vendor not found" });
    }

    // Return just the categories array
    return res.status(200).json({
      categories: pharmacy.categories || [],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ➕ Create Medicine
export const createMedicine = async (req, res) => {
  try {
    const { name, price, description, categoryName } = req.body;
    const { vendorId } = req.params;  // get vendorId from params

    // ✅ Check pharmacy exists using vendorId as pharmacyId
    const pharmacy = await Pharmacy.findById(vendorId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy (vendor) not found' });
    }

    // 🔍 Validate category exists in pharmacy categories
    const categoryExists = pharmacy.categories.some(
      cat => cat.name.toLowerCase() === categoryName?.toLowerCase()
    );
    if (!categoryExists) {
      return res.status(400).json({ message: `Category "${categoryName}" not found in this pharmacy` });
    }

    let images = [];

    // 📷 Case 1: uploaded files present in req.files.images (can be array or single file)
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (let file of files) {
        const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'medicines',
        });
        images.push(uploaded.secure_url);
      }
    } 
    // 🌐 Case 2: images URLs passed in body.images (array)
    else if (Array.isArray(req.body.images)) {
      images = req.body.images.filter(img => typeof img === 'string' && img.startsWith('http'));
    } 
    else {
      return res.status(400).json({ message: 'Images are required (upload or URL)' });
    }

    // 🏥 Create medicine
    const newMedicine = new Medicine({
      pharmacyId: vendorId,  // assign vendorId as pharmacyId
      name,
      images,
      price,
      description,
      categoryName,
    });

    await newMedicine.save();

    // Populate pharmacy info
    const populated = await Medicine.findById(newMedicine._id)
      .populate('pharmacyId', 'name location');

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine: {
        name: populated.name,
        images: populated.images,
        price: populated.price,
        description: populated.description,
        categoryName: populated.categoryName,
        pharmacy: populated.pharmacyId,
      }
    });
  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// 📦 Get all medicines for a vendor
export const getAllMedicinesByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // ✅ Check if vendor (pharmacy) exists
    const pharmacy = await Pharmacy.findById(vendorId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Vendor (pharmacy) not found' });
    }

    // 🔍 Find medicines associated with this vendor
    const medicines = await Medicine.find({ pharmacyId: vendorId }).populate('pharmacyId', 'name location');

    res.status(200).json({
      message: 'Medicines fetched successfully',
      medicines,
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✏️ Update Medicine by Vendor
export const editMedicineByVendor = async (req, res) => {
  try {
    const { vendorId, medicineId } = req.params;
    const { name, price, description, categoryName, images } = req.body;

    // ✅ Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(vendorId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy (vendor) not found' });
    }

    // 🔍 Check if medicine exists and belongs to this vendor
    const medicine = await Medicine.findOne({ _id: medicineId, pharmacyId: vendorId });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found for this vendor' });
    }

    // 🔍 Check if category is valid for this vendor
    const categoryExists = pharmacy.categories.some(
      (cat) => cat.name.toLowerCase() === categoryName?.toLowerCase()
    );

    if (!categoryExists) {
      return res.status(400).json({ message: `Category "${categoryName}" not found in this pharmacy` });
    }

    // 🛠 Update fields
    medicine.name = name || medicine.name;
    medicine.price = price || medicine.price;
    medicine.description = description || medicine.description;
    medicine.categoryName = categoryName || medicine.categoryName;
    if (Array.isArray(images) && images.length > 0) {
      medicine.images = images;
    }

    await medicine.save();

    res.status(200).json({
      message: 'Medicine updated successfully',
      medicine,
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// ❌ Delete Medicine by Vendor
export const deleteMedicineByVendor = async (req, res) => {
  try {
    const { vendorId, medicineId } = req.params;

    // ✅ Check if medicine exists and belongs to this vendor
    const medicine = await Medicine.findOne({ _id: medicineId, pharmacyId: vendorId });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found for this vendor' });
    }

    await Medicine.deleteOne({ _id: medicineId });

    res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// 📦 Get all orders for a vendor
export const getAllOrdersByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Step 1: Find all medicines that belong to this vendor
    const vendorMedicines = await Medicine.find({ pharmacyId: vendorId }, '_id');
    const medicineIds = vendorMedicines.map(med => med._id);

    if (medicineIds.length === 0) {
      return res.status(200).json({
        message: 'No orders found for this vendor (no medicines listed).',
        orders: [],
      });
    }

    // Step 2: Find all orders that have these medicine IDs in orderItems
    const orders = await Order.find({
      'orderItems.medicineId': { $in: medicineIds },
    })
      .populate("assignedRider") // Populate assigned rider details
      .sort({ createdAt: -1 }); // newest first

    // Step 3: Send response
    return res.status(200).json({
      message: 'Orders fetched successfully',
      orders: orders.map(order => ({
        ...order.toObject(), // Convert the order to a plain object
        assignedRider: order.assignedRider ? {
          _id: order.assignedRider._id,
          name: order.assignedRider.name,
          email: order.assignedRider.email,
          phone: order.assignedRider.phone,
          address: order.assignedRider.address,
          city: order.assignedRider.city,
          state: order.assignedRider.state,
          pinCode: order.assignedRider.pinCode,
          profileImage: order.assignedRider.profileImage,
          rideImages: order.assignedRider.rideImages,
          deliveryCharge: order.assignedRider.deliveryCharge,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching orders for vendor:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// 📦 Update status of a specific order for a vendor
export const updateOrderStatusByVendor = async (req, res) => {
  try {
    const { vendorId, orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required in the request body.' });
    }

    // Step 1: Find all medicines that belong to this vendor
    const vendorMedicines = await Medicine.find({ pharmacyId: vendorId }, '_id');
    const medicineIds = vendorMedicines.map(med => med._id);

    if (medicineIds.length === 0) {
      return res.status(404).json({
        message: 'No medicines found for this vendor.',
      });
    }

    // Step 2: Find the order by orderId and ensure it contains medicines belonging to this vendor
    const order = await Order.findOne({
      _id: orderId,
      'orderItems.medicineId': { $in: medicineIds },
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found for this vendor or order does not contain vendor medicines.',
      });
    }

    // Step 3: Update the order status
    order.status = status;
    await order.save();

    return res.status(200).json({
      message: 'Order status updated successfully.',
      order,
    });
  } catch (error) {
    console.error('Error updating order status for vendor:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Utility functions
function subtractMonths(date, months) {
  const d = new Date(date);
  const desiredMonth = d.getMonth() - months;
  d.setMonth(desiredMonth);
  if (d.getMonth() !== ((desiredMonth + 12) % 12)) {
    d.setDate(0);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLabel(date, isToday) {
  const d = new Date(date);
  if (isToday) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } else {
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    return `${day}-${month}`;
  }
}

function generateDateLabels(startDate, endDate, isToday) {
  const labels = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    labels.push(formatDateLabel(current, isToday));
    current.setDate(current.getDate() + 1);
  }
  return labels;
}

export const getVendorDashboard = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { duration = "7days" } = req.query;

    const pharmacy = await Pharmacy.findById(vendorId).lean();
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const vendorMedicines = await Medicine.find({ pharmacyId: vendorId }, "_id");
    const medicineIds = vendorMedicines.map(m => m._id);

    const totalOrders = await Order.countDocuments({
      "orderItems.medicineId": { $in: medicineIds }
    });

    const medicinesCount = vendorMedicines.length;

    const revenueAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.medicineId": { $in: medicineIds },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysOrders = await Order.countDocuments({
      "orderItems.medicineId": { $in: medicineIds },
      createdAt: { $gte: startOfToday }
    });

    const ordersDelivered = await Order.countDocuments({
      "orderItems.medicineId": { $in: medicineIds },
      status: "Delivered",
      updatedAt: { $gte: startOfToday }
    });

    const pendingDeliveries = await Order.countDocuments({
      "orderItems.medicineId": { $in: medicineIds },
      status: { $in: ["Pending", "Shipped"] }
    });

    const now = new Date();
    let startDate;

    if (duration === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (duration === "7days") {
      startDate = subtractDays(now, 6);
    } else if (duration === "1month" || duration === "month") {
      startDate = subtractMonths(now, 1);
    } else if (duration === "3months") {
      startDate = subtractMonths(now, 3);
    } else if (duration === "6months") {
      startDate = subtractMonths(now, 6);
    } else if (duration === "12months") {
      startDate = subtractMonths(now, 12);
    } else {
      startDate = subtractDays(now, 6);
    }

    const isToday = duration === "today";
    const dateFormat = isToday ? "%H:%M" : "%d-%b";
    const dateLabels = generateDateLabels(startDate, now, isToday);

    const revenueDataRaw = await Order.aggregate([
      {
        $match: {
          "orderItems.medicineId": { $in: medicineIds },
          createdAt: { $gte: startDate, $lte: now },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt"
            }
          },
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: "$date",
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const revenueMap = {};
    revenueDataRaw.forEach(item => {
      revenueMap[item._id] = item.revenue;
    });

    const revenueTrend = dateLabels.map(label => ({
      date: label,
      revenue: revenueMap[label] || 0
    }));

    const orderDataRaw = await Order.aggregate([
      {
        $match: {
          "orderItems.medicineId": { $in: medicineIds },
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt"
            }
          }
        }
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 }
        }
      }
    ]);

    const orderMap = {};
    orderDataRaw.forEach(item => {
      orderMap[item._id] = item.count;
    });

    const orderTrend = dateLabels.map(label => ({
      date: label,
      count: orderMap[label] || 0
    }));

    // ✅ Final response
    return res.status(200).json({
      summary: {
        orders: totalOrders,
        medicinesCount,
        revenue: totalRevenue
      },
      today: {
        ordersPlaced: todaysOrders,
        ordersDelivered,
        ordersPending: pendingDeliveries
      },
      trends: {
        revenueTrend,
        orderTrend
      },
      // ✅ Include revenueByMonth & paymentStatus here
      revenueByMonth: pharmacy.revenueByMonth || {},
      paymentStatus: pharmacy.paymentStatus || {}
    });

  } catch (error) {
    console.error("Error in getVendorDashboard:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const vendorLogout = async (req, res) => {
  try {
    // Clear the auth cookie (assuming cookie name is 'token' or adjust accordingly)
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // send secure flag only in prod
      sameSite: 'strict',
    });

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Vendor Logout Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};




export const getMessagesForVendor = async (req, res) => {
  const { vendorId } = req.params; // Get vendorId from URL params

  if (!vendorId) {
    return res.status(400).json({ error: "vendorId is required" });
  }

  try {
    // Check if the vendor exists
    const vendor = await Pharmacy.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor (Pharmacy) not found" });
    }

    // Find all messages where the vendorId is part of the vendorIds array
    const messages = await Message.find({
      vendorIds: vendorId // We check if vendorId is part of the vendorIds array in the message
    })
    .sort({ sentAt: -1 }); // Sort messages by sentAt in descending order

    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found for this vendor" });
    }

    // Clean the message data to only include message and sentAt
    const cleanMessages = messages.map(msg => ({
      message: msg.message,
      sentAt: msg.sentAt
    }));

    // Return the cleaned message data
    return res.status(200).json({
      success: true,
      vendor: vendor.name,  // Return vendor name in the response
      messages: cleanMessages  // Send the cleaned messages
    });

  } catch (error) {
    console.error("Error in getMessagesForVendor:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};





// Controller to update the vendor status
export const updateVendorStatus = async (req, res) => {
  const { vendorId } = req.params;  // Get vendorId from the URL params
  const { status } = req.body;      // Get the new status from the request body

  if (!vendorId || !status) {
    return res.status(400).json({ error: "vendorId and status are required" });
  }

  try {
    // Check if the vendor exists
    const vendor = await Pharmacy.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor (Pharmacy) not found" });
    }

    // Update the vendor's status
    vendor.status = status;
    await vendor.save();  // Save the updated vendor status to the database

    return res.status(200).json({
      success: true,
      message: `Vendor status updated to ${status}`,
      vendor: {
        name: vendor.name,
        status: vendor.status
      }
    });

  } catch (error) {
    console.error("Error in updateVendorStatus:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};




// 📝 Update vendor profile (with file upload support)
export const updateVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const {
      name,
      email,
      phone,
      address,
      aadhar,
      panCard,
      license,
      status,
      image, // Add image to destructuring here
    } = req.body;

    // Check if vendor exists
    const vendor = await Pharmacy.findById(vendorId); // Assuming your vendor model is named 'Pharmacy'
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // 🌐 Image upload if new image is provided
    let imageUrl = vendor.image;
    if (req.files?.image) {
      const uploaded = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'vendor_images',
      });
      imageUrl = uploaded.secure_url;
    } else if (image?.startsWith('http')) { // Use image from the request body
      imageUrl = image;
    }

    // 📝 Upload Aadhar, PAN Card, License documents if they exist
    let aadharFileUrl = vendor.aadharFile;
    if (req.files?.aadharFile) {
      const uploaded = await cloudinary.uploader.upload(req.files.aadharFile.tempFilePath, {
        folder: 'vendor_aadhar_docs',
      });
      aadharFileUrl = uploaded.secure_url;
    }

    let panCardFileUrl = vendor.panCardFile;
    if (req.files?.panCardFile) {
      const uploaded = await cloudinary.uploader.upload(req.files.panCardFile.tempFilePath, {
        folder: 'vendor_pancard_docs',
      });
      panCardFileUrl = uploaded.secure_url;
    }

    let licenseFileUrl = vendor.licenseFile;
    if (req.files?.licenseFile) {
      const uploaded = await cloudinary.uploader.upload(req.files.licenseFile.tempFilePath, {
        folder: 'vendor_license_docs',
      });
      licenseFileUrl = uploaded.secure_url;
    }

    // 🔄 Update fields
    vendor.name = name || vendor.name;
    vendor.email = email || vendor.email;
    vendor.phone = phone || vendor.phone;
    vendor.address = address || vendor.address;
    vendor.aadhar = aadhar || vendor.aadhar;
    vendor.panCard = panCard || vendor.panCard;
    vendor.license = license || vendor.license;
    vendor.image = imageUrl;
    vendor.aadharFile = aadharFileUrl;
    vendor.panCardFile = panCardFileUrl;
    vendor.licenseFile = licenseFileUrl;

    // 🟢 Update status if provided
    if (status) {
      const validStatuses = ['Active', 'Inactive', 'Suspended']; // You can add more valid statuses if needed
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      vendor.status = status;
    }

    // Save updated vendor profile
    await vendor.save();

    // Return updated vendor details
    res.status(200).json({
      message: 'Vendor profile updated successfully',
      vendor,
    });

  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Function to add bank details to the vendor's profile
export const addBankDetails = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { accountNumber, ifscCode, branchName, bankName, accountHolderName } = req.body;

    // Validate input
    if (!accountNumber || !ifscCode || !branchName || !bankName || !accountHolderName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the vendor by ID
    const vendor = await Pharmacy.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Add bank details to the vendor's bankDetails array
    vendor.bankDetails.push({
      accountNumber,
      ifscCode,
      branchName,
      bankName,
      accountHolderName, // Add account holder name to the bank details
    });

    // Save the vendor after adding the new bank details
    await vendor.save();

    // Return updated vendor details
    res.status(200).json({
      message: "Bank details added successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error adding bank details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Function to edit bank details for the vendor
export const editBankDetails = async (req, res) => {
  try {
    const { vendorId, bankDetailId } = req.params; // Extract vendorId and bankDetailId from the URL params
    const { accountNumber, ifscCode, branchName, bankName, accountHolderName } = req.body;


    // Find the vendor by ID
    const vendor = await Pharmacy.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Find the bank detail by ID
    const bankDetail = vendor.bankDetails.id(bankDetailId); // Find the bank detail using bankDetailId
    if (!bankDetail) {
      return res.status(404).json({ message: "Bank detail not found" });
    }

    // Update bank details
    bankDetail.accountNumber = accountNumber || bankDetail.accountNumber;
    bankDetail.ifscCode = ifscCode || bankDetail.ifscCode;
    bankDetail.branchName = branchName || bankDetail.branchName;
    bankDetail.bankName = bankName || bankDetail.bankName;
    bankDetail.accountHolderName = accountHolderName || bankDetail.accountHolderName;

    // Save the vendor after updating the bank detail
    await vendor.save();

    // Return the updated vendor details
    res.status(200).json({
      message: "Bank details updated successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error updating bank details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getPrescriptionsForVendor = async (req, res) => {
  const { vendorId } = req.params; // Get vendorId from URL params

  if (!vendorId) {
    return res.status(400).json({ error: "vendorId is required" });
  }

  try {
    // Check if the vendor exists (Pharmacy in this case)
    const vendor = await Pharmacy.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor (Pharmacy) not found" });
    }

    // Find all prescriptions where pharmacyId matches the vendorId
    const prescriptions = await Prescription.find({
      pharmacyId: vendorId // We check if the pharmacyId matches the vendorId
    }).sort({ createdAt: -1 }); // Sort prescriptions by createdAt in descending order

    if (prescriptions.length === 0) {
      return res.status(404).json({ message: "No prescriptions found for this vendor" });
    }

    // Clean the prescription data to only include relevant fields
    const cleanPrescriptions = prescriptions.map(prescription => ({
      userId: prescription.userId, 
      prescriptionUrl: prescription.prescriptionUrl,
      createdAt: prescription.createdAt, // Or any other fields you want to include
    }));

    // Return the cleaned prescription data
    return res.status(200).json({
      success: true,
      vendor: vendor.name,  // Return vendor name in the response
      prescriptions: cleanPrescriptions  // Send the cleaned prescriptions
    });

  } catch (error) {
    console.error("Error in getPrescriptionsForVendor:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
