import React, { createContext, useContext, useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './authConfig';
import studentsData from '../data/students.json';
import housesData from '../data/houses.json';
import { getActiveUserSession, setActiveUserSession } from '../utils/storage';

const AuthContext = createContext(null);

let msalInstance = null;
try {
  msalInstance = new PublicClientApplication(msalConfig);
} catch (e) {
  console.error("MSAL Initialization Error:", e);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [msalReady, setMsalReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Restore local session if exists
    const saved = getActiveUserSession();
    if (saved) {
      setCurrentUser(saved);
    }

    // 2. Initialize MSAL
    if (msalInstance) {
      msalInstance.initialize()
        .then(() => {
          // Check if user is already signed in MSAL accounts
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            const acc = accounts[0];
            const email = acc.username || acc.idTokenClaims?.preferred_username || acc.idTokenClaims?.email;
            const profile = linkUserWithDatabase(email, acc.name);
            setCurrentUser(profile);
            setActiveUserSession(profile);
          }
          setMsalReady(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Erreur d'initialisation MSAL:", err);
          setMsalReady(true);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Match an email with students database & Houses
  const linkUserWithDatabase = (email, rawName = '') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const matched = studentsData.find(s => s.email.toLowerCase() === cleanEmail);

    const isAdmin = cleanEmail === 'victor1.granger@epitech.eu' || matched?.isAdmin || false;

    if (matched) {
      const house = housesData.find(h => h.id === matched.teamId) || null;
      return {
        ...matched,
        isAdmin,
        house
      };
    }

    // Guest / New Epitech user
    const names = (rawName || cleanEmail.split('@')[0]).replace('.', ' ').split(' ');
    const firstName = names[0] ? names[0].charAt(0).toUpperCase() + names[0].slice(1) : 'Étudiant';
    const lastName = names[1] ? names[1].toUpperCase() : 'EPITECH';

    return {
      id: `ext-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: cleanEmail,
      firstName,
      lastName,
      fullName: rawName || `${firstName} ${lastName}`,
      classe: 'Epitech Moulins',
      teamId: null,
      teamName: 'Non assigné',
      isAdmin,
      house: null
    };
  };

  // Real Microsoft 365 Entra ID SSO Login
  const loginWithMicrosoft = async () => {
    setAuthError(null);

    const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
    if (!clientId || clientId.startsWith("00000000")) {
      setAuthError("Configuration SSO incomplète : veuillez renseigner VITE_AZURE_CLIENT_ID dans le fichier .env avec l'identifiant d'application Microsoft Entra ID.");
      return;
    }

    if (!msalInstance || !msalReady) {
      setAuthError("Le service d'authentification Microsoft 365 est en cours de chargement. Veuillez réessayer.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await msalInstance.loginPopup(loginRequest);
      if (response && response.account) {
        const account = response.account;
        const email = account.username || account.idTokenClaims?.preferred_username || account.idTokenClaims?.email;
        const profile = linkUserWithDatabase(email, account.name);
        
        setCurrentUser(profile);
        setActiveUserSession(profile);
      }
    } catch (err) {
      console.warn("Connexion Microsoft annulée ou rejetée:", err);
      if (err.errorCode !== 'user_cancelled') {
        setAuthError(err.message || "Échec de la connexion Microsoft 365. Vérifiez la configuration Azure Entra ID.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout from MSAL and clear session
  const logout = async () => {
    try {
      if (msalInstance) {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          await msalInstance.logoutPopup({
            account: accounts[0],
            mainWindowRedirectUri: window.location.origin
          });
        }
      }
    } catch (e) {
      console.warn("Logout popup notice:", e);
    } finally {
      setCurrentUser(null);
      setActiveUserSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginWithMicrosoft,
        logout,
        isAdmin: !!currentUser?.isAdmin,
        authError,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
