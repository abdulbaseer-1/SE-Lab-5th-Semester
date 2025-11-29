import { Router } from "express";
import { openWebsite, scanAccessibility } from "../controllers/browserController.js";

const router = Router();
router.get("/open-website", openWebsite);
router.get("/scan-accessibility", scanAccessibility);

export default router;



/*
1.curly braces:
    The curly braces { } in import statements are used for named imports.

➤ Example:
import { Router } from 'express';


This means:

“From the module express, import the specific named export called Router.”

So in this case, express exports multiple things, like application, request, response, Router, etc.
You are selectively importing only one of them — Router.

🚫 Without braces
import express from 'express';


This means:

“Import the default export from the express module.”

A module can have only one default export, but it can have many named exports.


*/