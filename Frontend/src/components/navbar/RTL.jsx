import React, { useState, useRef, useEffect, useCallback } from "react";
import { FiAlignJustify, FiSearch, FiX, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import api from "services/api";

const navPages = [
  { name: "Dashboard", path: "/admin/default", category: "Navigation" },
  { name: "Prospects", path: "/admin/prospects", category: "Navigation" },
  { name: "Clients", path: "/admin/clients", category: "Navigation" },
  { name: "Projets", path: "/admin/projects", category: "Navigation" },
  { name: "Tâches", path: "/admin/tasks", category: "Navigation" },
  { name: "Documents", path: "/admin/documents", category: "Navigation" },
  { name: "Planning", path: "/admin/planning", category: "Navigation" },
  { name: "Utilisateurs", path: "/admin/users", category: "Navigation" },
];

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isOpenResults, setIsOpenResults] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const performSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const q = term.trim();
      const navMatches = navPages.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase())
      ).map((p) => ({ ...p, type: "page" }));

      const [prospRes, clientRes, projRes] = await Promise.allSettled([
        api.get("/prospects", { params: { search: q } }),
        api.get("/clients", { params: { search: q } }),
        api.get("/projects", { params: { search: q } }),
      ]);

      const prospectResults = (prospRes.status === "fulfilled" ? (prospRes.value.data.data || []) : []).map((p) => ({
        name: `${p.first_name} ${p.last_name}`,
        path: "/admin/prospects",
        type: "prospect",
        subtitle: p.company_name || p.email || "",
      }));

      const clientResults = (clientRes.status === "fulfilled" ? (clientRes.value.data.data || []) : []).map((c) => ({
        name: c.company_name || `${c.first_name} ${c.last_name}`,
        path: "/admin/clients",
        type: "client",
        subtitle: c.email || c.phone || "",
      }));

      const projectResults = (projRes.status === "fulfilled" ? (projRes.value.data.data || []) : []).map((p) => ({
        name: p.name,
        path: "/admin/projects",
        type: "project",
        subtitle: p.reference || p.city || "",
      }));

      setResults([...navMatches, ...prospectResults, ...clientResults, ...projectResults]);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    setIsOpenResults(val.trim().length > 0);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(val), 350);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setIsOpenResults(false);
    setResults([]);
    clearTimeout(debounceRef.current);
  };

  const handleSelectResult = (path) => {
    navigate(path);
    handleClearSearch();
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpenResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-4 z-40 flex flex-row items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="ms-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            href=" "
          >
            Pages
            <span className="mx-1 text-sm text-navy-700 hover:text-navy-700 dark:text-white">
              {" "}
              /{" "}
            </span>
          </a>
          <Link
            className="text-sm font-normal capitalize text-navy-700 hover:underline dark:text-white dark:hover:text-white"
            to="#"
          >
            {brandText}
          </Link>
        </div>
        <p className="shrink text-[33px] capitalize text-navy-700 dark:text-white">
          <Link
            to="#"
            className="font-bold capitalize hover:text-navy-700 dark:hover:text-white"
          >
            {brandText}
          </Link>
        </p>
      </div>

      {/* Transparent Glassmorphism Navbar Controls Container */}
      <div className="relative flex h-[52px] items-center gap-2 sm:gap-3 rounded-full bg-white/20 dark:bg-navy-800/80 backdrop-blur-md px-3 py-1.5 border border-white/30 dark:border-white/10 shadow-sm">
        {/* Search Bar Container */}
        <div ref={searchRef} className="relative">
          <div className="flex h-10 w-44 sm:w-60 md:w-72 items-center rounded-full bg-white/40 dark:bg-[#0b14374d] backdrop-blur-sm border border-gray-200/50 dark:border-[#ffffff1a] text-navy-700 dark:text-white px-3 transition-all focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-gray-100 dark:focus-within:bg-[#0b14374d]">
            <FiSearch className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setIsOpenResults(searchValue.trim().length > 0)}
              placeholder="البحث عن مشروع، زبون..."
              className="navbar-search-input block h-full w-full bg-transparent px-2 text-sm font-medium text-navy-700 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/70"
            />
            {searchValue && (
              <button
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-navy-700 dark:hover:text-white"
              >
                <FiX className="h-4 w-4 shrink-0" />
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown */}
          {isOpenResults && (
            <div className="absolute top-12 start-0 w-72 sm:w-80 md:w-96 rounded-2xl bg-white/95 dark:bg-navy-800/95 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 z-50 transition-all animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span>{searching ? "Recherche..." : `Résultats (${results.length})`}</span>
              </div>

              <div className="mt-1 max-h-64 overflow-y-auto flex flex-col gap-1">
                {results.length > 0 ? (
                  results.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectResult(item.path)}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-navy-700 cursor-pointer transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-navy-700 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-400">
                          {item.subtitle ? `${item.subtitle} · ` : ""}{item.type}
                        </span>
                      </div>
                      <FiArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:-translate-x-1 transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun résultat pour "{searchValue}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden p-2 rounded-full hover:bg-white/30 dark:hover:bg-navy-700/50 transition-all"
          onClick={onOpenSidenav}
          title="القائمة"
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>

        {/* DarkMode toggle */}
        <div
          className="cursor-pointer p-2.5 rounded-full hover:bg-white/30 dark:hover:bg-navy-700/50 transition-all"
          onClick={() => {
            if (darkmode) {
              document.body.classList.remove("dark");
              setDarkmode(false);
            } else {
              document.body.classList.add("dark");
              setDarkmode(true);
            }
          }}
          title={darkmode ? "الوضع النهاري" : "الوضع ليلي"}
        >
          {darkmode ? (
            <RiSunFill className="h-5 w-5 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="h-5 w-5 text-gray-600 dark:text-white" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
