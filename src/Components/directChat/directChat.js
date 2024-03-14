"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { User, Pencil, Trash2 } from "lucide-react";
import { convertTimestampToText } from "./utils";
import { useGlobal } from "../../app/Context/store";
import { useSocket } from "../../app/Context/socket";

export default function DirectChat() {
  const [messages, setMessages] = useState([]);
  const { directChatId, user, directChatName } = useGlobal();
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const handleInitialMessages = useCallback((initialMessages) => {
    setMessages(initialMessages);
    scrollToBottom();
  }, []);

  const handleChatMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (!socket) return;
    // if (!directChatId) return;

    socket.emit("initial-direct-messages", directChatId);
    socket.on("initial-direct-messages", handleInitialMessages);

    scrollToBottom();
    return () => {
      socket.off("initial-direct-messages", handleInitialMessages);
    };
  }, [directChatId, socket, handleInitialMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("direct-chat-message", handleChatMessage);

    return () => {
      socket.off("direct-chat-message", handleChatMessage);
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
    e.target.message.value = "";
    socket.emit("send-direct-message", content, directChatId, user.id);
    scrollToBottom();
  };

  return (
    <div className="main-chat h-screen flex flex-col bg-navbar">
      <h1 className="text-center text-white text-3xl p-4 bg-black">
        {directChatName}
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
function Message({ message, messages, setMessages }) {
  const [profile, setProfile] = useState("");
  const [showMessageSetting, setShowMessageSetting] = useState(false);
  const [messageContent, setMessageContent] = useState(message.content);
  const [color, setColor] = useState("red");
  const ref = useRef(null);
  const { user } = useGlobal();

  useEffect(() => {
    if (message.senderId === user.id) setColor("#00FF00");
    const fetchProfile = async () => {
      let defaultProfileImage = "";
      try {
        // const response = await getProfile(message.writtenBy.id);
        setProfile(
          `${message.sender.profilePicture.renderHead},${Buffer.from(
            message.sender.profilePicture.base64
          ).toString("base64")}`
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(defaultProfileImage);
      }
    };

    fetchProfile();
  }, [message.senderId]);

  return (
    <section
      className={`flex bg-zinc-800 px-2 py-2 items-center`}
      onMouseEnter={() => {
        if (message.senderId === user.id) setShowMessageSetting(true);
      }}
      onMouseLeave={() => {
        if (message.senderId === user.id) setShowMessageSetting(false);
      }}
    >
      <img
        loading="lazy"
        src={profile}
        alt={message.sender ? message.sender.username : "Unknown"}
        className="rounded-full py-1 profile-img"
      />
      <div className="flex flex-col justify-center self-start mt-[2px] p-2">
        <div className="flex space-x-2 items-center">
          <p className={`text-sm`} style={{ color: color }}>
            {message.sender.username || "RANDOM"}
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

function Divider() {
  return <div className="w-full h-px bg-gray-700 dark:bg-gray-400" />;
}

function DropdownMenu({ setter, contentRef, message, messages, setMessages }) {
  const handleOptionClick = async (option) => {
    // Implement the functionality for each option
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
        {/* <span className="mr-2">Edit</span> */}
        <Pencil size={20} />
      </button>
      <button
        className="flex items-center p-2  rounded-md text-white"
        onClick={() => handleOptionClick("Delete")}
      >
        {/* <span className="mr-2">Delete</span> */}
        <Trash2 size={20} />
      </button>
    </div>
  );
}
