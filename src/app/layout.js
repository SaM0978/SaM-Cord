import { Inter } from "next/font/google";
import { GlobalContextProvider } from "./Context/store";
import { SocketProvider } from "./Context/socket";
import SideBar from "@/Components/sidebar/sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sam-Cord",
  description: "Discord-Rip-Off",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          <GlobalContextProvider>
            <div className="flex">
              <div>
                <SideBar />
              </div>
              {children}
            </div>
          </GlobalContextProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
