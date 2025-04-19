"use client";

import { useEffect, useState } from "react";

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

  // Load SDK & check login status
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });

      // Kiểm tra nếu user đã đăng nhập
      window.FB.getLoginStatus((response: any) => {
        if (response.status === "connected") {
          const { accessToken, userID } = response.authResponse;

          // Gọi API để lấy thông tin user
          window.FB.api(
            "/me",
            { fields: "id,name,email,picture" },
            (userInfo: any) => {
              setUser(userInfo);
              // Lưu thông tin vào localStorage nếu muốn duy trì sau reload
              localStorage.setItem("fb_user", JSON.stringify(userInfo));
            }
          );
        }
      });
    };

    // Tải SDK
    const loadFBSDK = () => {
      if (document.getElementById("facebook-jssdk")) return;
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      document.body.appendChild(js);
    };

    // Load SDK và phục hồi trạng thái từ localStorage nếu có
    loadFBSDK();

    const savedUser = localStorage.getItem("fb_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Đăng nhập Facebook
  const handleLogin = () => {
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const { accessToken, userID } = response.authResponse;

          window.FB.api(
            "/me",
            { fields: "id,name,email,picture" },
            (userInfo: any) => {
              setUser(userInfo);
              localStorage.setItem("fb_user", JSON.stringify(userInfo));
              void saveUser(userID, accessToken, userInfo);
            }
          );
        }
      },
      { scope: "public_profile,email" }
    );
  };

  // Gửi thông tin user về server
  const saveUser = async (userID: string, accessToken: string, userInfo: any) => {
    try {
      const res = await fetch("http://localhost:5000/api/facebook-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID, accessToken, userInfo }),
      });

      if (!res.ok) throw new Error("Server login failed");

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving to backend:", error);
    }
  };

  // Đăng xuất Facebook
  const handleLogout = () => {
    window.FB.logout(() => {
      setUser(null);
      localStorage.removeItem("fb_user");
    });
  };

  return (
    <>
      <header>
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="text-2xl font-bold text-gray-800">MyWebsite</div>

          <nav className="space-x-6">
            <a href="/" className="text-gray-700 hover:text-emerald-950">Home</a>
            <a href="#" className="text-gray-700 hover:text-emerald-950">About</a>
            <a href="#" className="text-gray-700 hover:text-emerald-950">Services</a>
            <a href="#" className="text-gray-700 hover:text-emerald-950">Contact</a>
          </nav>

          {user ? (
           <div className="relative flex items-center space-x-4">
              <p className="font-bold">{user.name}</p>
        
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.picture?.data?.url}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                />
        
                {/* Dropdown menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
          <button
            className="bg-emerald-950 text-white rounded-[50px] px-4 py-1 transition"
            onClick={() => setIsModalOpen(true)}
          >
            Log in
          </button>
          )}
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 bg-emerald-950 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Log in</h2>
              <span
                className="text-xl cursor-pointer text-gray-600 hover:text-red-600"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition w-full"
            >
              Log in with Facebook
            </button>
          </div>
        </div>
      )}
    </>
  );
}
