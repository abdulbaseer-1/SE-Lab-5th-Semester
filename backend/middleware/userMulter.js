import multer from 'multer';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);

// configuring the storage location for files and the naming system(what to name)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, resolve(__dirname, '../../database/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    }
});

//multer configuration
export const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // Max file size (15mb)
    fileFilter: (req, file, cb) => {
        console.log('File received by fileFilter:', file);  // this is not executing, why ?
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) { 
            return cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
        }
        cb(null, true);
    }
}).fields([
    { name: 'CNIC_Front_Image', maxCount: 1 },
    { name: 'userImage', maxCount: 1 }
]);