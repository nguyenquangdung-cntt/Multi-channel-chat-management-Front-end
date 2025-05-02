"use client"; 
import logo from "../../public/images/logo.png";
import Image from "next/image";

export default function ChatUI() {
  return (
    <div className="flex w-screen h-screen bg-white items-center justify-center">
      <Image
        src={logo}
        alt="Logo"
        className="w-[200px] h-[40px] sm:w-[150px] sm:h-[30px] xs:w-[120px] xs:h-[24px]"
      />
    </div>
  );
}
