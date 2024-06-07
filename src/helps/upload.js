const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for different file types
const coverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "covers",
    format: async (req, file) => "jpg", // Format can be changed as needed
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(), // Unique file name
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profiles",
    format: async (req, file) => "jpg",
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "videos",
    format: async (req, file) => "mp4",
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
  },
});

const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "banners",
    format: async (req, file) => "jpg",
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
  },
});

// Multer middleware
const uploadCover = multer({ storage: coverStorage });
const uploadProfile = multer({ storage: profileStorage });
const uploadVideo = multer({ storage: videoStorage });
const uploadBanner = multer({ storage: bannerStorage });

module.exports = { uploadCover, uploadProfile, uploadVideo, uploadBanner };
