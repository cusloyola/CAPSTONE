import React, { useEffect, useState, useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaTasks,
  FaRulerCombined,
  FaBoxOpen,
  FaHardHat,
  FaCalculator,
} from "react-icons/fa";

const ProposalDetails = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollRef = useRef(null);

  // Clock updater
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll listener for internal scroll container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const currentY = el.scrollTop;
      if (currentY > lastScrollY && currentY > 80) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(currentY);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const steps = [
    { to: "scope-of-work", label: "Scope of Works", icon: <FaTasks size={20} /> },
    { to: "quantity-take-off", label: "Quantity Take-Off", icon: <FaRulerCombined size={20} /> },
    { to: "material-unit-cost", label: "Material Take-Off", icon: <FaBoxOpen size={20} /> },
    { to: "labor-unit-cost", label: "Labor Unit", icon: <FaHardHat size={20} /> },
    { to: "final-cost-estimation", label: "Final Cost Estimation", icon: <FaCalculator size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Floating Header - absolute inside scroll container */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          showNav ? "translate-y-0" : "-translate-y-full"
        } bg-white shadow-sm`}
      >
        <div className="flex justify-between items-center px-4 py-3">
          {/* Left */}
          <div className="text-xs text-gray-400 tracking-widest">ESTIMATOR STEPPER</div>

          {/* Center */}
          <div className="flex gap-12">
            {steps.map(({ to, label, icon }) => (
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

          {/* Right: Clock */}
          <div className="text-sm text-gray-500 text-right leading-tight font-mono min-w-[120px]">
            <div>
              {currentTime.toLocaleTimeString("en-PH", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <div>
              {currentTime.toLocaleDateString("en-PH", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-4 pt-[72px]"
      >
        <Outlet />
      </div>
    </div>
  );
};

export default ProposalDetails;
