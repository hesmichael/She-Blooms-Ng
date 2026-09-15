import React, { createContext, useContext, useMemo } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

interface ConvexContextType {
  isConfigured: boolean;
  deploymentUrl: string | null;
}

const ConvexStatusContext = createContext<ConvexContextType>({
  isConfigured: false,
  deploymentUrl: null,
});

export const useConvexStatus = () => useContext(ConvexStatusContext);

const rawEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const defaultConvexUrl = 'https://patient-goldfinch-945.eu-west-1.convex.cloud';
const convexUrl = (rawEnv?.VITE_CONVEX_URL || defaultConvexUrl).trim().replace(/\/$/, '');

let clientInstance: ConvexReactClient | null = null;

if (convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'))) {
  try {
    clientInstance = new ConvexReactClient(convexUrl);
  } catch (err) {
    console.warn('Convex client initialization warning:', err);
  }
}

export const convexClient = clientInstance;

interface ConvexAppProviderProps {
  children: React.ReactNode;
}

export const ConvexAppProvider: React.FC<ConvexAppProviderProps> = ({ children }) => {
  const isConfigured = Boolean(clientInstance && convexUrl);

  const contextValue = useMemo(
    () => ({
      isConfigured,
      deploymentUrl: convexUrl || null,
    }),
    [isConfigured]
  );

  if (clientInstance) {
    return (
      <ConvexStatusContext.Provider value={contextValue}>
        <ConvexProvider client={clientInstance}>{children}</ConvexProvider>
      </ConvexStatusContext.Provider>
    );
  }

  return (
    <ConvexStatusContext.Provider value={contextValue}>
      {children}
    </ConvexStatusContext.Provider>
  );
};
