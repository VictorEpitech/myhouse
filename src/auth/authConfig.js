// Microsoft MSAL Configuration for Microsoft 365 (Epitech Office 365 SSO)

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || "common";
const authority = import.meta.env.VITE_AZURE_AUTHORITY || `https://login.microsoftonline.com/${tenantId}`;
const redirectUri = import.meta.env.VITE_AZURE_REDIRECT_URI || (typeof window !== "undefined" ? window.location.origin : "/");

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "00000000-0000-0000-0000-000000000000",
    authority,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};
