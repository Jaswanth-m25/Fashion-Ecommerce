import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./LoginSignup.css";

const LoginSignup = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("signup-role");
        localStorage.removeItem("signup-pending");
    }, []);

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">
                    <h1>FASHION</h1>
                </div>

                <SignIn
                    routing="path"
                    path="/LoginSignup"
                    signUpUrl="/signup"
                    fallbackRedirectUrl="/"
                />

                <div className="signup-link">
                    <span>Don't have an account? </span>
                    <button type="button" onClick={() => navigate("/signup")}>
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
