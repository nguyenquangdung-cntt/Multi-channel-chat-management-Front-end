"use client";
import { useEffect, useState } from "react";
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
        setTimeout(() => setLoadingMessages(false), 500); // nhỏ delay để nhìn thấy loading
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
    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [userMessage, ...(prev[selectedUser.id] || [])],
    }));
  
    const currentMessage = input;
    setInput("");
  
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${API_URL}/api/facebook-auth/${userID}/${selectedPage.id}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientID: selectedUser.id,
          message: currentMessage,
        }),
      });
    } catch (err: any) {
      console.error("Gửi tin nhắn thất bại:", err.message);
    }
  };
  
  const handleTyping = () => {
    if (!isTyping) setIsTyping(true);
  
    // Tắt trạng thái typing sau 2 giây không gõ
    clearTimeout((handleTyping as any).typingTimeout);
    (handleTyping as any).typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };
  

  return (
    <div id="content-chat" className="flex h-[1180px] w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 space-y-2 overflow-y-auto">
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
                <option className="p-4" key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {loadingUsers ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded-md animate-pulse mb-2"></div>
          ))
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`p-2 px-4 rounded-r-[50px] cursor-pointer ${
                selectedUser?.id === user.id
                  ? "bg-blue-700 text-white"
                  : "hover:bg-blue-200"
              }`}
            >
              {user.name}
            </div>
          ))
        )}
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col bg-white">
        <div className="p-4 font-semibold text-lg bg-blue-700 text-white">
          {selectedUser?.name || "Messenger"}
        </div>

        <div className="flex-1 h-0 p-4 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2 bg-gray-50">
          {isTyping && (
            <div className="ml-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-2xl max-w-[80%]">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          {loadingMessages ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`px-4 py-2 rounded-2xl max-w-[80%] animate-pulse ${
                  i % 2 === 0
                    ? "ml-auto bg-blue-200"
                    : "mr-auto bg-gray-300"
                } h-[20px]`}
              />
            ))
          ) : selectedUser && messages[selectedUser.id] ? (
              messages[selectedUser.id].map((msg: Message, idx: number) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    msg.from === "bot" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl break-words ${
                      msg.from === "user"
                      ? "mr-auto bg-gray-200 text-gray-800"
                      : "ml-auto bg-blue-500 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.from === "bot" && (
                    <span className="text-xs text-gray-500 mt-1">Đã gửi</span>
                  )}
                </div>
              ))
            ) : null}
        </div>

        <div className="p-4 flex items-center gap-2 bg-white">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-[10px] outline-none bg-gray-100 h-[50px]"
          />
          <button
            onClick={handleSend}
            className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-900 transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </main>
    </div>
  );
}
