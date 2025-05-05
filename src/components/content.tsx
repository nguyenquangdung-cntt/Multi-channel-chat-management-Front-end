"use client"; 
import logo from "../../public/images/logo.png";
import Image from "next/image";
import { faFacebook, faFacebookMessenger, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ChatUI() {
  return (
    <div id="home" className="flex h-screen md:h-[600px] lg:h-[600px] xl:h-[605px] w-full bg-white items-center justify-center p-4">
      <Image
        src={logo}
        alt="Logo"
        className="w-[200px] h-[40px] sm:w-[150px] sm:h-[30px] xs:w-[120px] xs:h-[24px]"
      />
      <div className="sm:hidden block">
        <div className="absolute top-[20%] left-5 w-8 h-8 bg-blue-300 rounded-full animate-floating-spin"></div>
        <div className="absolute top-20 right-10 w-12 h-12 bg-red-300 rounded-lg animate-floating-glow"></div>
        <div className="absolute bottom-32 left-20 w-10 h-10 bg-yellow-300 rounded-full animate-floating-spin"></div>
        <div className="absolute bottom-[30%] right-[15%] w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full animate-floating">
          <FontAwesomeIcon icon={faFacebook} className="text-2xl" />
        </div>
        <div className="absolute bottom-[60%] left-[10%] w-12 h-12 flex items-center justify-center bg-blue-400 text-white rounded-full animate-floating">
          <FontAwesomeIcon icon={faFacebookMessenger} className="text-2xl" />
        </div>
        <div className="absolute top-[20%] right-[40%] w-12 h-12 flex items-center justify-center bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-full animate-floating-spin">
          <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
        </div>
      </div>
    </div>
  );
}
