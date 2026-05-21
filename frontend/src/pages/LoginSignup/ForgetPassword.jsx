import React, { useState, useEffect } from 'react';
import './ForgetPassword.css';

const ForgetPassword = ({ onBackToLogin }) => {
    const [step, setStep] = useState('email'); // email, otp, reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        score: 0,
        isValid: false
    });

    // Timer countdown effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Check password strength
    const checkPasswordStrength = (password) => {
        const strength = {
            minLength: password.length >= 6,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
        };
        
        strength.score = [strength.hasUpperCase, strength.hasLowerCase, strength.hasNumbers].filter(Boolean).length;
        strength.isValid = strength.minLength && strength.score >= 2;
        
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        checkPasswordStrength(value);
        if (errors.newPassword) {
            setErrors({ ...errors, newPassword: '' });
        }
    };

    const validateEmail = () => {
        if (!email) {
            setErrors({ email: "Email is required" });
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Email is invalid" });
            return false;
        }
        return true;
    };

    const validatePassword = () => {
        if (!newPassword) {
            setErrors({ newPassword: "New password is required" });
            return false;
        }
        if (!passwordStrength.isValid) {
            setErrors({ newPassword: "Password does not meet requirements" });
            return false;
        }
        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return false;
        }
        return true;
    };

    // Request password reset OTP
    const requestResetOTP = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setStep('otp');
                setTimer(60);
                alert("OTP sent to your email! Please check your inbox.");
            } else {
                alert(data.errors || "Failed to send OTP. Please try again.");
            }
        } catch (error) {
            console.error("Reset Request Error:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const resendOTP = async () => {
        if (timer > 0) {
            alert(`Please wait ${timer} seconds before requesting again.`);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/resend-password-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setTimer(60);
                alert("New OTP sent to your email!");
            } else {
                alert(data.errors || "Failed to resend OTP. Please try again.");
            }
        } catch (error) {
            console.error("Resend OTP Error:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const verifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            alert("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    otp: otp,
                    newPassword: newPassword,
                    purpose: "password_reset"
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Password reset successful! Please login with your new password.");
                if (onBackToLogin) onBackToLogin();
            } else {
                alert(data.errors || "Verification failed. Please try again.");
            }
        } catch (error) {
            console.error("Password Reset Error:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = () => {
        if (!validatePassword()) return;
        verifyOTP();
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength.score === 0) return { text: 'Very Weak', class: 'weak' };
        if (passwordStrength.score === 1) return { text: 'Weak', class: 'weak' };
        if (passwordStrength.score === 2) return { text: 'Medium', class: 'medium' };
        if (passwordStrength.score === 3) return { text: 'Strong', class: 'strong' };
        return { text: '', class: '' };
    };

    const strengthInfo = getPasswordStrengthText();

    return (
        <div className="forget-password">
            <div className="forget-password-container">
                <button className="back-to-login" onClick={onBackToLogin}>
                    ← Back to Login
                </button>

                {step === 'email' && (
                    <>
                        <h1>Forgot Password?</h1>
                        <p className="instruction-text">
                            Enter your email address and we'll send you a verification code to reset your password.
                        </p>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={errors.email ? 'error' : ''}
                                disabled={loading}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        <button onClick={requestResetOTP} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                        </button>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        <h1>Verify OTP</h1>
                        <p className="instruction-text">
                            We've sent a 6-digit verification code to <strong>{email}</strong>
                        </p>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength="6"
                                className="otp-input"
                                autoFocus
                            />
                        </div>
                        <button onClick={() => setStep('reset')} disabled={!otp || otp.length !== 6}>
                            Verify OTP
                        </button>
                        <div className="resend-container">
                            {timer > 0 ? (
                                <p className="timer-text">
                                    Resend code in <span className="timer">{timer}</span> seconds
                                </p>
                            ) : (
                                <button className="resend-btn" onClick={resendOTP} disabled={loading}>
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </>
                )}

                {step === 'reset' && (
                    <>
                        <h1>Reset Password</h1>
                        <p className="instruction-text">
                            Create a new strong password for your account.
                        </p>
                        
                        <div className="input-wrapper">
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                    className={errors.newPassword ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                        </div>

                        {newPassword && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    <div className={`strength-bar ${passwordStrength.minLength ? 'valid' : ''}`}></div>
                                    <div className={`strength-bar ${passwordStrength.hasUpperCase ? 'valid' : ''}`}></div>
                                    <div className={`strength-bar ${passwordStrength.hasLowerCase ? 'valid' : ''}`}></div>
                                    <div className={`strength-bar ${passwordStrength.hasNumbers ? 'valid' : ''}`}></div>
                                </div>
                                <div className="strength-text">
                                    <span className={strengthInfo.class}>{strengthInfo.text}</span>
                                </div>
                                <ul className="strength-requirements">
                                    <li className={passwordStrength.minLength ? 'met' : ''}>
                                        ✓ At least 6 characters
                                    </li>
                                    <li className={passwordStrength.hasUpperCase ? 'met' : ''}>
                                        ✓ Uppercase letter (A-Z)
                                    </li>
                                    <li className={passwordStrength.hasLowerCase ? 'met' : ''}>
                                        ✓ Lowercase letter (a-z)
                                    </li>
                                    <li className={passwordStrength.hasNumbers ? 'met' : ''}>
                                        ✓ Number (0-9)
                                    </li>
                                </ul>
                            </div>
                        )}

                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        <button onClick={handleResetPassword} disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgetPassword;
