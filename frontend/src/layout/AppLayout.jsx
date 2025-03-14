import React from "react";
import { Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext"; 
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
// import AppSidebar from "./AppSidebar";

import Backdrop from "./Backdrop";
import AdminSidebar from "./AdminSidebar";
import SiteEngineerSidebar from "./SiteEngineerSidebar";
import SafetyEngineerSidebar from "./SafetyEngineerSidebar";

const LayoutContent = () => {
  const { user } = useUser(); // Access user context, which holds role info
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  console.log("User Role in LayoutContent:", user?.role); // Debugging log

  let SidebarComponent;

  // Adjust based on user role
  const role = user?.role?.toLowerCase(); // Convert role to lowercase to avoid case mismatch

  if (role === "admin") {
    SidebarComponent = AdminSidebar;
  } else if (role === "site engineer") {
    SidebarComponent = SiteEngineerSidebar;
  } else if (role === "safety engineer") {
    SidebarComponent = SafetyEngineerSidebar;
  } else {
    SidebarComponent = () => <div>No Sidebar Available</div>;
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar */}
      {/* <AppSidebar /> */}
      <SidebarComponent />
      <Backdrop />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isMobileOpen ? "ml-0" : isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        }`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};


const AppLayout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
