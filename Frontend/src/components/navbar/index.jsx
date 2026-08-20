import React, { useState, useRef, useEffect } from "react";
import { FiAlignJustify } from "react-icons/fi";
import { RiSunFill, RiMoonFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { getStoredUser, clearAuthSession } from "services/auth";
import { authService } from "services/api";

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkmode, setDarkmode] = useState(() => {
    return localStorage.getItem("crm_theme") === "dark" ||
      (!localStorage.getItem("crm_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const dropdownRef = useRef(null);
  const user = getStoredUser();

  const displayBrandText =
    brandText === "Prospects" ? "Tableau de Bord" : brandText;

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "?";

  const userFullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "Utilisateur";

  const userRole = user?.roles?.[0]?.name || "";

  const handleLogout = async () => {
    setDropdownOpen(false);
    await authService.logout();
    navigate("/auth/sign-in", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (darkmode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("crm_theme", darkmode ? "dark" : "light");
  }, [darkmode]);

  return (
    <nav className="sticky top-0 z-40 flex flex-row items-center justify-between rounded-[28px] border border-[#edf2ff] bg-[#f8faff] p-3 px-4 shadow-[0_0_0_1px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-navy-800/80 dark:shadow-none">
      {/* Left: hamburger + breadcrumb */}
      <div className="ml-[6px] flex flex-row items-center gap-2">
        <button
          onClick={onOpenSidenav}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0f172a] hover:bg-gray-100 xl:hidden"
        >
          <FiAlignJustify className="h-5 w-5" />
        </button>
        <div>
          <div className="h-6 pt-1">
            <span className="text-sm font-normal text-[#64748b] dark:text-gray-400">Pages</span>
            <span className="mx-1 text-sm text-[#94a3b8]">/</span>
            <span className="text-sm font-normal capitalize text-[#475569] dark:text-gray-300">
              {displayBrandText}
            </span>
          </div>
          <p className="shrink text-[32px] capitalize leading-none text-[#0f172a] dark:text-white">
            <span className="font-bold capitalize text-[#0f172a] dark:text-white">
              {displayBrandText}
            </span>
          </p>
        </div>
      </div>

      {/* Right: dark mode + profile */}
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <button
          onClick={() => setDarkmode(!darkmode)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
          title={darkmode ? "Mode clair" : "Mode sombre"}
        >
          {darkmode ? <RiSunFill className="h-5 w-5 text-yellow-500" /> : <RiMoonFill className="h-5 w-5" />}
        </button>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors dark:bg-navy-700 dark:border-white/10 dark:hover:bg-navy-600"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
            {userInitials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-[#0f172a] leading-tight dark:text-white">
              {userFullName}
            </p>
            <p className="text-xs text-[#94a3b8] dark:text-gray-400">{userRole}</p>
          </div>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl z-50 dark:bg-navy-800 dark:border-white/10">
            <div className="border-b border-gray-100 px-4 py-3 dark:border-white/10">
              <p className="text-sm font-bold text-[#0f172a] dark:text-white">{userFullName}</p>
              <p className="text-xs text-[#94a3b8] dark:text-gray-400">{user?.email || ""}</p>
              {userRole && (
                <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
                  {userRole}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
