import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please enter your username'],
      unique: true,
    },
    email: {
      type: String, // Corrected from `email` to `String`
      required: [true, 'Please enter your email'],
      unique: true,
    },
    password: {
      type: String, // Corrected from `password` to `String`
      required: [true, 'Please enter a password'],
    },
    name: {
      type: String,
      required: [true, 'Please enter your name'],
    },
    fathers_name: {
      type: String,
      required: [true, 'Please enter your father\'s name'],
    },
    CNIC: {
      type: String,
      required: [true, 'Please enter your CNIC'],
    },
    phone: {
      type: String, // Corrected from `phone` to `String`
      required: [true, 'Please enter your phone number'],
      unique: true,
    },
    address: {
      type: String,
      required: [true, 'Please enter your address'],
    },
    CNIC_Front_Image: {
      type: String, // Assuming a file path or URL will be stored
      required: [false, 'Please provide the CNIC front image'],
    },
    userImage: {
      type: String, // Assuming a file path or URL will be stored
      required: [false, 'Please provide your image'],
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
  }
);

const User = mongoose.model('User', userSchema); // Create user model from schema // automatically pluralized by mongo for collection

export default User;




/*
Schema Definition:

name, email, password, and role are the fields in the schema.
Each field has a type (e.g., String, Date) and validation rules (e.g., required, unique, minlength, enum).
Validation:

Validation ensures data integrity, e.g., the email field must be unique and match a regular expression.
Default Values:

role has a default value of 'user'.
createdAt is automatically set to the current date.
Timestamps:

The timestamps: true option automatically adds createdAt and updatedAt fields to the schema.
Model:

The mongoose.model method creates a model named User based on the schema. This model maps to a MongoDB collection (e.g., users).
*/