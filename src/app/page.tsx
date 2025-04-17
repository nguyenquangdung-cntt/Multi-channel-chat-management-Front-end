"use client";

import { useEffect } from "react";

// Extend the Window interface to include FB
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function Home() {
  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID, // .env.local
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
    };

    // Inject SDK script
    (function (d, s, id) {
      let js: HTMLScriptElement;
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode!.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  const sendTokenToBackend = async (accessToken: string, userID: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/facebook-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, userID }),
      });

      const data = await res.json();
      console.log("✅ Server response:", data);
    } catch (err) {
      console.error("❌ Error sending to backend:", err);
    }
  };

  const handleLogin = () => {
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          const userID = response.authResponse.userID;

          console.log("✅ Access Token:", accessToken);
          console.log("✅ User ID:", userID);

          sendTokenToBackend(accessToken, userID);
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      {
        scope: "public_profile",
      }
    );
  };

  return (
    <main className="min-h-screen">
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login with Facebook
      </button>
    </main>
  );
}
