import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req, res) => {
    try {
        const { email, currentPassword, newPassword, name } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Email update validation
        if (email) {
            // Check if new email is same as current
            if (email === user.email) {
                return res.status(400).json({ message: 'New email must be different from current email' });
            }

            // Check if email is already in use
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            user.email = email;
        }

        // Password update validation
        if (currentPassword && newPassword) {
            // Check if current password is correct
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Check if new password meets minimum length
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long' });
            }

            // Check if new password is same as current
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).json({ message: 'New password must be different from current password' });
            }

            user.password = newPassword; // Will be hashed by pre-save middleware
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        await user.save();

        // Send response without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        };

        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

export const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's profileImage in DB
        user.profileImage = imageUrl;
        await user.save();

        // Get the updated user data
        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        };

        // Send back the full user object so frontend can update localStorage
        res.json({
            message: 'Profile image updated successfully',
            imageUrl: imageUrl,
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: 'Error uploading profile image' });
    }
};