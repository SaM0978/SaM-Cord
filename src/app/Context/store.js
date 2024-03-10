"use client";

import { createContext, useContext, useState } from "react";

const GlobalContext = createContext({});

export const GlobalContextProvider = ({ children }) => {
  const [whereAt, setWhereAt] = useState("home");
  const [subChannelId, setSubChannelId] = useState(null);
  const [channelToSet, setChannel] = useState({});
  const [user, setUser] = useState({
    id: "#GuestUserId",
    username: "Guest",
    email: "GuestUser@gmail.com",
    password: "GuestPassword1234",
  });
  const [channelId, setChannelId] = useState(null);
  const [subChannelName, setSubChannelName] = useState(null);
  const [directChatId, setDirectChatId] = useState(null);
  const [directChatName, setDirectChatName] = useState(null);

  function getLocalThing(key) {
    return localStorage.getItem(key);
  }

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        whereAt,
        setWhereAt,
        subChannelId,
        setChannel,
        setSubChannelId,
        channelToSet,
        getLocalThing,
        channelId,
        setChannelId,
        subChannelName,
        setSubChannelName,
        directChatId,
        setDirectChatId,
        directChatName,
        setDirectChatName,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
