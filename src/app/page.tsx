"use client";

import { useState } from "react";
import Content from "@/components/content";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="h-screen bg-blue-300 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 bg-blue-100 p-4">
          <Content />
        </div>
      </div>
    </main>
  );
}
