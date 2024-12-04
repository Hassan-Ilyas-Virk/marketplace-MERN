import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Chat from '../models/Chat.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Invalid file type!');
        }
    }
});

// Get all chats for a user
router.get('/', protect, async (req, res) => {
    try {
        console.log('Fetching chats for user:', req.user._id);
        const chats = await Chat.find({
            $or: [
                { customerId: req.user._id },
                { sellerId: req.user._id }
            ]
        })
        .populate('customerId', 'name profileImage')
        .populate('sellerId', 'name profileImage')
        .populate('messages')
        .sort('-updatedAt');

        console.log('Found chats:', chats.length);
        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Error fetching chats' });
    }
});

// Create a new chat
router.post('/', protect, async (req, res) => {
    try {
        // Check if chat already exists
        const existingChat = await Chat.findOne({
            $or: [
                { customerId: req.body.customerId, sellerId: req.body.sellerId },
                { customerId: req.body.sellerId, sellerId: req.body.customerId }
            ]
        });

        if (existingChat) {
            const populatedChat = await Chat.findById(existingChat._id)
                .populate('customerId', 'name profileImage')
                .populate('sellerId', 'name profileImage');
            return res.status(200).json(populatedChat);
        }

        const newChat = new Chat({
            customerId: req.body.customerId,
            sellerId: req.body.sellerId,
            messages: []
        });

        const savedChat = await newChat.save();
        const populatedChat = await Chat.findById(savedChat._id)
            .populate('customerId', 'name profileImage')
            .populate('sellerId', 'name profileImage');

        res.status(201).json(populatedChat);
    } catch (err) {
        res.status(500).json({ message: 'Error creating chat' });
    }
});

// Add message to chat
router.post('/:chatId/messages', protect, upload.single('file'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('File:', req.file);

        const chat = await Chat.findById(req.params.chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Create new message
        const newMessage = {
            senderId: req.user._id,
            message: req.body.message || '',
            timestamp: new Date()
        };

        // Add file path if file was uploaded
        if (req.file) {
            newMessage.file = `/uploads/${req.file.filename}`;
        }

        // Add message to chat
        chat.messages.push(newMessage);
        await chat.save();

        // Fetch updated chat with populated fields
        const updatedChat = await Chat.findById(chat._id)
            .populate('customerId', 'name profileImage')
            .populate('sellerId', 'name profileImage');

        res.status(200).json(updatedChat);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            message: 'Error sending message', 
            error: error.message 
        });
    }
});

export default router; 