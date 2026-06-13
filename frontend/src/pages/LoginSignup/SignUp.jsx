import { useState, useLayoutEffect } from "react";
import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";

const SignUpPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState(() => {
        return localStorage.getItem("signup-role") || "customer";
    });

    useLayoutEffect(() => {
        localStorage.setItem("signup-pending", "true");
        localStorage.setItem("signup-role", role);
    }, [role]);

    const handleRoleChange = (selectedRole) => {
        setRole(selectedRole);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">
                    <h1>FASHION</h1>
                </div>

                <div className="loginsignup-role">
                    <label>Register as:</label>
                    <div className="role-options">
                        <div
                            className={`role-option ${role === "customer" ? "active" : ""}`}
                            onClick={() => handleRoleChange("customer")}
                        >
                            <span className="role-icon">🛒</span>
                            <span className="role-label">Customer</span>
                        </div>
                        <div
                            className={`role-option ${role === "vendor" ? "active" : ""}`}
                            onClick={() => handleRoleChange("vendor")}
                        >
                            <span className="role-icon">🏪</span>
                            <span className="role-label">Vendor</span>
                        </div>
                    </div>
                </div>

                <SignUp
                    routing="path"
                    path="/signup"
                    signInUrl="/LoginSignup"
                    unsafeMetadata={{ role }}
                    fallbackRedirectUrl="/LoginSignup"
                />

                <div className="signup-link">
                    <span>Already have an account? </span>
                    <button type="button" onClick={() => navigate("/LoginSignup")}>
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
