"use client";
import React, { useEffect } from "react";
import { UpperSection } from "./UpperSection";
import { LowerSection } from "./LowerSection";
import { useGlobal } from "@/app/Context/store";

export default function SecondBar({
  channel = { isChannel: false, subChannels: [], setChannel: () => {} },
  isChat = false,
}) {
  return (
    <div className="h-screen flex flex-col bg-bg justify-between">
      <div>
        <UpperSection channel={channel} isChat={isChat} />
      </div>
      <div>
        <LowerSection />
      </div>
    </div>
  );
}
