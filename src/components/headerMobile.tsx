"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faCircleUser, faBars, faHouse, faCommentDots } from '@fortawesome/free-solid-svg-icons'; 
import Link from "next/link";
// import { usePathname } from "next/navigation";
import Image from "next/image";
// import dash from "../../public/images/logo-dash.png";
// import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import logo from "../../public/images/logo.png";

declare global {
    interface Window {
      FB: any;
      fbAsyncInit: () => void;
    }
}

export default function HeaderMobile() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false); // ⬅️ new
  
    useEffect(() => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
  
        window.FB.getLoginStatus((response: any) => {
          if (response.status === "connected") {
            const { accessToken, userID } = response.authResponse;
            window.FB.api(
              "/me",
              { fields: "id,name,email,picture" },
              (userInfo: any) => {
                setUser(userInfo);
                localStorage.setItem("fb_user", JSON.stringify(userInfo));
              }
            );
          }
        });
      };
  
      const loadFBSDK = () => {
        if (document.getElementById("facebook-jssdk")) return;
        const js = document.createElement("script");
        js.id = "facebook-jssdk";
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        document.body.appendChild(js);
      };
  
      loadFBSDK();
  
      const savedUser = localStorage.getItem("fb_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
  
      // 🔁 Check token every 5 minutes
      const interval = setInterval(() => {
        window.FB.getLoginStatus((res: any) => {
          if (res.status !== "connected") {
            setTokenExpired(true);
            setUser(null);
            localStorage.removeItem("fb_user");
            localStorage.removeItem("fb_pages");
          }
        });
      }, 5 * 60 * 1000);
  
      return () => clearInterval(interval);
    }, []);
  
    const handleLogin = () => {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            const { accessToken, userID } = response.authResponse;
  
            window.FB.api(
              "/me",
              { fields: "id,name,email,picture" },
              async (userInfo: any) => {
                setUser(userInfo);
                localStorage.setItem("fb_user", JSON.stringify(userInfo));
  
                window.FB.api(
                  "/me/accounts",
                  async (resPages: any) => {
                    if (resPages?.data?.length > 0) {
                      const pages = resPages.data.map((page: any) => ({
                        id: page.id,
                        name: page.name,
                        access_token: page.access_token,
                        category: page.category,
                      }));
  
                      await saveUser(userID, accessToken, userInfo, pages);
                      localStorage.setItem("fb_pages", JSON.stringify(pages));
                      setUser(userInfo);
                      setIsModalOpen(false);
                      setTokenExpired(false); // ⬅️ clear expired modal
                      window.location.reload();
                    } else {
                      alert("Bạn chưa quản lý trang nào.");
                    }
                  }
                );
              }
            );
          }
        },
        { scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_messaging" }
      );
    };
  
    const saveUser = async (
      userID: string,
      accessToken: string,
      userInfo: any,
      pages: any[]
    ) => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/facebook-auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID, accessToken, userInfo, pages }),
        });
  
        if (!res.ok) throw new Error("Server login failed");
  
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error saving to backend:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleLogout = () => {
      window.FB.logout(() => {
        setUser(null);
        localStorage.removeItem("fb_user");
        localStorage.removeItem("fb_pages");
        window.location.reload();
      });
    };
    return (
        <>
            {/* Header Fixed Sticky */}
            <header className="fixed top-0 left-0 w-full bg-gray-800 text-white flex justify-between items-center px-4 py-3 z-50 sm:hidden">
            {/* Nút Hamburger */}
            <button onClick={toggleSidebar} className="text-white text-xl">
                <FontAwesomeIcon icon={faBars} />
            </button>

            {/* Logo */}
            <Link href={"/"}>
                <Image src={logo} alt="Logo" width={100} height={30} className="object-contain" />
            </Link>
            </header>

            {/* Sidebar Offcanvas */}
            <div className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-transform duration-300 z-50 sm:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="p-4 flex flex-col space-y-2">
                {/* Nút đóng Sidebar */}
                <button onClick={toggleSidebar} className="text-white text-xl mb-4">
                ✕
                </button>

                {/* Menu Sidebar */}
                <ul className="space-y-4">
                <li>
                    <Link href="/" className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faHouse} />
                    <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link href="/messenger" className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCommentDots} />
                    <span>Messenger</span>
                    </Link>
                </li>
                </ul>

                {/* Đăng nhập / Đăng xuất */}
                {user ? (
                <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                    Log out
                </button>
                ) : (
                <button onClick={() => setIsModalOpen(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                    <FontAwesomeIcon icon={faRightToBracket} className="mr-2" /> Sign in
                </button>
                )}
            </div>
            </div>

            {/* Modal Đăng nhập */}
            {(isModalOpen || tokenExpired) && (
            <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-semibold text-center">
                    {tokenExpired ? "Phiên đăng nhập đã hết hạn" : "Sign in"}
                </h2>
                <button onClick={handleLogin} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Đăng nhập với Facebook
                </button>
                <button onClick={() => setIsModalOpen(false)} className="mt-2 w-full text-gray-600 hover:text-red-600">
                    ✕ Đóng
                </button>
                </div>
            </div>
            )}
        </>
    );
}