import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";
import "./globals.css";
import { AppSessionProvider } from "./providers/AppSessionProvider";
import { authenticate } from "./users";

export const metadata: Metadata = {
  title: "mxbudget",
  description: "Budget software",
};
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default async function Page({
  children,
  breadcrumb,
}: Readonly<{
  children: React.ReactNode;
  breadcrumb: React.ReactNode;
}>) {
  const session = await authenticate();
  if (!session.user) return <></>;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AppSessionProvider value={session}>
            <SessionProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                  <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    {breadcrumb}
                    {/* <ClientBreadcrumbs routeTable={routeTable} /> */}
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                  {children}
                </div>
              </SidebarInset>
            </SessionProvider>
          </AppSessionProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
