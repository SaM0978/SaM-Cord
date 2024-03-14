"use client";
import SideBar from "@/Components/sidebar/sidebar";
import SecondBar from "@/Components/secondBar/secondbar";
import MainChat from "@/Components/mainChat/mainchat";
import { fetchChannel } from "./_backend_channel";
import tokenCheck from "@/_api_/tokenCheck";
import { useState, useEffect } from "react";
import { useGlobal } from "@/app/Context/store";
import { useRouter } from "next/navigation";

export default function Channel({ params: { channelid } }) {
  const { channel, setChannel, setChannelId, user, setSubChannelId } =
    useGlobal();
  const [subChannels, setSubChannels] = useState([]);
  const [createdById, setCreatedById] = useState(null);
  const router = useRouter();

  async function finalizeChannel() {
    let response = await fetchChannel(channelid);
    setChannel(response);
    setChannelId(response.id);
    setCreatedById(response.createdById);
    response.subChannels && setSubChannels(response.subChannels);
  }

  useEffect(() => {
    tokenCheck(router, "/user/signup");
    finalizeChannel().catch((e) => console.error(e));
  }, [channelid]);

  // Log createdById after it's set
  useEffect(() => {}, [createdById, user.id]);

  return (
    <>
      <div className="main">
        <div>
          <SecondBar
            channel={{
              isChannel: true,
              subChannels: subChannels,
              channelId: channelid,
              createdById: createdById,
            }}
          />
        </div>
      </div>
      <div className="flex-1">
        <MainChat />
      </div>
    </>
  );
}
