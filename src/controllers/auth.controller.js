const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET_KEY = process.env.JWT_Secret_Key;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
};

const getCookieOptions = (req) => {
    const host = req.get('host') || '';
    const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');
    const isSecureRequest = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const useSecureCookie = !isLocalHost && (process.env.NODE_ENV === 'production' || isSecureRequest);

    return {
        httpOnly: true,
        secure: useSecureCookie,
        sameSite: useSecureCookie ? 'none' : 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'Viewer'
        });

        const token = generateToken(user._id, user.role);

        res.cookie('token', token, getCookieOptions(req));

        return res.status(201).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "User is inactive" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(user._id, user.role);

        res.cookie('token', token, getCookieOptions(req));

        return res.status(200).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
const logoutUser = (req, res) => {
    res.clearCookie('token', getCookieOptions(req));
    return res.status(200).json({ success: true, message: "Logged out successfully" });
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error in getUsers:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: { id: user._id, role: user.role }
        });
    } catch (error) {
        console.error('Error in updateUserRole:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'User status updated successfully',
            data: { id: user._id, isActive: user.isActive }
        });
    } catch (error) {
        console.error('Error in updateUserStatus:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, logoutUser, getUsers, updateUserRole, updateUserStatus };