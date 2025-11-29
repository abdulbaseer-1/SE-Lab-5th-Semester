import Admin from '../models/admin.model.js';
import User from '../models/User.model.js'; // Assuming User model already exists

const checkAdmin = async (req, res, next) => {
    try {
        const {username} = req.body;
        const user = await User.findOne({username});

        if(!user) {
            req.role = 'guest';
            return next(); // No user found; role remains 'guest' // exit out of this middleware
        }

        const admin = await Admin.findOne({ CNIC : user.CNIC }); // Check if the CNIC exists in the admin collection

        if (admin) {
            req.role = 'admin';  // Mark role as admin
        } else {
            req.role = 'user';   // If not found, mark as normal user
        }

        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export default checkAdmin;
 
/*
Notes:Middleware functions like checkAdmin are typically designed to intercept a request before reaching the controller function.
*/
