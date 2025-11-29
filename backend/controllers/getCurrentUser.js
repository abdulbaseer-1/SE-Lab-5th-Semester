import User from "../models/User.model.js";
const getCurrentUser = async (req, res) => {
    try {
        console.log("inside the getCurrentUser function");

        const username = req.session.user.username; // Get the username from session user object
        if (!username) { // Check if the session doesn't have a username
            return res.status(400).json({ message: 'No user logged in' });
        }

        // console.log("username", JSON.stringify(username));
        // Find the user by the username
        const user = await User.findOne({username : username});

        console.log("user : ", user);
        
        // Check if the user is found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send user data if found
        res.status(200).json(user);

    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({ message: error.message });
    }
};

export default getCurrentUser;