import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import { Button } from "@/components/ui/button"; // ShadCN Button
import { IoMdCloseCircleOutline } from "react-icons/io";
import { LuToggleRight } from "react-icons/lu";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex md:scroll-m-0 m-0 ">
      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-50 bg-white transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0 lg:block`}
      >
        {/* Close Button (Visible only on mobile) */}
        <div className="lg:hidden pr-2 flex justify-end">
          <Button variant="ghost" onClick={closeSidebar}>
          <IoMdCloseCircleOutline />
          </Button>
        </div>
        <LeftSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Toggle Button (Only visible on mobile) */}
        <div className="lg:hidden p-2">
          <Button onClick={toggleSidebar} className="bg-gray-400 h-6 w-6">
            {isSidebarOpen ? "Close Sidebar" : <LuToggleRight className="bg-gray-600 size-10" />}
          </Button>
        </div>
        <Outlet className=""/>
      </div>

      {/* Overlay for Sidebar (on mobile screens) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={closeSidebar} // Close sidebar when clicking the backdrop
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
