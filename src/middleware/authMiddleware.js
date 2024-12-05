import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            console.log('User not found with token');
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized', error: error.message });
    }
}; 

export const isSeller = (req, res, next) => {
    if (req.user && req.user.role === 'Seller') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Only sellers can perform this action' });
    }
};  

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
}; 

