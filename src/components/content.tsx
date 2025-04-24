import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const mockUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const initialMessages = {
  1: [{ from: "bot", text: "Hello! How can I help you?" }],
  2: [{ from: "bot", text: "Hi! Need support?" }],
};

export default function ChatUI() {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Thêm tin nhắn vào đầu mảng (prepend)
    const updated = {
      ...messages,
      [selectedUser.id]: [
        { from: "user", text: input },
        ...(messages[selectedUser.id] || []),
      ],
    };

    setMessages(updated);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: [
          { from: "bot", text: "Got your message!" },
          ...prev[selectedUser.id],
        ],
      }));
    }, 1000);
  };

  return (
    <div id="content-chat" className="flex h-[1180px] w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 space-y-2">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-1.5 pr-12 border border-gray-300 rounded-full outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            className="absolute right-[3px] top-1/2 transform -translate-y-1/2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white text-sm" />
          </button>
        </div>

        {mockUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`p-2 px-4 rounded-r-[50px] cursor-pointer ${
              selectedUser.id === user.id
                ? "bg-blue-700 text-white"
                : "hover:bg-blue-200"
            }`}
          >
            {user.name}
          </div>
        ))}
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 font-semibold text-lg bg-blue-700 text-white">
          Chat with {selectedUser.name}
        </div>

        {/* Chat Content */}
        <div className="flex-1 h-0 p-4 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2 bg-gray-50">
          {(messages[selectedUser.id] || []).map((msg, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                msg.from === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 flex items-center gap-2 bg-white">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-[10px] outline-none bg-gray-100 h-[150px]"
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
