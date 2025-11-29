// Session.js
import session from 'express-session';
import MongoStore from 'connect-mongo';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const sessionStore = MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // 1 day in seconds
    autoRemove: 'native' // Enable automatic removal of expired sessions
});

sessionStore.on('connected', () => {
    console.log('MongoDB session store connected');
});

sessionStore.on('error', (error) => {
    console.error('Session store error:', error);
});

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,           // Changed to false for better performance
    saveUninitialized: false, // Changed to false to comply with GDPR
    store: sessionStore,
    cookie: {
        httpOnly: true,     // Security best practice
        secure: true,       // Always true for HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'none',   // Required for cross-site cookies
        path: '/'           // Explicitly set cookie path
    },
    name: 'sid',            // Changed to be less obvious
    proxy: true            // Trust the reverse proxy when setting secure cookies
};

// Only modify config if explicitly in development
if (process.env.NODE_ENV === 'development') {
    sessionConfig.cookie.secure = true;  // Keep true since you're using HTTPS in development
}

const sessionMiddleware = session(sessionConfig);

export default sessionMiddleware;