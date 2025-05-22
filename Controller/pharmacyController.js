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

// ➕ Create Pharmacy
export const createPharmacy = async (req, res) => {
  try {
    const { name, location, image } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required' });
    }

    let imageUrl = '';

    if (req.files && req.files.image) {
      const uploaded = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'pharmacies',
      });
      imageUrl = uploaded.secure_url;
    } else if (image && image.startsWith('http')) {
      imageUrl = image;
    } else {
      return res.status(400).json({ message: 'Image file or valid URL is required' });
    }

    const newPharmacy = new Pharmacy({
      name,
      image: imageUrl,
      location,
    });

    await newPharmacy.save();

    res.status(201).json({
      message: 'Pharmacy created successfully',
      pharmacy: newPharmacy,
    });

  } catch (error) {
    console.error('Error creating pharmacy:', error);
    res.status(500).json({ message: 'Server error' });
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
    const { pharmacyId, pharmacyCategoryId, name, price, image } = req.body;

    if (!pharmacyId || !pharmacyCategoryId || !name || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify pharmacy and category exist
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    const category = await PharmacyCategory.findById(pharmacyCategoryId);
    if (!category) return res.status(404).json({ message: 'Pharmacy Category not found' });

    let imageUrl = '';

    if (req.files && req.files.image) {
      const uploaded = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'medicines',
      });
      imageUrl = uploaded.secure_url;
    } else if (image && image.startsWith('http')) {
      imageUrl = image;
    } else {
      return res.status(400).json({ message: 'Image file or valid URL is required' });
    }

    const newMedicine = new Medicine({
      pharmacyId,
      pharmacyCategoryId,
      name,
      image: imageUrl,
      price
    });

    await newMedicine.save();

    const populated = await Medicine.findById(newMedicine._id)
      .populate('pharmacyId', 'name location')
      .populate('pharmacyCategoryId', 'categoryName');

    res.status(201).json({
      message: 'Medicine created successfully',
      medicine: populated
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
      .populate('pharmacyId', 'name location')
      .populate('pharmacyCategoryId', 'categoryName');

    res.status(200).json({
      message: 'Medicines fetched successfully',
      total: medicines.length,
      medicines
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
      .populate('pharmacyId', 'name location')
      .populate('pharmacyCategoryId', 'categoryName');

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({
      message: 'Medicine fetched successfully',
      medicine
    });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
