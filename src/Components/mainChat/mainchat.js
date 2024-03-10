"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { User } from "lucide-react";
import { useGlobal } from "../../app/Context/store";
import { useSocket } from "../../app/Context/socket";

export default function MainChat() {
  const [messages, setMessages] = useState([]);
  const { subChannelId, user, subChannelName } = useGlobal();
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const handleInitialMessages = useCallback((initialMessages) => {
    console.log(initialMessages);
    setMessages(initialMessages);
    scrollToBottom();
  }, []);

  const handleChatMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("initial-subchannel-messages", subChannelId);
    socket.on("initial-subchannel-messages", handleInitialMessages);

    scrollToBottom();
    return () => {
      socket.off("initial-subchannel-messages", handleInitialMessages);
    };
  }, [subChannelId, socket, handleInitialMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("subchannel-chat-message", handleChatMessage);

    return () => {
      socket.off("subchannel-chat-message", handleChatMessage);
    };
  }, [socket, handleChatMessage]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const content = e.target.message.value;
    console.log(content, subChannelId, user.id);
    e.target.message.value = "";
    socket.emit("send-subchannel-message", content, subChannelId, user.id);
    scrollToBottom();
  };

  return (
    <div className="main-chat h-screen flex flex-col bg-navbar">
      <h1 className="text-center text-white text-3xl p-4 bg-black">
        {subChannelName}
      </h1>

      <div className="chat-messages flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message p-3 flex items-center space-x-5 border-2  ${
              message.userId === user.id
                ? "bg-gray-600 border-gray-500"
                : "bg-blue-700 border-blue-300"
            }`}
          >
            <User size={35} strokeWidth={1.5} />
            <span className="content text-white rounded-md">
              {message.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Empty div to scroll to */}
      </div>
      <div className="chat-input flex">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            name="message"
            className="flex-1 px-4 my-2 mx-2 py-2 border rounded w-[70dvh] bg-gray-800 text-white outline-none focus-within:shadow-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-xl"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
