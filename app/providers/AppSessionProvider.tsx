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
export type AppIntlSettings = {
  numberFormat: Intl.NumberFormat;
  currencyFormatFactory: (currency: string) => Intl.NumberFormat;
  dateFormat: Intl.DateTimeFormat;
};
export type ClientAppSession = AppSession & {
  numberFormat: Intl.NumberFormat;
  currencyFormatFactory: (currency: string) => Intl.NumberFormat;
  dateFormat: Intl.DateTimeFormat;
};
const AppSessionContext = createContext<ClientAppSession>({
  state: "unauthenticated",
  user: null,
  numberFormat: new Intl.NumberFormat(),
  currencyFormatFactory: (currency) =>
    new Intl.NumberFormat([], { currency: currency }),
  dateFormat: new Intl.DateTimeFormat([]),
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
}: React.PropsWithChildren<{
  value: AppSession;
}>) => {
  return (
    <AppSessionContext.Provider
      value={{
        ...value,
        dateFormat: new Intl.DateTimeFormat(),
        numberFormat: new Intl.NumberFormat(),
        currencyFormatFactory: (currency) =>
          new Intl.NumberFormat([], { currency: currency }),
      }}
    >
      {children}
    </AppSessionContext.Provider>
  );
};

export { AppSessionContext, AppSessionProvider, useAppSession };
