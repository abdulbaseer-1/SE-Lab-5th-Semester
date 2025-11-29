import express from 'express';
import userController from '../controllers/userController.js';
import { upload } from '../middleware/userMulter.js';
import login_logic from '../controllers/login_logic.js';
import checkAdmin from '../middleware/userVsAdmin.js'; // Import the checkAdmin middleware
import logout_logic from '../controllers/logout_logic.js';
import getCurrentUser from '../controllers/getCurrentUser.js';
import changePassword from '../controllers/Password_Change.js';

const router = express.Router();

// Get current user API
router.get('/currentUser', async (req, res) => {
  console.log("inside the get current route");
  console.log('Cookies received:', req.headers.cookie);

  try {
    await getCurrentUser(req, res);
  } catch (error) {
    console.error("Error in getCurrentUser route:", error);
  }
});

router.put('/change-password', async (req, res) => {
    console.log("inside change password function");
    try {
        changePassword(req, res);
    } catch (error) {
        res.status(500).json({msg:"error password not changed", error:error});
    }
});
// //check if logged in
// router.get('/checkSession', (req, res) => {
//     const authenticated = req.session.authenticated;
//     return res.status(200).json({ authenticated });
// });

// Add Login Route (POST)
router.post('/login', checkAdmin, async (req, res) => {
  await login_logic(req, res);

  console.log("req.session.user in route: ", req.session.user);
  console.log('Cookies received:', req.headers.cookie);
  console.log("req.session.authenticated: ", req.session.authenticated);
});

// Logout API
router.post('/logout', (req, res) => {
  console.log("req.session in logout route: ", req.session);
  console.log('Cookies received:', req.headers.cookie);

  console.log("req.session.user in logout route: ", req.session.user);

  logout_logic(req, res);

  console.log("req.session in logout route after logout: ", req.session);
});

// Change password API
router.post('/change-password', (req, res) => {
  // Ensure the user is authenticated by checking the session
  if (!req.session.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  
  // Call the changePassword controller
  changePassword(req, res);
});

// Get all users API
router.get('/', userController.getUsers);

// Get one user API
router.get('/:id', userController.getUser);

// Create user API
router.post('/', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).send(err.message);
    }
    next();
  });
}, userController.createUser);

// Update a user
router.put('/:id', userController.updateUser);

// Delete a user
router.post('/deleteCurrent', (req, res) => {
  console.log("inside the get current route");
  console.log('Cookies received:', req.headers.cookie);
  try {
    userController.deleteUser(req, res);

  } catch (error) {
    console.error("Eroor user not deleted", error);
  }
});

export default router;
