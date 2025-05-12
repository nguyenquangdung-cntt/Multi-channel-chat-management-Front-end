"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faBars, faHouse, faCommentDots } from '@fortawesome/free-solid-svg-icons'; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../public/images/logo.png";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

declare global {
    interface Window {
      FB: any;
      fbAsyncInit: () => void;
    }
}

export default function HeaderMobile() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
  
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
                      setTokenExpired(false);
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
        setIsSidebarOpen(false);
        setLoading(true);
        window.location.reload();
      });
    };

    const handleNavigation = (path: string) => {
        setLoading(true);
        setTimeout(() => {
            router.push(path);
            setIsSidebarOpen(false);
            setLoading(false);
        }, 1500);
    };
    return (
        <>
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-[9999]">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="absolute w-20 h-20 rounded-full border-4 border-[#1877F2] border-t-transparent animate-spin"></div>
                        <div className="absolute w-16 h-16 rounded-full border-4 border-[#166FE5] border-b-transparent animate-spin-reverse"></div>
                        <div className="absolute w-12 h-12 rounded-full border-4 border-[#3b5998] border-t-transparent animate-spin"></div>
                    </div>

                    <div className="absolute inset-0 overflow-hidden">
                        {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full"    
                            style={{
                            width: `${Math.random() * 10 + 8}px`,
                            height: `${Math.random() * 10 + 8}px`,
                            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                                Math.random() * 255
                            )}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5 + 0.5})`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `floating ${Math.random() * 4 + 2}s infinite alternate ease-in-out`,
                            }}
                        ></div>
                        ))}
                    </div>
                </div>
            )}
            <header className="fixed top-0 left-0 w-full bg-gray-800 text-white flex justify-between items-center px-4 py-3 z-50 sm:hidden" style={{boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)"}}>
                <button onClick={toggleSidebar} className="text-white text-xl border py-1 px-2 bg-blue-500 rounded">
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <Link href={"/"}>
                    <Image src={logo} alt="Logo" width={150} height={40} className="object-contain" />
                </Link>
            </header>

            <div className={`fixed top-0 left-0 w-[300px] h-full bg-gray-900 text-white transition-transform duration-300 z-50 sm:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
              <div className="p-4 flex flex-col space-y-4">
                  <button onClick={toggleSidebar} className="text-white text-xl mr-auto">
                  ✕
                  </button>

                  {user && (
                  <div className="flex items-center space-x-3 border-b border-gray-700 pb-4">
                      <img src={user.picture?.data?.url} alt="User Avatar" className="w-12 h-12 rounded-full border border-gray-600" />
                      <span className="text-lg font-semibold">{user.name}</span>
                  </div>
                  )}

                  <ul className="space-y-4">
                      <li>
                          <button onClick={() => handleNavigation("/")} className="flex items-center space-x-2 w-full text-left">
                              <FontAwesomeIcon icon={faHouse} />
                              <span>Dashboard</span>
                          </button>
                      </li>
                      <li>
                          <button onClick={() => handleNavigation("/messenger")} className="flex items-center space-x-2 w-full text-left">
                              <FontAwesomeIcon icon={faCommentDots} />
                              <span>Messenger</span>
                          </button>
                      </li>
                  </ul>

                  {user ? (
                  <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                      Log out
                  </button>
                  ) : (
                  <button onClick={() => setIsModalOpen(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                      <FontAwesomeIcon icon={faRightToBracket} className="mr-2" /> Log in
                  </button>
                  )}
              </div>
            </div>

            {isModalOpen  && (
                <div className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                      <div className="grid grid-cols-2 items-center">
                        <h2 className="text-xl font-semibold text-center text-left">
                          <FontAwesomeIcon icon={faRightToBracket} className="mr-2" /> log in
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="mt-2 w-full text-gray-600 hover:text-red-600 text-right">
                            ✕
                        </button>
                      </div>
                      <button onClick={handleLogin} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                          <FontAwesomeIcon icon={faFacebook} className="text-white" /> Log in with Facebook
                      </button>
                    </div>
                </div>
            )}
        </>
    );
}