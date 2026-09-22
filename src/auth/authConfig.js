// Microsoft MSAL Configuration for Microsoft 365 (Epitech Office 365 SSO)

export const createMsalConfig = (custom = {}) => {
  const tenantId = custom.tenantId || import.meta.env.VITE_AZURE_TENANT_ID || "organizations";
  const authority = custom.authority || import.meta.env.VITE_AZURE_AUTHORITY || `https://login.microsoftonline.com/${tenantId}`;
  const redirectUri = custom.redirectUri || import.meta.env.VITE_AZURE_REDIRECT_URI || (typeof window !== "undefined" ? window.location.origin : "/");
  const clientId = custom.clientId || import.meta.env.VITE_AZURE_CLIENT_ID || "00000000-0000-0000-0000-000000000000";

  return {
    auth: {
      clientId,
      authority,
      redirectUri,
      postLogoutRedirectUri: redirectUri,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };
};

export const msalConfig = createMsalConfig();

export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};
