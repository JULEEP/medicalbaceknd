import dotenv from 'dotenv';
import cloudinary from '../config/cloudinary.js';
import Service from '../Models/Service.js';



dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


export const createService = async (req, res) => {
  try {
    const { servicesName } = req.body;

    // Validate required fields
    if (!servicesName) {
      return res.status(400).json({ message: 'servicesName is required' });
    }

    // Check if image file is uploaded
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const imageFile = req.files.image;

    // Upload to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'services'
    });

    // Save service to database
    const newService = new Service({
      servicesName,
      image: uploadedImage.secure_url,
    });

    await newService.save();

    return res.status(201).json({
      message: 'Service created successfully',
      service: newService,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



// Get All Services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }); // Latest first
    return res.status(200).json({
      message: 'Services fetched successfully',
      total: services.length,
      services,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
