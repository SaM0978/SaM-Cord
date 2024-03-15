"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import fetchApi from "@/_api_/fetch";
import Modal from "../modal/modal";
import { useGlobal } from "../../app/Context/store";
import { User, Flame, Plus, Merge } from "lucide-react";

export default function SideBar() {
  const [isFocused, setIsFocused] = useState(null);
  const { whereAt, setWhereAt, setUser } = useGlobal();
  const [sidebarItems, setSideBarItems] = useState([]);
  const [joinModal, setJoinModal] = useState(false);
  const [signUpModal, setSignUpModal] = useState(false);
  const [channelAdd, setChannelAdd] = useState(false);

  async function fetchChannels() {
    let response = await fetchApi("channel/joined", "POST", null, true);
    if (!Array.isArray(response)) {
      console.error("Invalid response:", response);
      return [];
    }

    const uniqueChannels = response.filter(
      (channel, index, self) =>
        index === self.findIndex((c) => c.id === channel.id)
    );

    const channelConversion = uniqueChannels.map((channel, index) => ({
      id: channel.id,
      icon: <Flame color="white" size={28} strokeWidth={1.5} />,
      redirection: channel.id,
      divider: index === uniqueChannels.length - 1 ? true : false,
    }));

    return channelConversion;
  }

  async function fetchUser() {
    try {
      if (localStorage.getItem("auth-token") === null) {
      } else {
        const userData = await fetchApi("auth/get", "POST", null, true);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  const handleClick = (id) => {
    setIsFocused(id === isFocused ? null : id);
    setWhereAt(id);
  };

  useEffect(() => {
    // Fetch user data on mount
    localStorage.getItem("auth-token")
      ? fetchUser().then(() => console.log("User data fetched"))
      : console.log("No user data fetched");

    // Fetch channels only when sidebarItems is empty (on mount)
    if (sidebarItems.length === 0) {
      fetchChannels().then((channels) => setSideBarItems(channels));
    }
  }, []); // Fetch channels only once on mount

  return (
    <>
      {
        <div
          id="SideBar"
          className="bg-navbar dark:bg-gray-900 shadow-lg w-16 top-0 left-0 h-screen flex flex-col items-center"
        >
          {/* Display user information */}
          {
            <React.Fragment>
              <Link href={`/`}>
                <SideBarItem
                  icon={<User size={28} strokeWidth={1.5} color="white" />}
                  id={"user"}
                  isFocused={whereAt === "user"}
                  onClick={() => handleClick("user")}
                />
              </Link>
            </React.Fragment>
          }

          {
            <React.Fragment>
              <SideBarItem
                icon={<Plus size={28} strokeWidth={1.5} color="white" />}
                id={"signup"}
                isFocused={whereAt === "signup"}
                onClick={() => {
                  handleClick("signup");
                  setSignUpModal(true);
                }}
              />
              <Modal
                isOpen={signUpModal}
                onClose={() => setSignUpModal(false)}
                modalName="Sign Up"
                model="user"
                fields={[
                  {
                    name: "username",
                    type: "text",
                    placeholder: "Enter Your Username",
                  },
                  {
                    name: "fullName",
                    type: "text",
                    placeholder: "Enter Your Full Name",
                  },
                  { name: "email", type: "email", placeholder: "Enter Email" },
                  {
                    name: "password",
                    type: "text",
                    placeholder: "Enter YourPassword",
                  },
                ]}
                onFormSubmit={async (formData) => {
                  let response = await fetchApi(
                    "auth/signup",
                    "POST",
                    formData,
                    false
                  );
                  localStorage.setItem("auth-token", response.authToken);
                  let response2 = await fetchApi(
                    "auth/get",
                    "POST",
                    null,
                    true
                  );
                  setUser(response2.user);
                }}
                IALLOWIT={true}
              />
            </React.Fragment>
          }

          {<div className="my-2 border-b border-gray-500"></div>}
          {/* Display channel links */}
          {sidebarItems.map((item) => (
            <React.Fragment key={item.id}>
              <Link href={`/channels/${item.redirection}`}>
                <SideBarItem
                  icon={item.icon}
                  id={item.id}
                  isFocused={whereAt === item.id}
                  onClick={() => handleClick(item.id)}
                />
              </Link>
              {item.divider && (
                <div className="my-2 border-b border-gray-500"></div>
              )}
            </React.Fragment>
          ))}

          {/* Display channelAdd button */}

          <SideBarItem
            icon={<Plus color="white" size={28} strokeWidth={1.5} />}
            id={"channelAdd"}
            isFocused={whereAt === "channelAdd"}
            onClick={() => {
              handleClick("channelAdd"), setChannelAdd(true);
            }}
          />

          <Modal
            fields={[
              {
                name: "channelName",
                type: "text",
                placeholder: "Enter The Channel Name",
              },
              {
                name: "description",
                type: "text",
                placeholder: "Enter The Channel Description",
              },
              {
                name: "isPublic",
                type: "select",
                options: ["true", "false"],
              },
              {
                name: "category",
                type: "select",
                options: [
                  "General",
                  "Technology",
                  "Science",
                  "Entertainment",
                  "Sports",
                  "Music",
                  "Gaming",
                  "Education",
                  "Health",
                  "News",
                  "Business",
                  "Food",
                  "Art",
                  "Travel",
                  "Fashion",
                  "Lifestyle",
                  "Other",
                ],
              },
            ]}
            isOpen={channelAdd}
            onClose={() => handleClick(setChannelAdd(false))}
            onFormSubmit={async (formData) => {
              await fetchApi("channel/create", "POST", formData, true);
              setSideBarItems(await fetchChannels());
            }}
          />

          {/* Display merge button */}
          <SideBarItem
            icon={<Merge color="white" size={28} strokeWidth={1.5} />}
            id={sidebarItems.length + 2}
            isFocused={whereAt === sidebarItems.length + 2}
            onClick={() => {
              handleClick(sidebarItems.length + 2);
              setJoinModal(true);
            }}
          />
          <Modal
            fields={[
              {
                name: "channelId",
                type: "text",
                placeholder: "Enter The Channel ID",
              },
            ]}
            isOpen={joinModal}
            onClose={() => setJoinModal(false)}
            onFormSubmit={async ({ channelId }) => {
              await fetchApi("channel/join", "POST", { channelId }, true);
            }}
          />
        </div>
      }
    </>
  );
}

function SideBarItem({ icon, isFocused, onClick }) {
  return (
    <div className="my-2 ml-[6px]" onClick={onClick}>
      <div
        className={`bg-gray-700 p-2 shadow-lg transition-all duration-500 
      hover:rounded-xl  rounded-3xl transition-ease-in-out ${
        isFocused ? "bg-item" : ""
      }`}
      >
        {icon}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-b border-gray-500"></div>;
}
