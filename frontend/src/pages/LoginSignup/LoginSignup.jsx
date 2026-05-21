import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './LoginSignup.css';
import ForgetPassword from './ForgetPassword';

const LoginSignup = () => {
    const [state, setState] = useState("Sign Up");
    const [step, setStep] = useState("form"); // form, otp
    const [showForgetPassword, setShowForgetPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        role: "customer"
    });
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [errors, setErrors] = useState({});
    const [otpPurpose, setOtpPurpose] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [tempEmail, setTempEmail] = useState(""); // Store email for OTP verification
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

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        
        if (e.target.name === 'password') {
            checkPasswordStrength(e.target.value);
        }
        
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (state === "Sign Up" && !formData.username.trim()) {
            newErrors.username = "Username is required";
        }
        
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (state === "Sign Up" && !passwordStrength.isValid) {
            newErrors.password = "Password does not meet requirements";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Request OTP for Signup
    const requestSignupOTP = async () => {
        if (!validateForm()) return false;
        
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/request-signup-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    role: formData.role
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setOtpPurpose("signup");
                setTempEmail(formData.email);
                setStep("otp");
                setTimer(60);
                alert("OTP sent to your email! Please check your inbox.");
                return true;
            } else {
                alert(data.errors || "Failed to send OTP. Please try again.");
                return false;
            }
        } catch (error) {
            console.error("OTP Request Error:", error);
            alert("Network error. Please try again.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Login - First verify credentials
    const login = async () => {
        if (!formData.email.trim()) {
            setErrors({ email: "Email is required" });
            return;
        }
        
        if (!formData.password) {
            setErrors({ password: "Password is required" });
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Check if it's admin (no OTP required)
                if (data.role === 'admin') {
                    localStorage.setItem('auth-token', data.token);
                    localStorage.setItem('user-role', data.role);
                    window.location.replace("/admin");
                } 
                // Regular user - requires OTP
                else if (data.requiresOTP) {
                    setOtpPurpose("login");
                    setTempEmail(formData.email);
                    setStep("otp");
                    setTimer(60);
                    alert("OTP sent to your email! Please check your inbox.");
                }
            } else {
                alert(data.errors || "Invalid email or password. Please try again.");
            }
        } catch (error) {
            console.error("Login Error:", error);
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
            let endpoint = '';
            let body = {};
            
            if (otpPurpose === "signup") {
                endpoint = 'http://localhost:4000/resend-signup-otp';
                body = { email: tempEmail };
            } else {
                endpoint = 'http://localhost:4000/resend-login-otp';
                body = { email: tempEmail };
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
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

    // Verify OTP and Complete Signup
    const completeSignup = async () => {
        if (!otp || otp.length !== 6) {
            alert("Please enter a valid 6-digit OTP");
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: tempEmail,
                    otp: otp,
                    purpose: "signup"
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert("Account created successfully! Please login.");
                setStep("form");
                setState("Login");
                setFormData({
                    username: "",
                    password: "",
                    email: "",
                    role: "customer"
                });
                setOtp("");
                setTempEmail("");
            } else {
                alert(data.errors || "Verification failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and Complete Login
    const completeLogin = async () => {
        if (!otp || otp.length !== 6) {
            alert("Please enter a valid 6-digit OTP");
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('http://localhost:4000/verify-login-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: tempEmail,
                    otp: otp,
                    purpose: "login"
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('auth-token', data.token);
                localStorage.setItem('user-role', data.role);
                
                if (data.role === 'vendor') {
                    window.location.replace("/vendor");
                } else {
                    window.location.replace("/");
                }
            } else {
                alert(data.errors || "Verification failed. Please try again.");
            }
        } catch (error) {
            console.error("Login Verification Error:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

const handleSubmit = async () => {

    // CHECK TERMS & CONDITIONS
    if (!acceptedTerms) {

        alert(
            "Please accept the Terms & Conditions to continue."
        );

        return;
    }

    if (state === "Sign Up") {

        await requestSignupOTP();

    } else {

        await login();
    }
};

    const handleOTPSubmit = async () => {
        if (otpPurpose === "signup") {
            await completeSignup();
        } else {
            await completeLogin();
        }
    };

    const handleBackToForm = () => {
        setStep("form");
        setOtp("");
        setErrors({});
        setTempEmail("");
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength.score === 0) return { text: 'Very Weak', class: 'weak' };
        if (passwordStrength.score === 1) return { text: 'Weak', class: 'weak' };
        if (passwordStrength.score === 2) return { text: 'Medium', class: 'medium' };
        if (passwordStrength.score === 3) return { text: 'Strong', class: 'strong' };
        return { text: '', class: '' };
    };

    const strengthInfo = getPasswordStrengthText();

    // Show forget password component
    if (showForgetPassword) {
        return <ForgetPassword onBackToLogin={() => setShowForgetPassword(false)} />;
    }

    return (
        <div>
            
            <div className='loginsignup'>
                <div className="loginsignup-container">
                {step === "form" ? (
                    // Form View
                    <>
                        <h1>{state}</h1>
                        <div className="loginsignup-fields">
                            {state === "Sign Up" && (
                                <div className="input-wrapper">
                                    <input 
                                        name='username' 
                                        value={formData.username} 
                                        onChange={changeHandler} 
                                        type="text" 
                                        placeholder='Your Name'
                                        className={errors.username ? 'error' : ''}
                                    />
                                    {errors.username && <span className="error-message">{errors.username}</span>}
                                </div>
                            )}
                            
                            <div className="input-wrapper">
                                <input 
                                    name='email' 
                                    value={formData.email} 
                                    onChange={changeHandler} 
                                    type="email" 
                                    placeholder='Your Email'
                                    className={errors.email ? 'error' : ''}
                                    disabled={loading}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                            
                            <div className="input-wrapper">
                                <div className="password-input-wrapper">
                                    <input 
                                        name='password' 
                                        value={formData.password} 
                                        onChange={changeHandler} 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder='Password'
                                        className={errors.password ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            {state === "Sign Up" && formData.password && (
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
                            
                            {state === "Sign Up" && (
                                <div className="loginsignup-role">
                                    <label>Register as:</label>
                                    <div className="role-options">
                                        <div 
                                            className={`role-option ${formData.role === 'customer' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, role: 'customer'})}
                                        >
                                            <span className="role-icon">🛒</span>
                                            <span className="role-label">Customer</span>
                                        </div>
                                        <div 
                                            className={`role-option ${formData.role === 'vendor' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, role: 'vendor'})}
                                        >
                                            <span className="role-icon">🏪</span>
                                            <span className="role-label">Vendor</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Processing...' : (state === "Sign Up" ? 'Send OTP' : 'Login')}
                        </button>
                        
                        {state === "Sign Up" ? (
                            <p className="loginsignup-login">
                                Already have an account? <span onClick={() => setState("Login")}>Login here</span>
                            </p>
                        ) : (
                            <>
                                <p className="loginsignup-login">
                                    Create an account? <span onClick={() => setState("Sign Up")}>Click here</span>
                                </p>
                                <p className="forgot-password-link">
                                    <span onClick={() => setShowForgetPassword(true)}>Forgot Password?</span>
                                </p>
                            </>
                        )}
                        
                        <div className="loginsignup-agree">
                            <input
    type="checkbox"
    name="terms"
    id="terms"
    checked={acceptedTerms}
    onChange={(e) =>
        setAcceptedTerms(e.target.checked)
    }
/>
                            <label htmlFor="terms">By continuing, I agree to the terms of use and privacy policy.</label>
                        </div>
                    </>
                ) : (
                    // OTP Verification View
                    <>
                        <h1>Verify OTP</h1>
                        <p className="otp-info-text">
                            We've sent a 6-digit verification code to <strong>{tempEmail}</strong>
                        </p>
                        
                        <div className="loginsignup-fields">
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="Enter OTP" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength="6"
                                    className="otp-input"
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        <button onClick={handleOTPSubmit} disabled={loading || otp.length !== 6}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        
                        <div className="resend-otp-container">
                            {timer > 0 ? (
                                <p className="timer-text">
                                    Resend code in <span className="timer">{timer}</span> seconds
                                </p>
                            ) : (
                                <button 
                                    className="resend-btn" 
                                    onClick={resendOTP}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                        
                        <button className="back-btn" onClick={handleBackToForm}>
                            ← Back
                        </button>
                    </>
                )}
            </div>
            </div>
            
        </div>
    );
};

export default LoginSignup;
