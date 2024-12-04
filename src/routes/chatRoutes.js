import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// Create a new chat
router.post('/', async (req, res) => {
    const { customerId, sellerId } = req.body;
    const newChat = new Chat({ customerId, sellerId });
    try {
        const savedChat = await newChat.save();
        res.status(200).json(savedChat);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get chat by user IDs
router.get('/:userId1/:userId2', async (req, res) => {
    try {
        const chat = await Chat.findOne({
            $or: [
                { customerId: req.params.userId1, sellerId: req.params.userId2 },
                { customerId: req.params.userId2, sellerId: req.params.userId1 }
            ]
        });
        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add a message to a chat
router.put('/:chatId', async (req, res) => {
    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            req.params.chatId,
            { $push: { messages: req.body } },
            { new: true }
        );
        res.status(200).json(updatedChat);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router; 