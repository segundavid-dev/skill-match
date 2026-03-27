import multer from 'multer';

// Memory storage for file uploads (no disk writes)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Stub: returns a placeholder URL until Cloudinary is configured
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  _publicId?: string
): Promise<{ url: string; publicId: string }> {
  console.warn('[upload] Cloudinary not configured — returning placeholder');
  const id = `${folder}/${Date.now()}`;
  return {
    url: `https://via.placeholder.com/200?text=${encodeURIComponent(folder)}`,
    publicId: id,
  };
}

export async function deleteFromCloudinary(_publicId: string): Promise<void> {
  console.warn('[upload] Cloudinary not configured — skipping delete');
}
