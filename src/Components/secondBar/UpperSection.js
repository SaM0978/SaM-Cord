"use client";
import React, { useState, useEffect } from "react";
import { useGlobal } from "../../app/Context/store";
import { User, Mic, Hash, Plus } from "lucide-react";
import Modal from "../modal/modal";
import fetchApi from "../../_api_/fetch";
import { Settings } from "lucide-react";
import { Divider } from "./LowerSection";

export function UpperSection({ channel, isChat }) {
  const [chats, setChats] = useState([]);
  const [settingToggle, setSettingToggle] = useState(false);
  const [addChatModalOpen, setaddChatModalOpen] = useState(false);
  const [chatToggle, setChatToggle] = useState(false);
  const [rotateSetting, setRotateSetting] = useState(false);
  let { user, setDirectChatId, setDirectChatName, setUser } = useGlobal();

  // Fetch users from the server when the component mounts
  useEffect(() => {
    if (isChat) {
      fetchChats();
    }
  }, []);

  // Function to fetch users from the server
  const fetchChats = async () => {
    try {
      const response = await fetchApi(
        "directChat/getchats",
        "POST",
        null,
        true
      );
      setChats(response);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  // Function to handle adding a user
  const addUser = async ({ chatName, recipientuserName }) => {
    await fetchApi(
      "directChat/create",
      "POST",
      { chatName, recipientuserName },
      true
    );
  };

  async function updateChat({ chatName }, chatId) {
    await fetchApi(
      "directChat/update",
      "POST",
      { newChatName: chatName, id: chatId },
      true
    );
  }

  return (
    <div id="upper" className="border-gray-300 mt-2 p-2">
      <form>
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-gray-800 px-4 py-2 border border-gray-300 rounded-md outline-none text-white focus-within:shadow-lg"
        />
      </form>
      <Divider />
      {channel.isChannel ? (
        <UpperItems channel={channel} />
      ) : (
        <div className="flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gray-800">
            <div id="channelInfo" className="flex items-center">
              <h3 className="text-white text-lg font-bold mr-4">
                {channel.channelName || user?.username || "ERROR"}
              </h3>
            </div>

            <div>
              <Settings
                size={30}
                color="white"
                className={`transition-all duration-300 cursor-pointer rotate-${
                  settingToggle ? "360deg" : "0deg"
                }`}
                onClick={() => setSettingToggle(true)}
              />
              <Modal
                isOpen={settingToggle}
                model="user"
                onClose={() => setSettingToggle(false)}
                modalName="User Settings"
                fields={[
                  {
                    name: "username",
                    placeholder: "Enter Username",
                    value: user?.username,
                  },
                  {
                    name: "email",
                    placeholder: "Enter Email",
                    value: user?.email,
                  },
                ]}
                onFormSubmit={async ({ username, email, password }) => {
                  let response = await fetchApi(
                    "auth/update",
                    "POST",
                    { username, email, password },
                    true
                  );
                  localStorage.setItem("auth-token", response.authToken);
                  setUser(response.user);
                }}
              />
            </div>
          </div>
          <Divider />
          <div className="flex justify-end">
            <Plus
              size={20}
              color="white"
              onClick={() => setaddChatModalOpen(true)}
            />
            <Modal
              isOpen={addChatModalOpen}
              model="directChat"
              onClose={() => setaddChatModalOpen(false)}
              modalName="Add Direct Chat"
              fields={[
                { name: "chatName", placeholder: "Enter Chat Name" },
                { name: "recipientuserName", placeholder: "Enter User Name" },
              ]}
              onFormSubmit={addUser}
            />
          </div>
          {chats &&
            chats.map((chat) => (
              <div
                key={chat.id}
                className="my-2 px-2 py-1 flex bg-gray-900 rounded-md items-center cursor-pointer justify-end"
              >
                <span
                  className="flex items-center"
                  onClick={() => {
                    setDirectChatId(chat.id);
                    setDirectChatName(chat.chatName);
                  }}
                >
                  <User
                    size={38}
                    strokeWidth={1.5}
                    className="rounded-2xl bg-navbar"
                    color="#fff"
                  />
                  <span className="ml-2 text-white">{chat.chatName}</span>
                </span>
                <span className="ml-auto">
                  <Settings
                    size={28}
                    color="white"
                    onClick={() => {
                      setChatToggle(true), setRotateSetting(!rotateSetting);
                    }}
                    className={`transition-all duration-300 ease-in-out rotate-[${
                      rotateSetting ? "180deg" : "0deg"
                    }]`}
                  />
                </span>
                <Modal
                  isOpen={chatToggle}
                  model="directChat"
                  onClose={() => setChatToggle(false)}
                  modalName="Direct Chat Settings"
                  fields={[
                    {
                      name: "chatName",
                      placeholder: "Enter Chat Name",
                      value: chat.chatName,
                    },
                  ]}
                  onFormSubmit={(formValues) => updateChat(formValues, chat.id)}
                  deletingValue={chat.id}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function UpperItems({ channel }) {
  const { setSubChannelId, setSubChannelName, user } = useGlobal();
  const [modalOpen, setModalOpen] = useState(false);
  const voiceChannels = channel.subChannels.filter(
    (channelElement) => channelElement.type === "voice"
  );
  const textChannels = channel.subChannels.filter(
    (channelElement) => channelElement.type === "text"
  );

  return (
    <div className="flex flex-col">
      <ChannelInformation />
      <Divider></Divider>
      {channel.isChannel && (
        <>
          <div className="flex justify-end">
            {channel.createdById == user.id && (
              <Plus
                size={20}
                color="white"
                onClick={() => setModalOpen(true)}
              />
            )}
          </div>
          {textChannels.map((channel, index) => (
            <React.Fragment key={index}>
              <div>
                <UpperItem
                  channel={channel}
                  onClickFunction={() => {
                    setSubChannelId(channel.id);
                    setSubChannelName(channel.name);
                  }}
                />
              </div>
            </React.Fragment>
          ))}
          <Divider />
          <div className="flex justify-end">
            {channel.createdById == user.id && (
              <Plus
                size={20}
                color="white"
                onClick={() => setModalOpen(true)}
              />
            )}
          </div>
          {voiceChannels.map((channel, index) => (
            <React.Fragment key={index}>
              <div>
                <UpperItem
                  channel={channel}
                  onClickFunction={() => {
                    setSubChannelId(channel.id);
                    setSubChannelName(channel.name);
                  }}
                />
              </div>
            </React.Fragment>
          ))}
        </>
      )}
      {!channel.isChannel && (
        <div className="my-2 px-2 py-1 flex bg-gray-900 rounded-md items-center cursor-pointer">
          <User
            size={38}
            strokeWidth={1.5}
            className="rounded-2xl bg-navbar"
            color="#fff"
          />
          <span className="ml-2 text-white">User 1</span>
        </div>
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        modalName="Add Sub Channel"
        fields={[
          { name: "name", placeholder: "Enter Name" },
          {
            name: "type",
            placeholder: "Select Type",
            type: "select",
            options: ["text", "voice"],
          },
          { name: "description", placeholder: "Enter Description" },
        ]}
        onFormSubmit={async ({ description, name, type }) => {
          await fetchApi(
            "channel/sub/create",
            "POST",
            {
              subChannelName: name,
              type,
              description,
              channelId: channel.channelId,
            },
            true
          );
        }}
      />
    </div>
  );
}
function UpperItem({ channel, mainUser, onClickFunction }) {
  const [rotate, setRotate] = useState(true);
  const [secondModalOpen, setSecondModalOpen] = useState(false);
  const { channelToSet, user, channelId } = useGlobal();

  const handleSettingsClick = () => {
    setRotate(!rotate);
    setSecondModalOpen(true);
  };

  async function updateSubChannel({ name, description, type }) {
    await fetchApi(
      "channel/sub/update",
      "POST",
      {
        name,
        description,
        channelId,
        type,
        subChannelId: channel.id,
      },
      true
    );
  }

  return (
    <div className="my-2 px-2 py-1 flex bg-gray-800 rounded-md items-center cursor-pointer">
      {mainUser && (
        <>
          <User
            size={38}
            strokeWidth={1.5}
            className="rounded-2xl bg-navbar"
            color="#fff"
          />
          <span className="ml-2 text-white">{mainUser.username}</span>
        </>
      )}
      {channel && (
        <>
          <div className="flex w-full justify-between items-center">
            <span
              className="flex mr-auto items-center"
              onClick={onClickFunction}
            >
              {channel.type === "text" ? (
                <Hash
                  size={38}
                  strokeWidth={1.5}
                  className="rounded-2xl "
                  color="#fff"
                />
              ) : (
                <Mic
                  size={38}
                  strokeWidth={1.5}
                  className="rounded-2xl "
                  color="#fff"
                />
              )}
              <span className="ml-2 text-gray-400 font-bold">
                {channel.name}
              </span>
            </span>
            {channelToSet.createdById == user.id && (
              <span>
                <Settings
                  size={28}
                  color="white"
                  onClick={handleSettingsClick}
                  className={`transition-all duration-150 ease-in-out ${
                    rotate ? "rotate-[180deg]" : ""
                  }`}
                />
              </span>
            )}
          </div>
          <Modal
            isOpen={secondModalOpen}
            onClose={() => setSecondModalOpen(false)}
            modalName="Sub Channel Settings"
            fields={[
              { name: "name", value: channel.name },
              {
                name: "type",
                placeholder: "Select Type",
                type: "select",
                options: ["Text", "Voice"],
                value: channel.type,
              },
              {
                name: "description",
                placeholder: "Enter Description",
                value: channel.description,
              },
            ]}
            onFormSubmit={updateSubChannel}
          />
        </>
      )}
    </div>
  );
}
function ChannelInformation() {
  const { channelToSet, user, channelId } = useGlobal();
  const [settingToggle, setSettingToggle] = useState(false);
  const [showTip, setShowTip] = useState(false); // State to control tip visibility

  if (!channelToSet) {
    return null; // or display a loading spinner
  }

  async function channelUpdate({
    channelName,
    description,
    category,
    isPublic,
  }) {
    await fetchApi(
      "channel/update",
      "POST",
      {
        channelName,
        description,
        channelId,
        category,
        isPublic,
      },
      true
    );
  }

  const copyToClipBoard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setShowTip(true); // Show the tip when channel name is clicked
    setTimeout(() => {
      setShowTip(false); // Hide the tip after a certain time (e.g., 3 seconds)
    }, 3000);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-800">
      <div
        id="channelInfo"
        className="flex items-center cursor-pointer"
        onClick={() => copyToClipBoard(channelToSet.id)}
      >
        <h3 className="text-white text-lg font-bold mr-4">
          {channelToSet.channelName}
        </h3>
      </div>
      {/* Render the tip if showTip is true */}
      {channelToSet.createdById === user.id && (
        <div>
          <Settings
            size={30}
            color="white"
            className={`transition-all duration-300 cursor-pointer rotate-${
              settingToggle ? "360deg" : "0deg"
            }`}
            onClick={() => setSettingToggle(true)}
          />
          <Modal
            isOpen={settingToggle}
            model="channel"
            onClose={() => setSettingToggle(false)}
            modalName="Channel Settings"
            fields={[
              {
                name: "channelName",
                placeholder: "Enter Channel Name",
                value: channelToSet.channelName,
              },
              {
                name: "category",
                placeholder: "Category",
                value: channelToSet.category,
              },
              {
                name: "description",
                placeholder: "Enter Channel Description",
                value: channelToSet.description,
              },
              {
                name: "isPublic",
                placeholder: "Is Public",
                type: "select",
                options: ["true", "false"],
                value: channelToSet.isPublic,
              },
            ]}
            onFormSubmit={channelUpdate}
          />
        </div>
      )}
    </div>
  );
}
