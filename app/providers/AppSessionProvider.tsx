"use client";
import { $Enums } from "@prisma/client";
import { createContext, useContext } from "react";

export type AuthenticatedAppSession = {
  state: "authenticated";
  user: {
    id: string;
    homeCurrency: $Enums.Currency;
  };
};
export type UnauthenticatedAppSession = {
  state: "unauthenticated";
  user: null;
};
export type AppSession = AuthenticatedAppSession | UnauthenticatedAppSession;
const AppSessionContext = createContext<AppSession>({
  state: "unauthenticated",
  user: null,
});

const useAppSession = () => {
  const context = useContext(AppSessionContext);
  if (context === undefined) {
    throw new Error("useAppSession must be used within a AppSessionProvider");
  }
  return context;
};
const AppSessionProvider = ({
  children,
  value,
}: React.PropsWithChildren<{ value: AppSession }>) => {
  return (
    <AppSessionContext.Provider value={value}>
      {children}
    </AppSessionContext.Provider>
  );
};

export { AppSessionContext, AppSessionProvider, useAppSession };
