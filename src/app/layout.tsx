"use client";

import { useState } from "react";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import HeaderMobile from "@/components/headerMobile";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <html lang="en">
      <head>
        <title>Messenger Chat UI</title>
      </head>
      <body>
        <main id="main" className="sm:h-[1211px] h-screen flex flex-col">
          <div className="block sm:hidden">
            <HeaderMobile/>
          </div>

          <div className="hidden sm:block">
            <Header />
          </div>
          <div className="flex flex-1">
            <div className="hidden sm:block">
              <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>
            <div id="children" className="sm:h-[1211px] h-screen flex-1 bg-blue-100 sm:p-4 px-4">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
