// middlewares/multer.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const logStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'activity-media',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo ? ['mp4', 'mov'] : ['jpg', 'jpeg', 'png'],
    };
  },
});

// Multer uploaders
export const uploadProfilePic = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 2MB
});

export const uploadActivityMedia = multer({
  storage: logStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 4,
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only images or videos allowed.'));
    }
  }
});
