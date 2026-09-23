import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { createMsalConfig, loginRequest } from './authConfig';
import studentsData from '../data/students.json';
import housesData from '../data/houses.json';
import { getActiveUserSession, setActiveUserSession } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [msalReady, setMsalReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [runtimeConfig, setRuntimeConfig] = useState(null);
  const msalInstanceRef = useRef(null);

  // Match an email with dynamic SQLite database & Houses (with fallback to students.json)
  const linkUserWithDatabase = async (email, rawName = '') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const isAdmin = cleanEmail === 'victor1.granger@epitech.eu';

    // 1. Try fetching authoritative student from SQLite DB
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const s = json.data;
          const house = housesData.find(h => h.id === s.teamId || h.name === s.teamName) || null;
          return {
            ...s,
            isAdmin: isAdmin || Boolean(s.isAdmin),
            house
          };
        }
      }
    } catch (err) {
      console.warn('Backend DB check fallback:', err);
    }

    // 2. Fallback to bundled students.json
    const matched = studentsData.find(s => s.email.toLowerCase() === cleanEmail);
    if (matched) {
      const house = housesData.find(h => h.id === matched.teamId) || null;
      return {
        ...matched,
        isAdmin: isAdmin || Boolean(matched.isAdmin),
        house
      };
    }

    // 3. Guest / New Epitech user
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

  useEffect(() => {
    // 1. Restore local session if exists
    const saved = getActiveUserSession();
    if (saved) {
      setCurrentUser(saved);
      // Synchronize with latest DB state in case admin updated house
      if (saved.email) {
        linkUserWithDatabase(saved.email, saved.fullName).then(refreshed => {
          if (refreshed) {
            setCurrentUser(refreshed);
            setActiveUserSession(refreshed);
          }
        }).catch(() => {});
      }
    }

    // 2. Fetch runtime config from server (Portainer / Docker env) & initialize MSAL
    const initAuth = async () => {
      let cfg = {};
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          cfg = await res.json();
          setRuntimeConfig(cfg);
        }
      } catch (e) {
        console.warn('API config fallback to build env:', e);
      }

      const activeConfig = createMsalConfig(cfg);
      try {
        const instance = new PublicClientApplication(activeConfig);
        await instance.initialize();
        msalInstanceRef.current = instance;

        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          const acc = accounts[0];
          const email = acc.username || acc.idTokenClaims?.preferred_username || acc.idTokenClaims?.email;
          const profile = await linkUserWithDatabase(email, acc.name);
          setCurrentUser(profile);
          setActiveUserSession(profile);
        }
        setMsalReady(true);
      } catch (err) {
        console.error("Erreur d'initialisation MSAL:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Real Microsoft 365 Entra ID SSO Login
  const loginWithMicrosoft = async () => {
    setAuthError(null);

    const effectiveClientId = runtimeConfig?.clientId || import.meta.env.VITE_AZURE_CLIENT_ID;
    if (!effectiveClientId || effectiveClientId.startsWith("00000000")) {
      setAuthError("Configuration SSO requise : veuillez renseigner VITE_AZURE_CLIENT_ID dans les variables d'environnement de Portainer ou votre fichier .env.");
      return;
    }

    const instance = msalInstanceRef.current;
    if (!instance || !msalReady) {
      setAuthError("Le service d'authentification Microsoft 365 est en cours de chargement. Veuillez réessayer.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await instance.loginPopup(loginRequest);
      if (response && response.account) {
        const account = response.account;
        const email = account.username || account.idTokenClaims?.preferred_username || account.idTokenClaims?.email;
        const profile = await linkUserWithDatabase(email, account.name);
        
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
      const instance = msalInstanceRef.current;
      if (instance) {
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          await instance.logoutPopup({
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
