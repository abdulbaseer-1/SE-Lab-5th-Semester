import User from "../models/User.model.js";
import Admin from "../models/admin.model.js";
import { compare } from 'bcrypt';

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check existing session
        if (req.session.authenticated) {
            return res.status(200).json({
                message: "User already logged in",
                user: {
                    username: req.username,
                    name: req.passwod,
                    role: req.role
                }
            });
        }

        // Find user
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Set session data
        req.session.authenticated = true;
        req.session.user = { username: user.username };

        // Force save the session
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                }
                resolve();
            });
        });

        // Log session details for debugging
        console.log('Session after save:', {
            id: req.session.id,
            cookie: req.session.cookie,
            user: req.session.user
        });

        // Send response with session info
        res.status(200).json({
            message: `Login successful ${req.role}`,
            user: {
                username: user.username,
                password: user.password,//name: user.name,
                role: req.role
            },
            sessionId: req.session.id // Include this for debugging
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export default loginUser;