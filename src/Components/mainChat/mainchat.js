"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useGlobal } from "../../app/Context/store";
import { useSocket } from "../../app/Context/socket";
import { Trash2, Pencil } from "lucide-react";
import { convertTimestampToText } from "./utils";
import getProfile from "@/_api_/profile";
import fetchApi from "@/_api_/fetch";

/**
 * MainChat component for rendering the main chat interface
 */
export default function MainChat() {
  const [messages, setMessages] = useState([]); // State to hold messages
  const { subChannelId, user, subChannelName } = useGlobal(); // Global context variables
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom
  const socket = useSocket(); // Socket for real-time updates

  // Function to handle initial messages received from the server
  const handleInitialMessages = useCallback((initialMessages) => {
    setMessages(initialMessages);
    scrollToBottom();
  }, []);

  // Function to handle incoming chat messages
  const handleChatMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    scrollToBottom();
  }, []);

  // Effect to subscribe to initial messages when component mounts
  useEffect(() => {
    if (!socket) return;

    scrollToBottom();

    socket.emit("initial-subchannel-messages", subChannelId);
    socket.on("initial-subchannel-messages", handleInitialMessages);

    return () => {
      socket.off("initial-subchannel-messages", handleInitialMessages);
    };
  }, [subChannelId, socket, handleInitialMessages]);

  // Effect to subscribe to chat messages when component mounts
  useEffect(() => {
    if (!socket) return;

    socket.on("subchannel-chat-message", handleChatMessage);

    return () => {
      socket.off("subchannel-chat-message", handleChatMessage);
    };
  }, [socket, handleChatMessage]);

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    const content = e.target.message.value;
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
          <div key={message.id}>
            <Message
              message={message}
              messages={messages}
              setMessages={setMessages}
            />
            <Divider />
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

/**
 * Message component for rendering each individual message
 */
function Message({ message, messages, setMessages }) {
  const [profile, setProfile] = useState(""); // State for profile image
  const [showMessageSetting, setShowMessageSetting] = useState(false); // State for showing message settings
  const [messageContent, setMessageContent] = useState(message.content); // State for message content
  const [color, setColor] = useState("red"); // State for text color
  const ref = useRef(null); // Ref for message content
  const { user } = useGlobal(); // Global context variables

  // Effect to fetch user profile image
  useEffect(() => {
    if (message.writtenBy.id === user.id) setColor("#00FF00");
    const fetchProfile = async () => {
      let defaultProfileImage = "";
      try {
        setProfile(
          `${message.writtenBy.profilePicture.renderHead},${Buffer.from(
            message.writtenBy.profilePicture.base64
          ).toString("base64")}`
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(defaultProfileImage);
      }
    };

    fetchProfile();
  }, [message.writtenBy.id]);

  return (
    <section
      className={`flex bg-zinc-800 px-2 py-2 items-center`}
      onMouseEnter={() => {
        if (message.writtenBy.id === user.id) setShowMessageSetting(true);
      }}
      onMouseLeave={() => {
        if (message.writtenBy.id === user.id) setShowMessageSetting(false);
      }}
    >
      <img
        loading="lazy"
        src={profile}
        alt={message.writtenBy ? message.writtenBy.username : "Unknown"}
        className="rounded-full py-1 profile-img"
      />
      <div className="flex flex-col justify-center self-start mt-[2px] p-2">
        <div className="flex space-x-2 items-center">
          <p className="text-sm" style={{ color: color }}>
            {message.writtenBy.username || "RANDOM"}
          </p>
          <p
            style={{
              color: "#9B9B9B",
              fontSize: "12px",
              position: "relative",
              top: "1px",
            }}
          >
            {convertTimestampToText(message.createdAt)}
          </p>
        </div>
        <p
          className=" text-sm text-neutral-200"
          style={{ color: "#E6E6E6" }}
          ref={ref}
        >
          {messageContent}
        </p>
      </div>
      {showMessageSetting && (
        <DropdownMenu
          setter={setMessageContent}
          contentRef={ref}
          message={message}
          messages={messages}
          setMessages={setMessages}
        />
      )}
    </section>
  );
}

/**
 * Divider component for rendering message divider
 */
function Divider() {
  return <div className="w-full h-px bg-gray-700 dark:bg-gray-400" />;
}

/**
 * DropdownMenu component for rendering message options dropdown
 */
function DropdownMenu({ setter, contentRef, message, messages, setMessages }) {
  const handleOptionClick = async (option) => {
    switch (option) {
      case "Edit":
        contentRef.current.contentEditable = true;
        contentRef.current.focus();
        contentRef.current.addEventListener("blur", () => {
          contentRef.current.contentEditable = false;
          setter(contentRef.current.textContent);
          fetchApi(
            "channel/sub/message/update",
            "POST",
            {
              messageId: message.id,
              content: contentRef.current.textContent,
            },
            true
          ).then((e) => e);
        });
        break;
      case "Delete":
        let newMessages = messages.filter((msg) => msg.id !== message.id);
        setMessages(newMessages);
        await fetchApi(
          "channel/sub/message/delete",
          "POST",
          { messageId: message.id },
          true
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-md flex ml-auto">
      <button
        className="flex items-center p-2  rounded-md text-white"
        onClick={() => handleOptionClick("Edit")}
      >
        <Pencil size={20} />
      </button>
      <button
        className="flex items-center p-2  rounded-md text-white"
        onClick={() => handleOptionClick("Delete")}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
