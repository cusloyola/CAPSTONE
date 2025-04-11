import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        // Retrieve the JWT from localStorage
        const token = localStorage.getItem('authToken');

        const headers = {
          'Content-Type': 'application/json',
          'credentials': 'include',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch("http://localhost:5000/api/user-accounts/names-and-emails", {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          console.error("Failed to fetch user. Status:", response.status);
          if (response.status === 401 || response.status === 403) {
            navigate('/signin');
          }
          return;
        }

        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          // Now 'data' should be a single user object
          if (data && data.full_name && data.email) {
            setUser({ name: data.full_name, email: data.email });
          } else {
            console.error("User data is incomplete.");
          }
        } else {
          console.error("Expected JSON response, but got:", contentType);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    fetchUser();
  }, [navigate]);
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      const dropdownElement = document.querySelector(".dropdown-toggle");
      if (dropdownElement && !dropdownElement.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function clearCookies() {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name.trim()}=;expires=${new Date(0).toUTCString()};path=/`;
    });
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout failed:", error);
    }

    clearCookies();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/signin");
    window.location.reload();
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="/images/drl/user.png" alt="User" />
        </span>
        <span className="block mr-1 font-medium text-theme-sm">
          {user.name || "Loading..."} {/* Display user name or "Loading..." */}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user.name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 font-medium text-red-600 rounded-lg text-theme-sm hover:bg-red-50 dark:hover:bg-white/10"
            >
              Logout
            </button>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
