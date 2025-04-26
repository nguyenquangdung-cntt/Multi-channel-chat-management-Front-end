"use client"; 
import logo from "../../public/images/logo.png";
import Image from "next/image";

export default function ChatUI() {

  return (
    <div className="flex h-[1180px] w-full bg-white items-center justify-center">
      <Image
        src={logo}
        alt="Logo"
        className="w-[500px] h-[100px]"
      />
    </div>
  );
}
