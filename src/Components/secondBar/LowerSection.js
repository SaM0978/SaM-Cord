"use client";
import React, { useState, useEffect } from "react";
import { useGlobal } from "../../app/Context/store";
import { Headset, User, Mic, Video } from "lucide-react";
import Modal from "../modal/modal";
import fetchApi from "@/_api_/fetch";
// import fs from "fs";

export function LowerSection() {
  return (
    <div className="bg-gray-800 text-white flex items-center  rounded-tr-lg  space-x-20 p-4">
      <div className="mr-auto">
        <UserInformation />
      </div>
      <div>
        <LowerItems />
      </div>
    </div>
  );
}
function UserInformation() {
  const { user, getLocalThing } = useGlobal();
  const [updateProfilePicture, setUpdateProfilePicture] = useState(false); // [profilePicture, setProfilePicture
  const [profileMODAL, setProfileMODAL] = useState(false);
  useEffect(() => {
    const picture = getLocalThing("picture");
    if (picture) {
      setProfilePicture(picture);
    }
  }, []);
  return (
    <div className="whole-lower">
      <div className="flex items-center">
        <div className="flex items-center justify-center bg-gray-600 w-10 h-10 mr-4 rounded-full">
          {user?.profilePicture && (
            <img
              onClick={() => {
                setProfileMODAL(true);
                setUpdateProfilePicture(true);
              }}
              src={`${user?.profilePicture.renderHead},${Buffer.from(
                user?.profilePicture.base64
              ).toString("base64")}`}
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
          )}

          <Modal
            modalName="Profile Picture"
            isOpen={profileMODAL}
            onClose={() => setProfileMODAL(false)}
            fields={[
              { name: "picture", type: "file", placeholder: "Upload Picture" },
            ]}
            giveFormData={true}
            onFormSubmit={async ({ picture }, ref) => {
              const reader = new FileReader();
              reader.onload = async function (event) {
                let data = event.target.result;
                await fetchApi(
                  `auth/${updateProfilePicture ? "profile/update" : "profile"}`,
                  "POST",
                  {
                    extras: {
                      filename: picture.name,
                      size: picture.size,
                      imageType: picture.type,
                    },
                    data,
                  },
                  true
                );
              };
              if (picture) {
                reader.readAsDataURL(picture);
              } else {
                ref.current.click();
              }
            }}
          ></Modal>
        </div>
        <div>
          <div className="text-sm font-semibold">{user?.username}</div>
          <div className="text-sm">Online</div>
        </div>
      </div>
    </div>
  );
}

export function Divider() {
  return (
    <div className="w-full h-px bg-gray-700 dark:bg-gray-400 my-[10px]"></div>
  );
}
function LowerItems() {
  return (
    <div className="flex space-x-2">
      <LowerItem icon={<Headset size={20} strokeWidth={1.5} />} />
      <LowerItem icon={<Mic size={20} strokeWidth={1.5} />} />
      <LowerItem icon={<Video size={20} strokeWidth={1.5} />} />
    </div>
  );
}
function LowerItem({ icon, onClick }) {
  const [closed, setClosed] = useState(false);

  const iconProps = { ...icon.props, color: closed ? "red" : "white" };

  return (
    <div
      className={`flex items-center rounded-xl bg-navbar p-2 cursor-pointer`}
      onClick={() => {
        setClosed(!closed);
      }}
    >
      {React.cloneElement(icon, iconProps)}
    </div>
  );
}
