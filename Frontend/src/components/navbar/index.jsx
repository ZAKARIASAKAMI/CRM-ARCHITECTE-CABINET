import React, { useState, useRef, useEffect } from "react";
import { FiAlignJustify, FiSearch, FiX, FiArrowRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

const searchDatabase = [
  { name: "Tableau de Bord (Dashboard)", path: "/admin/default", type: "Page", category: "Vue d'ensemble" },
  { name: "Prospects - Pipeline Commercial", path: "/admin/prospects", type: "Commercial", category: "Prospects" },
  { name: "Clients & Contacts (ICE, Tax ID)", path: "/admin/clients", type: "Clients", category: "Gestion" },
  { name: "Projets Architecturaux (PRJ-2026)", path: "/admin/projects", type: "Projets", category: "Architecture" },
  { name: "Villa Anfa - Projet Résidentiel", path: "/admin/projects", type: "Projet", category: "Architecture" },
  { name: "Immeuble Maarif - Conception", path: "/admin/projects", type: "Projet", category: "Architecture" },
  { name: "Tâches & Kanban", path: "/admin/tasks", type: "Tâches", category: "Opérations" },
  { name: "Documents & Plans (Versioning)", path: "/admin/documents", type: "Documents", category: "Fichiers" },
  { name: "Planning & Rendez-vous (Agenda)", path: "/admin/planning", type: "Planning", category: "Événements" },
  { name: "Utilisateurs & Rôles Admin", path: "/admin/users", type: "Admin", category: "Utilisateurs" },
];

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isOpenResults, setIsOpenResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setIsOpenResults(e.target.value.trim().length > 0);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setIsOpenResults(false);
  };

  const filteredResults = searchDatabase.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.type.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.category.toLowerCase().includes(searchValue.toLowerCase())
  );

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
      <div className="ml-[6px]">
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

      {/* Transparent Glassmorphism Navbar Controls Container (No White Box / No Lbyodya) */}
      <div className="relative flex h-[52px] items-center gap-2 sm:gap-3 rounded-full bg-white/20 dark:bg-navy-800/40 backdrop-blur-md px-3 py-1.5 border border-white/30 dark:border-white/10 shadow-sm">
        {/* Search Bar Container */}
        <div ref={searchRef} className="relative">
          <div className="flex h-10 w-44 sm:w-60 md:w-72 items-center rounded-full bg-white/40 dark:bg-navy-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-navy-700 dark:text-white px-3 transition-all focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white/70 dark:focus-within:bg-navy-900/90">
            <FiSearch className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-300" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setIsOpenResults(searchValue.trim().length > 0)}
              placeholder="Rechercher un projet, client..."
              className="block h-full w-full bg-transparent px-2 text-sm font-medium text-navy-700 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
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
            <div className="absolute top-12 left-0 w-72 sm:w-80 md:w-96 rounded-2xl bg-white/95 dark:bg-navy-800/95 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 z-50 transition-all animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span>Résultats de recherche ({filteredResults.length})</span>
                <span className="text-[10px] text-gray-400">Échap pour fermer</span>
              </div>

              <div className="mt-1 max-h-64 overflow-y-auto flex flex-col gap-1">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => (
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
                          {item.category} • {item.type}
                        </span>
                      </div>
                      <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun résultat trouvé pour "{searchValue}"
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
          title="Menu"
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
          title={darkmode ? "Mode Clair" : "Mode Sombre"}
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
