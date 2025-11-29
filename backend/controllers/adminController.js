import Admin from '../models/admin.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const createAdmin = async (req, res) => {
    try {
        console.log("inside admin funct try");

        if (!req.session?.user) {
            return res.status(401).json({
                success: false,
                message: 'No authenticated user found'
            });
        }

        const { CNIC, confirmPassword } = req.body;

        console.log("inside admin funct CNIC : ", CNIC);
        
        if (!CNIC || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'CNIC and password are required'
            });
        }

        console.log("inside admin funct CNIC : ", CNIC);

        const existingAdmin = await Admin.findOne({ CNIC });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin with this CNIC already exists'
            });
        }

        const username = req.session.user.username;
        const user = await User.findOne({ username });
        
        console.log("inside admin funct CNIC : ", CNIC);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(confirmPassword, user.password);
        console.log("inside admin funct CNIC after bcrypt 1 : ", CNIC);
        console.log("Password comparison:", {
            providedPassword: confirmPassword,
            hashedPassword: user.password,
            isValid: isPasswordValid
        });

        const admin = await Admin.create({ CNIC: CNIC });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully'
        });

    } catch (error) {
        console.error('Admin creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin',
            error: error.message
        });
    }
};

export default { createAdmin };