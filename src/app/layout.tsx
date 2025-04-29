"use client";

import { useState } from "react";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";


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
        <main id="main" className="h-[1211px] flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div id="children" className="h-[1211px] flex-1 bg-blue-100 p-4">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
