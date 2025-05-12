import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faCircleUser, faBell } from '@fortawesome/free-solid-svg-icons'; 
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import logo from "../../public/images/logo.png";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [notifications, setNotifications] = useState<{ userName: string; message: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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

  useEffect(() => {
    // Kết nối socket chỉ khi đã đăng nhập
    if (!user) return;
    if (!socketRef.current) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      socketRef.current = io(API_URL);
    }

    // Ví dụ: lắng nghe sự kiện "notification"
    socketRef.current.on("notification", (data: { userName: string; message: string }) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("notification");
      }
    };
  }, [user]);

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
      window.location.reload();
    });
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

      <header>
        <div className=" flex justify-between items-center py-4 px-6">
          <Link href={"/"}>
            <img src={logo.src} alt="Logo" className="w-[155px] h-[30px]" />
          </Link>

          {user ? (
            <div className="relative flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="hidden sm:flex items-center relative">
                <div
                  className="relative cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </div>
                {showDropdown && (
                  <div className="absolute top-8 right-0 bg-white shadow-lg rounded-lg p-4 w-64 z-50">
                    {notifications.length > 0 ? (
                      <>
                        {notifications.map((notification, index) => (
                          <div key={index} className="mb-2">
                            <p className="font-bold">{notification.userName}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                        ))}
                        <button
                          className="text-blue-500 text-sm mt-2 hover:underline"
                          onClick={() => setNotifications([])}
                        >
                          Clear all
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">No new notifications</p>
                    )}
                  </div>
                )}
              </div>

              <p className="font-bold">{user.name}</p>
              <div className="relative">
                <img
                  src={user.picture?.data?.url}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                />
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-md z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              className="bg-blue-700 text-white rounded-[50px] px-4 py-1 transition cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <FontAwesomeIcon icon={faRightToBracket} className="mr-[5px]"/> Log in
            </button>
          )}
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50">
          <div id="modal" className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <FontAwesomeIcon icon={faCircleUser} className="text-[20px]"/> 
              <h2 className="text-xl font-semibold">
               Log in
              </h2>
              <span
                className="text-[25px] cursor-pointer text-gray-600 hover:text-red-600"
                onClick={() => {
                  setIsModalOpen(false);
                  // setTokenExpired(false);
                }}
              >
                ×
              </span>
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded cursor-pointer hover:bg-blue-700"
              onClick={handleLogin}
            >
              <FontAwesomeIcon icon={faFacebook} className="text-white" /> Log in with Facebook
            </button>
          </div>
        </div>
      )}
    </>
  );
}
