"use client";
import SecondBar from "../Components/secondBar/secondbar.js";
import { useGlobal } from "./Context/store";
import DirectChat from "@/Components/directChat/directChat.js";

export default function Home() {
  return (
    <>
      <div className="main flex">
        <div>
          <SecondBar isChat={true} />
        </div>
      </div>
      <div className="flex-1">
        <DirectChat />
      </div>
    </>
  );
}
