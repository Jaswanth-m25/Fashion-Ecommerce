import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                navigate('/LoginSignup');
                return;
            }

            await fetch('http://localhost:4000/getuser', {
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': token,
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.errors) {
                    localStorage.removeItem('auth-token');
                    navigate('/LoginSignup');
                } else {
                    setUserData(data);
                }
            })
            .catch((err) => console.error("Error fetching profile:", err));
        };

        fetchUserData();
    }, [navigate]);

    if (!userData) {
        return <div className="profile-loading">Loading Profile...</div>;
    }

    const totalCartItems = userData.cartData ? Object.values(userData.cartData).reduce((a, b) => a + b, 0) : 0;
    const joinDate = new Date(userData.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div>
            <Navbar />
            <div className="profile">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <h1>{userData.name}</h1>
                    <p className="profile-email">{userData.email}</p>
                </div>
                
                <div className="profile-stats">
                    <div className="stat-card">
                        <h3>Items in Cart</h3>
                        <p>{totalCartItems}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Member Since</h3>
                        <p>{joinDate}</p>
                    </div>
                </div>

                <button className="logout-btn-large" onClick={() => {
                    localStorage.removeItem('auth-token');
                    window.location.replace("/");
                }}>
                    Log Out
                </button>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;

