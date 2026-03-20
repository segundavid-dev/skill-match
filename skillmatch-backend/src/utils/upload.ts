import multer from 'multer';
import { cloudinary } from '../config/cloudinary';
import { AppError } from '../middleware/errorHandler';

// Store in memory, then stream to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new AppError('Only image files are allowed', 400));
    }
    cb(null, true);
  },
});

export interface CloudinaryResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<CloudinaryResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `skillmatch/${folder}`,
        public_id: publicId,
        transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
