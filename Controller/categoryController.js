import cloudinary from '../config/cloudinary.js';
import Category from '../Models/Category.js';
import Service from '../Models/Service.js';
import dotenv from 'dotenv'


dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Create Category (categoryName + image + serviceId + return serviceName)
export const createCategory = async (req, res) => {
  try {
    const { categoryName, image, serviceId } = req.body;

    if (!categoryName || !serviceId) {
      return res.status(400).json({ message: 'categoryName and serviceId are required' });
    }

    // Check if service exists
    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return res.status(404).json({ message: 'Service not found' });
    }

    let imageUrl = '';

    if (req.files && req.files.image) {
      const uploaded = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'categories',
      });
      imageUrl = uploaded.secure_url;
    } else if (image && image.startsWith('http')) {
      imageUrl = image;
    } else {
      return res.status(400).json({ message: 'Image file or valid URL is required' });
    }

    // Create the category
    const newCategory = new Category({
      categoryName,
      image: imageUrl,
      serviceId,
    });

    await newCategory.save();

    // Populate serviceName from serviceId
    const populatedCategory = await Category.findById(newCategory._id).populate('serviceId', 'servicesName');

    return res.status(201).json({
      message: 'Category created successfully',
      category: populatedCategory,
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Get All Categories (with service data populated)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('serviceId', 'servicesName image');
    return res.status(200).json({
      message: 'Categories fetched successfully',
      total: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
