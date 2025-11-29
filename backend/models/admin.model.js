import mongoose from 'mongoose';

// Admin Schema
const adminSchema = new mongoose.Schema({
    CNIC: {
        type: String,
        required: [true, 'Please enter CNIC'],
        unique: true,
    }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;  // Default export of the Admin model
