import { Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { getHomeByRole } from '../utils/auth';
import { useAppAuth } from '../context/AuthContext';

const AuthLoading = () => (
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

export const RoleBasedRedirect = () => {
    const { authReady, role } = useAppAuth();

    if (!authReady) {
        return <AuthLoading />;
    }

    return <Navigate to={getHomeByRole(role)} replace />;
};

const RoleGuard = ({ allowedRoles, children }) => {
    const { authReady, role } = useAppAuth();

    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                {!authReady ? (
                    <AuthLoading />
                ) : !role ? (
                    <Navigate to="/LoginSignup" replace />
                ) : !allowedRoles.includes(role) ? (
                    <Navigate to={getHomeByRole(role)} replace />
                ) : (
                    children
                )}
            </SignedIn>
        </>
    );
};

export default RoleGuard;
