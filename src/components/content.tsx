"use client"; 
import logo from "../../public/images/logo.png";
import Image from "next/image";

export default function ChatUI() {
  return (
    <div id="home" className="flex h-screen md:h-[600px] lg:h-[600px] xl:h-[1180px] w-full bg-white items-center justify-center p-4">
      <Image
        src={logo}
        alt="Logo"
        className="w-[200px] h-[40px] sm:w-[150px] sm:h-[30px] xs:w-[120px] xs:h-[24px]"
      />
    </div>
  );
}
