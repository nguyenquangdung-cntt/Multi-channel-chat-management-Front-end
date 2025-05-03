"use client";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

type User = { id: string; name: string };
type Message = { from: "user" | "bot"; text: string };
type Messages = { [userId: string]: Message[] };
type Page = { id: string; name: string };

const initialMessages: Messages = {};

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Messages>(initialMessages);
  const [input, setInput] = useState("");
  const [userID, setUserID] = useState("111111111111");
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageStatus, setMessageStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showStatusIndex, setShowStatusIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedPages = localStorage.getItem("fb_pages");
    const storedUser = localStorage.getItem("fb_user");

    if (storedPages) {
      const parsedPages = JSON.parse(storedPages);
      setPages(parsedPages);
      setSelectedPage(parsedPages[0] || null);
    }

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserID(user.id);
    }
  }, []);

  useEffect(() => {
    const fetchSenders = async () => {
      if (!userID || !selectedPage) return;
      setLoadingUsers(true);
      setLoadingMessages(true);

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/facebook-auth/${userID}/${selectedPage.id}/senders`);
        const data = await res.json();

        const fanpageId = selectedPage.id;
        const newUsers: User[] = [];
        const newMessages: Messages = {};

        for (const convo of data) {
          const msgs = convo.messages || [];
          const userMsg = msgs.find((msg: any) => msg.from?.id !== fanpageId);
          if (userMsg && userMsg.from?.id) {
            const userId = userMsg.from.id;
            const userName = userMsg.from.name || `User ${userId}`;
            if (!newUsers.find((u) => u.id === userId)) {
              newUsers.push({ id: userId, name: userName });
              newMessages[userId] = msgs.map((m: any) => ({
                from: m.from?.id === fanpageId ? "bot" : "user",
                text: m.message || "",
              }));
            }
          }
        }

        setUsers(newUsers);
        setMessages(newMessages);
        setSelectedUser(newUsers[0] || null);
      } catch (error) {
        console.error("Failed to fetch senders with messages:", error);
      } finally {
        setLoadingUsers(false);
        setTimeout(() => setLoadingMessages(false), 500);
      }
    };

    fetchSenders();
  }, [selectedPage, userID]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setLoadingMessages(true);
    setTimeout(() => {
      setLoadingMessages(false);
    }, 500);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedPage || !selectedUser) return;
  
    const userMessage: Message = { from: "bot", text: input };
  
    setMessages((prev) => {
      const updated = {
        ...prev,
        [selectedUser.id]: [userMessage, ...(prev[selectedUser.id] || [])],
      };
      return updated;
    });
  
    setInput("");
    setMessageStatus("sending");
    setShowStatusIndex(0);
  
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${API_URL}/api/facebook-auth/${userID}/${selectedPage.id}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientID: selectedUser.id,
          message: userMessage.text,
        }),
      });
  
      setMessageStatus("sent");
      setTimeout(() => {
        setShowStatusIndex(null);
        setMessageStatus("idle");
      }, 5000);
    } catch (err: any) {
      console.error("Gửi tin nhắn thất bại:", err.message);
      setMessageStatus("error");
      setTimeout(() => {
        setShowStatusIndex(null);
        setMessageStatus("idle");
      }, 5000);
    }
  };
  

  const handleTyping = () => {
    if (!isTyping) setIsTyping(true);
    clearTimeout((handleTyping as any).typingTimeout);
    (handleTyping as any).typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    if (selectedUser && messages[selectedUser.id]) {
      scrollToBottom();
    }
  }, [messages, selectedUser]);  

  return (
    <div id="content-chat" className="w-screen h-screen flex flex-col sm:flex-row">
      {/* 📌 Mobile: Dropdown + User List (hiển thị trên mobile) */}
      <div className="w-full p-4 bg-gray-100 sm:hidden">
        {pages.length > 0 && (
          <select
            value={selectedPage?.id || ""}
            onChange={(e) => {
              const page = pages.find((p) => p.id === e.target.value);
              setSelectedPage(page || null);
            }}
            className="w-full h-10 bg-white border border-gray-300 rounded text-sm px-2"
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>{page.name}</option>
            ))}
          </select>
        )}

        {/* Danh sách User */}
        <div className="overflow-y-auto mt-4">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`p-2 rounded cursor-pointer ${
                selectedUser?.id === user.id ? "bg-blue-700 text-white" : "hover:bg-blue-200"
              }`}
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>

      {/* 📌 Desktop: Sidebar (hiển thị khi màn hình lớn hơn 426px) */}
      <aside className="hidden sm:flex w-64 bg-gray-100 p-4 space-y-2 overflow-y-auto">
        {pages.length > 0 && (
          <div className="sticky top-0 bg-gray-100 pb-2 z-10">
            <select
              value={selectedPage?.id || ""}
              onChange={(e) => {
                const page = pages.find((p) => p.id === e.target.value);
                setSelectedPage(page || null);
              }}
              className="bg-white border border-gray-300 rounded text-sm h-10 px-2 w-full"
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>{page.name}</option>
              ))}
            </select>
          </div>
        )}

        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className={`p-2 px-4 rounded cursor-pointer ${
              selectedUser?.id === user.id ? "bg-blue-700 text-white" : "hover:bg-blue-200"
            }`}
          >
            {user.name}
          </div>
        ))}
      </aside>

      {/* Ô Chat (hiển thị khi User được chọn) */}
      {selectedUser && (
        <main className="flex-1 flex flex-col bg-white">
          <div className="p-4 font-semibold text-lg bg-blue-700 text-white">
            {selectedUser.name}
          </div>

          <div className="flex-1 h-0 p-4 overflow-y-auto bg-gray-50">
            <div ref={messagesEndRef} />
            {messages[selectedUser.id]?.map((msg: Message, idx: number) => (
              <div key={idx} className={`px-4 py-2 rounded max-w-[80%] break-words ${msg.from === "user" ? "bg-gray-200" : "bg-blue-500 text-white"} my-1`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-4 flex items-center gap-2 bg-white">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded bg-gray-100 h-10"
            />
            <button
              onClick={handleSend}
              className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-900 transition"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
