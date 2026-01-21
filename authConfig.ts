import { Configuration, LogLevel } from "@azure/msal-browser";

// Azure AD App Registration Configuration
// Replace these values with your Azure Portal app registration details
export const msalConfig: Configuration = {
  auth: {
    clientId: "77841c45-4e58-458c-87b3-43a5b6556811", // Application (client) ID from Azure Portal
    authority: "https://login.microsoftonline.com/422e0e56-e8fe-4fc5-8554-b9b89f3cadac", // Directory (tenant) ID
    redirectUri: "https://mac-pp.vercel.app",
    postLogoutRedirectUri: "https://mac-pp.vercel.app",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Scopes for the login request
export const loginRequest = {
  scopes: ["User.Read"],
};

// Allowed domain for authentication
export const ALLOWED_DOMAIN = "macproducts.net";
