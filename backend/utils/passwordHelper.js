const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Hash a password
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error("Password Hashing Error:", error);
        throw error;
    }
};

// Compare a plain text password with a hashed password
const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error("Password Comparison Error:", error);
        throw error;
    }
};

// Validate password strength
const isStrongPassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
        isValid: password.length >= minLength,
        minLength: password.length >= minLength,
        hasUpperCase: hasUpperCase,
        hasLowerCase: hasLowerCase,
        hasNumbers: hasNumbers,
        hasSpecialChar: hasSpecialChar,
        score: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    };
};

module.exports = {
    hashPassword,
    comparePassword,
    isStrongPassword
};