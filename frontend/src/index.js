import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ShopContextProvider from './context/ShopContext';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    signInUrl="/LoginSignup"
    signUpUrl="/signup"
  >
    <ShopContextProvider>
      <App/>
    </ShopContextProvider>
  </ClerkProvider>
);
