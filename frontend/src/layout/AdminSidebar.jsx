import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Make sure to use react-router-dom

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  FolderIcon,
  UserIcon,
  GroupIcon,
  DollarLineIcon,
  PlusIcon,
  FileIcon,

  
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
// Define admin-specific nav items
const navItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/AdminDashboard"
  },
  {
    icon: <CalenderIcon />,
    name: "Projects",
    subItems:
      [
        // { name: "Task Scheduling", path: "/TaskManagement", pro: false, }, //path : /AdminDashboard - name ng file
        // { name: "Status Updates", path: "", pro: false }, 
        { name: "Calendar", path: "/AdminCalendar", pro: false },
        { name: "Add New Projects", path: "/AddProject", pro: false },
        { name: "View Project Proposals", path: "/AllPendingProjects", pro: false },
        { name: "View In Progress Projects ", path: "/InProgressProjectTable", pro: false },

        // { name: "Daily Site Reports", path: "/AdminSiteReports", pro: false },
        { name: "Clients", path: "/ClientManagement", pro: false },

      ],

  },

  {
    icon: <UserIcon  />,
    name: "User Management",
    subItems: [{ name: "User Accounts", path: "/UserManagement", pro: false }],
  },
  // {
  //   icon: <GroupIcon />,
  //   name: "HR Management",
  //   subItems: [{ name: "Workers", path: "/EmployeeManagement", pro: false }],
  // },
  // {
  //   icon: <DollarLineIcon />,
  //   name: "Cost Estimation",
  //   subItems:
  //   [
  //     { name: "BOM", path: "/AdminBOM", pro: false, }, 
  //     { name: "BOQ", path: "AdminBOQ", pro: false }, 
  //   ],
  // },
  {
    icon: <ListIcon />,
    name: "Inventory & Resources",
    subItems:
    [
      { name: "Inventory Management", path: "/InventoryManagement", pro: false, }, 
       { name: "Resource Management", path: "/ResourceManagement", pro: false }, 
      { name: "Inventory Monitoring", path: "/InventoryMonitoring", pro: false }, 
    ],
  },
  {
    icon: <PlusIcon />,
    name: "Request Management ",
    subItems: [{ name: "Material Request", path: "/MaterialRequestManagement", pro: false }],
  },
  {
    icon: <FolderIcon />,
    name: "Document Management",
    subItems: [{ name: "Files", path: "/AdminFileManagement", pro: false }],
  },
  {
    icon: <FileIcon />,
    name: "Contract Management",
    subItems: [{ name: "Employee Application Contract", path: "/EmploymentContract", pro: false },
      { name: "Leave Application Contract", path: "/LeaveContract", pro: false },
    ],
  },
  // {
  //   icon: <GridIcon />,
  //   name: "HR Management ",
  //   subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  // },
  {
    icon: <FolderIcon />,
    name: "Reports",
    subItems: 
    [
      { name: "Manage Safety Reports", path: "/SafetyReportsManagement", pro: false },
      { name: "Manage Incident Reports", path: "/ViewIncidentReportAdmin", pro: false }, 
    ],
    
  },




  {
    icon: <PieChartIcon />,
    name: "Reports and Analytics",
    subItems: [{ name: "Reports", path: "/Reports", pro: false }],
  },

  // Add more admin-specific items as needed...
];

const othersItems = [
  // {
  //   icon: <PieChartIcon />,
  //   name: "Reports",
  //   subItems: [
  //     { name: "Sales Report", path: "/admin/sales-report", pro: false },
  //     { name: "User Report", path: "/admin/user-report", pro: false },
  //   ],
  // },
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin", pro: false },
  //     { name: "Sign Up", path: "/signup", pro: false },
  //   ],
  // },
];

const AdminSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu && openSubmenu.type === menuType && openSubmenu.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size ${openSubmenu && openSubmenu.type === menuType && openSubmenu.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu && openSubmenu.type === menuType && openSubmenu.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu && openSubmenu.type === menuType && openSubmenu.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/drl/logo.png"
                alt="Logo"
                width={250}
                height={50}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? " " : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AdminSidebar;
