const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET_KEY = process.env.JWT_Secret_Key;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
};

const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

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
            role: role || 'Viewer'
        });

        const token = generateToken(user._id, user.role);

        res.cookie('token', token, cookieOptions);

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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(user._id, user.role);

        res.cookie('token', token, cookieOptions);

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
    res.clearCookie('token', cookieOptions);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
}

module.exports = { registerUser, loginUser,logoutUser };