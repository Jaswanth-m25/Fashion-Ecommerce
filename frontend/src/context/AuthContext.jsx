import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || 'https://fashion-ecommerce-ak78.onrender.com';

export const AuthProvider = ({ children }) => {
    const { user, isSignedIn, isLoaded } = useUser();
    const [authReady, setAuthReady] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn || !user) {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user-role');
            setRole(null);
            setAuthReady(true);
            return;
        }

        const syncUser = async () => {
            setAuthReady(false);

            try {
                const signupRole = localStorage.getItem('signup-role')
                    || user.unsafeMetadata?.role;
                const isNewSignup = localStorage.getItem('signup-pending') === 'true';

                const response = await axios.post(`${API_URL}/clerk/sync-user`, {
                    clerkId: user.id,
                    name: user.fullName,
                    email: user.primaryEmailAddress?.emailAddress,
                    role: signupRole,
                    isNewSignup
                });

                localStorage.setItem('auth-token', response.data.token);
                localStorage.setItem('user-role', response.data.role);
                setRole(response.data.role);

                if (isNewSignup) {
                    localStorage.removeItem('signup-role');
                    localStorage.removeItem('signup-pending');
                }
            } catch (error) {
                console.error('User sync error:', error);
                setRole(localStorage.getItem('user-role'));
            } finally {
                setAuthReady(true);
            }
        };

        syncUser();
    }, [isSignedIn, user, isLoaded]);

    if (!isLoaded) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.2rem'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ authReady, role, isSignedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAppAuth = () => useContext(AuthContext);
