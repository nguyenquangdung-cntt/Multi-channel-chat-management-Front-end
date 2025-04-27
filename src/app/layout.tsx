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
        <main className="h-screen bg-blue-300 flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 bg-blue-100 p-4">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
