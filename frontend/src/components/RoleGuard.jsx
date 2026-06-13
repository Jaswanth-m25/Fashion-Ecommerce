import { Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { getHomeByRole } from '../utils/auth';

export const RoleBasedRedirect = () => {
    const role = localStorage.getItem('user-role');
    return <Navigate to={getHomeByRole(role)} replace />;
};

const RoleGuard = ({ allowedRoles, children }) => {
    const role = localStorage.getItem('user-role');

    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                {!role ? (
                    <div style={{
                        height: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '1.2rem'
                    }}>
                        Loading...
                    </div>
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
