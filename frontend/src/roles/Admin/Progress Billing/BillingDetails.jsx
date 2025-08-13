import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { FaTable, FaChartBar, FaPrint } from "react-icons/fa";

const BillingDetails = () => {
  const { billing_id } = useParams();
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0); // store scroll position in ref
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const currentY = el.scrollTop;

      if (currentY > lastScrollY.current && currentY > 80) {
        setShowNav(false); // scrolling down
      } else {
        setShowNav(true); // scrolling up
      }

      lastScrollY.current = currentY;
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { to: "table", label: "Billing Table", icon: <FaTable size={20} /> },
    { to: "chart", label: "Billing Chart", icon: <FaChartBar size={20} /> },
    { to: "print", label: "Print Preview", icon: <FaPrint size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Floating Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 transition-transform duration-300 ease-in-out ${
          showNav ? "translate-y-0" : "-translate-y-full"
        } bg-white shadow-sm`}
      >
  <div className="flex justify-between items-center px-6 py-4"> 
          {/* Left */}
          <div className="text-xs text-gray-400 tracking-widest">
            BILLING STEPPER
          </div>

          {/* Center */}
          <div className="flex gap-12">
            {tabs.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex flex-col items-center transition duration-200 ${
                    isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                {icon}
                <span className="absolute top-full mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg z-20">
                  {label}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div className="text-sm text-gray-500 font-mono min-w-[120px] text-right">
            Billing ID: {billing_id}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pb-6 pt-[76px]"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default BillingDetails;
