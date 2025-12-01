import multer from 'multer';
import fs from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);

// FIXED PATH ( ../ not ../../ )
const uploadDir = resolve(__dirname, '../database/uploads');

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created upload directory:", uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        console.log('File received by fileFilter:', file);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!allowedTypes.includes(file.mimetype)) { 
            return cb(new Error('Invalid file type'));
        }

        cb(null, true);
    }
}).fields([
    { name: 'CNIC_Front_Image', maxCount: 1 },
    { name: 'ReporterImage', maxCount: 1 },
    { name: 'ProofImage', maxCount: 1 }
]);
