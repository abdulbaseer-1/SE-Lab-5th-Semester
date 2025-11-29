import cors from 'cors';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname =dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config/.env") });

const URL = process.env.FRONTEND_URL;

if (!URL) {
    throw new Error("FRONTEND_URL is not defined in the environment file");
}

export default cors({
    origin: `${URL}`, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}); 