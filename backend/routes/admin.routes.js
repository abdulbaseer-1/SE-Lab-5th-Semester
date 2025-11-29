import express from 'express';
import adminController from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/createAdmin', (req, res) => {
    console.log("inside admin funct");

    adminController.createAdmin(req, res);
});

export default adminRouter;