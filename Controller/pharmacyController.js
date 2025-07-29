import cloudinary from '../config/cloudinary.js';
import Pharmacy from '../Models/Pharmacy.js';
import PharmacyCategory from '../Models/PharmacyCategory.js';
import Medicine from '../Models/Medicine.js';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const createPharmacy = async (req, res) => {
  try {
    const {
      name,
      image,
      latitude,
      longitude,
      categories,
      products
    } = req.body;

    // ✅ Validate required fields
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required' });
    }

    let imageUrl = '';

    // 📷 Upload pharmacy image to Cloudinary or use direct URL
    if (req.files?.image) {
      const uploaded = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'pharmacies',
      });
      imageUrl = uploaded.secure_url;
    } else if (image?.startsWith('http')) {
      imageUrl = image;
    } else {
      return res.status(400).json({ message: 'Pharmacy image file or valid URL is required' });
    }

    // ✅ Parse categories
    let parsedCategories = [];
    if (typeof categories === 'string') {
      parsedCategories = JSON.parse(categories);
    } else if (Array.isArray(categories)) {
      parsedCategories = categories;
    }

    // 🛡️ Validate each category has name and image
    if (parsedCategories.length > 0 && !parsedCategories.every(cat => cat.name && cat.image)) {
      return res.status(400).json({ message: 'Each category must include both name and image' });
    }

    // ✅ Parse products
    let parsedProducts = [];
    if (typeof products === 'string') {
      parsedProducts = JSON.parse(products);
    } else if (Array.isArray(products)) {
      parsedProducts = products;
    }

    // 🏥 Create new pharmacy
    const newPharmacy = new Pharmacy({
      name,
      image: imageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      categories: parsedCategories,
      products: parsedProducts,
    });

    // 📍 location (GeoJSON) will be auto-handled in schema pre-save hook
    await newPharmacy.save();

    return res.status(201).json({
      message: 'Pharmacy created successfully',
      pharmacy: newPharmacy,
    });

  } catch (error) {
    console.error('Error creating pharmacy:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// 📦 Get All Pharmacies
export const getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.status(200).json({
      message: 'Pharmacies fetched successfully',
      total: pharmacies.length,
      pharmacies,
    });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// ➕ Create Pharmacy Category
export const createPharmacyCategory = async (req, res) => {
  try {
    const { pharmacyId, categoryName, image } = req.body;

    if (!pharmacyId || !categoryName) {
      return res.status(400).json({ message: 'pharmacyId and categoryName are required' });
    }

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    let imageUrl = '';

    if (req.files && req.files.image) {
      const uploaded = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'pharmacy-categories',
      });
      imageUrl = uploaded.secure_url;
    } else if (image && image.startsWith('http')) {
      imageUrl = image;
    } else {
      return res.status(400).json({ message: 'Image file or valid URL is required' });
    }

    const newCategory = new PharmacyCategory({
      pharmacyId,
      categoryName,
      image: imageUrl,
    });

    await newCategory.save();

    const populated = await PharmacyCategory.findById(newCategory._id).populate('pharmacyId', 'name location');

    res.status(201).json({
      message: 'Pharmacy category created successfully',
      category: populated,
    });
  } catch (error) {
    console.error('Error creating pharmacy category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📥 Get All Pharmacy Categories
export const getAllPharmacyCategories = async (req, res) => {
  try {
    const categories = await PharmacyCategory.find().populate('pharmacyId', 'name location');
    res.status(200).json({
      message: 'Pharmacy categories fetched successfully',
      total: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// ➕ Create Medicine
export const createMedicine = async (req, res) => {
  try {
    const { pharmacyId, name, price, description } = req.body;


    // Check pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    let images = [];

    // Case 1: Upload multiple files
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (let file of files) {
        const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'medicines',
        });
        images.push(uploaded.secure_url);
      }
    } 
    // Case 2: URLs passed directly in req.body.images[]
    else if (Array.isArray(req.body.images)) {
      images = req.body.images.filter(img => img.startsWith('http'));
    } 
    else {
      return res.status(400).json({ message: 'Images are required (upload or URL)' });
    }

    const newMedicine = new Medicine({
      pharmacyId,
      name,
      images,
      price,
      description
    });

    await newMedicine.save();

    const populated = await Medicine.findById(newMedicine._id)
      .populate('pharmacyId', 'name location');

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine: {
        name: populated.name,
        images: populated.images,
        price: populated.price,
        description: populated.description,
        pharmacy: populated.pharmacyId,
      }
    });

  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// 📥 Get All Medicines
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .populate('pharmacyId', 'name location');

    // Format each medicine as per createMedicine response
    const formatted = medicines.map(med => ({
      medicineId: med._id,
      name: med.name,
      images: med.images,
      price: med.price,
      description: med.description,
      pharmacy: med.pharmacyId, // contains name & location
    }));

    res.status(200).json({
      message: 'Medicines fetched successfully',
      total: formatted.length,
      medicines: formatted
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// 📥 Get Single Medicine by ID
export const getSingleMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const medicine = await Medicine.findById(medicineId)
      .populate('pharmacyId', 'name location');

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({
      message: 'Medicine fetched successfully',
      medicine: {
        medicineId: medicine._id,
        name: medicine.name,
        images: medicine.images,
        price: medicine.price,
        description: medicine.description,
        pharmacy: medicine.pharmacyId, // populated: { name, location }
      }
    });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

