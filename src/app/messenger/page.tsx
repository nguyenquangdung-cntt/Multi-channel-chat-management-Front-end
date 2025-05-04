"use client";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import slide1 from "../../../public/images/slide-1.png";
import slide2 from "../../../public/images/slide-2.png";
import slide3 from "../../../public/images/slide-3.png";


type User = { id: string; name: string };
type Message = { from: "user" | "bot"; text: string; pending?: boolean; error?: boolean };
type Messages = { [userId: string]: Message[] };
type Page = { id: string; name: string };

const initialMessages: Messages = {};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to check login status
  const checkLogin = () => {
    const storedUser = localStorage.getItem("fb_user");
    setIsLoggedIn(!!storedUser);
  };

  useEffect(() => {
    checkLogin();
  }, []);

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorUserId, setErrorUserId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!selectedPage) return;

    if (!socketRef.current) {
      socketRef.current = io(API_URL);
    }

    // Join room theo pageID
    socketRef.current.emit("join_page", selectedPage.id);

    // Lắng nghe sự kiện new_message
    const handleNewMessage = (data: any) => {
      console.log("New message received:", data); // Debug log
      if (data.pageID !== selectedPage.id) return;

      setMessages((prev) => {
        const arr = prev[data.recipientID] || [];
        // Tránh duplicate tin nhắn
        if (arr[0] && arr[0].text === data.message && arr[0].from === data.from) {
          return prev;
        }
        return {
          ...prev,
          [data.recipientID]: [
            { from: data.from, text: data.message },
            ...arr,
          ],
        };
      });

      // Tự động cuộn xuống cuối nếu đang xem đúng user
      if (selectedUser?.id === data.recipientID) {
        scrollToBottom();
      }
    };

    // Lắng nghe sự kiện update_conversations
    const handleUpdateConversations = async (data: any) => {
      if (data.pageID !== selectedPage?.id) return;

      try {
        const res = await fetch(`${API_URL}/api/facebook-auth/${userID}/${selectedPage.id}/senders`);
        const updatedData = await res.json();

        const fanpageId = selectedPage.id;
        const newMessages: Messages = {};

        for (const convo of updatedData) {
          const msgs = convo.messages || [];
          const userMsg = msgs.find((msg: any) => msg.from?.id !== fanpageId);
          if (userMsg && userMsg.from?.id) {
            const userId = userMsg.from.id;
            newMessages[userId] = msgs.map((m: any) => ({
              from: m.from?.id === fanpageId ? "bot" : "user",
              text: m.message || "",
            }));
          }
        }

        // Merge new messages with existing ones
        setMessages((prev) => {
          const mergedMessages = { ...prev };
          for (const userId in newMessages) {
            mergedMessages[userId] = [
              ...(prev[userId] || []),
              ...newMessages[userId].filter(
                (newMsg) => !(prev[userId] || []).some((oldMsg) => oldMsg.text === newMsg.text)
              ),
            ];
          }
          return mergedMessages;
        });
      } catch (error) {
        console.error("Failed to update conversations:", error);
      }
    };

    socketRef.current.on("new_message", handleNewMessage);
    socketRef.current.on("update_conversations", handleUpdateConversations);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("new_message", handleNewMessage);
        socketRef.current.off("update_conversations", handleUpdateConversations);
      }
    };
  }, [selectedPage, selectedUser]);

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

  const handleSelectUserMobile = (user: User) => {
    setSelectedUser(user);
    setLoadingMessages(true);
    setTimeout(() => {
      setLoadingMessages(false);
    }, 500);
    setIsModalOpen(true);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedPage || !selectedUser) return;

    const userMessage: Message = { from: "bot", text: input };

    // Add the message to the UI immediately and mark it as "pending"
    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [
        { ...userMessage, pending: true }, // Add a pending flag
        ...(prev[selectedUser.id] || []),
      ],
    }));

    setInput("");
    setMessageStatus("sending");
    setShowStatusIndex(0);

    try {
      const res = await fetch(`${API_URL}/api/facebook-auth/${userID}/${selectedPage.id}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientID: selectedUser.id,
          message: userMessage.text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isOutside24hWindow) {
          setErrorMessage(
            "Tin nhắn này được gửi ngoài khoảng thời gian cho phép (24h) và không thể gửi. Vui lòng yêu cầu người dùng nhắn tin trước."
          );
          setErrorUserId(selectedUser.id);
        } else {
          alert("❗ Gửi tin nhắn thất bại: " + (data.error || "Lỗi không xác định"));
        }
        setMessageStatus("error");

        // Update the message to indicate an error
        setMessages((prev) => ({
          ...prev,
          [selectedUser.id]: prev[selectedUser.id].map((msg) =>
            msg.text === userMessage.text && msg.pending
              ? { ...msg, pending: false, error: true }
              : msg
          ),
        }));
      } else {
        setMessageStatus("sent");

        // Update the message to remove the "pending" flag
        setMessages((prev) => ({
          ...prev,
          [selectedUser.id]: prev[selectedUser.id].map((msg) =>
            msg.text === userMessage.text && msg.pending
              ? { ...msg, pending: false }
              : msg
          ),
        }));
      }
    } catch (err: any) {
      console.error("Gửi tin nhắn thất bại:", err.message);
      setMessageStatus("error");

      // Update the message to indicate an error
      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: prev[selectedUser.id].map((msg) =>
          msg.text === userMessage.text && msg.pending
            ? { ...msg, pending: false, error: true }
            : msg
        ),
      }));
    } finally {
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
    <div id="content-chat" className="flex sm:h-[1180px] h-screen w-full">
      {isLoggedIn ? (
        <>
          {/* 📌 Mobile: Dropdown + User List */}
          <div className="w-full h-screen bg-gray-100 sm:hidden">
            <div className="h-[70px]"></div>
            <div className="px-4">
              {pages.length > 0 && (
                <select
                  value={selectedPage?.id || ""}
                  onChange={(e) => {
                    const page = pages.find((p) => p.id === e.target.value);
                    setSelectedPage(page || null);
                  }}
                  className="w-full h-10 bg-white border border-gray-300 text-sm px-2"
                >
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>{page.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Danh sách User */}
            <div className="overflow-y-auto mt-4">
              {loadingUsers ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="h-screen bg-gray-300 animate-pulse"></div>
                ))
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUserMobile(user)}
                    className="p-4 cursor-pointer hover:bg-blue-200 border border-gray-300"
                  >
                    {user.name}
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50 mt-[]">
              <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg flex flex-col h-screen pt-[30px]">
                
                {/* Header Modal - Luôn cố định trên cùng */}
                <div className="p-4 font-semibold text-lg bg-blue-700 text-white flex justify-between items-center flex-none">
                  <span>{selectedUser?.name || "Messenger"}</span>
                  <button onClick={() => setIsModalOpen(false)} className="text-white text-2xl hover:text-red-400 transition">
                    ✕
                  </button>
                </div>

                {/* Nội dung Chat - Chỉ phần này được scroll */}
                <div className="flex-1 h-0 p-4 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2 bg-gray-50 pb-[50px]">
                  {selectedUser?.id === errorUserId && errorMessage && (
                    <div className="text-red-600 text-sm mt-2 self-end">
                      ⚠️ {errorMessage}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
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
                          i % 2 === 0 ? "ml-auto bg-blue-200" : "mr-auto bg-gray-300"
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
                    
                        {msg.from === "bot" && showStatusIndex === idx && (
                          <span className="text-xs text-gray-500 mt-1">
                            {messageStatus === "sending" && "Đang gửi..."}
                            {messageStatus === "sent" && "Đã gửi"}
                            {messageStatus === "error" && "Tin nhắn không gửi được"}
                          </span>
                        )}
                      </div>
                    ))
                  ) : null}
                </div>

                {/* Ô nhập tin nhắn - Luôn cố định dưới */}
                <div className="p-4 flex items-center gap-2 bg-white border-t border-gray-300 flex-none sticky bottom-0 w-full max-w-3xl">
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

              </div>
            </div>
          )}     
        </>
      ) : (
        <div className="sm:hidden flex-1 flex items-center justify-center bg-gray-100">
          <div className="h-[70px]"></div>
          <p className="text-gray-500 text-lg">Please log in to access the chat.</p>
        </div>
      )}
      {isLoggedIn ? (
        <>
          {/* Sidebar */}
          <aside className="hidden sm:block w-64 bg-gray-100 p-4 space-y-2 overflow-y-auto">
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
          <main className="hidden sm:flex flex-1 flex-col bg-white">
            <div className="p-4 font-semibold text-lg bg-blue-700 text-white">
              {selectedUser?.name || "Messenger"}
            </div>

            <div className="flex-1 h-0 p-4 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2 bg-gray-50">
              {selectedUser?.id === errorUserId && errorMessage && (
                <div className="text-red-600 text-sm mt-2 self-end">
                  ⚠️ {errorMessage}
                </div>
              )}
              <div ref={messagesEndRef} />
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
                      i % 2 === 0 ? "ml-auto bg-blue-200" : "mr-auto bg-gray-300"
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
                    
                      {msg.from === "bot" && showStatusIndex === idx && (
                        <span className="text-xs text-gray-500 mt-1">
                          {messageStatus === "sending" && "Đang gửi..."}
                          {messageStatus === "sent" && "Đã gửi"}
                          {messageStatus === "error" && "Tin nhắn không gửi được"}
                        </span>
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
        </>
      ) : (
        <div className="hidden flex-1 sm:flex flex-col items-center justify-center bg-gray-100">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="w-[80%] max-w-md relative"
          >
            <SwiperSlide>
              <img src={slide1.src} alt="Hình 1" className="rounded-lg shadow-md w-full object-cover" />
            </SwiperSlide>
            <SwiperSlide>
              <img src={slide2.src} alt="Hình 2" className="rounded-lg shadow-md w-full object-cover" />
            </SwiperSlide>
            <SwiperSlide>
              <img src={slide3.src} alt="Hình 3" className="rounded-lg shadow-md w-full object-cover" />
            </SwiperSlide>

            {/* Nút điều hướng tùy chỉnh */}
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-800 text-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-600">
              ‹
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-800 text-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-600">
              ›
            </button>
          </Swiper>

          {/* Thông báo đăng nhập */}
          <p className="text-gray-500 text-lg mt-4">Please log in to access the chat.</p>
        </div>
      )}
    </div>
  );
}
