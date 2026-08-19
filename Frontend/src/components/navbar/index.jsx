import React from "react";
import { FiAlignJustify, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const displayBrandText =
    brandText === "Prospects" ? "Tableau de Bord" : brandText;

  return (
    <nav className="sticky top-0 z-40 flex flex-row items-center justify-between rounded-[28px] border border-[#edf2ff] bg-[#f8faff] p-3 px-4 shadow-[0_0_0_1px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="ml-[6px] flex-1">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-[#64748b] hover:underline"
            href=" "
          >
            Pages
            <span className="mx-1 text-sm text-[#94a3b8] hover:text-[#1e293b]">
              {" "}
              /{" "}
            </span>
          </a>
          <Link
            className="text-sm font-normal capitalize text-[#475569] hover:underline"
            to="#"
          >
            {displayBrandText}
          </Link>
        </div>
        <p className="shrink text-[32px] capitalize leading-none text-[#0f172a]">
          <Link
            to="#"
            className="font-bold capitalize text-[#0f172a] hover:text-[#111827]"
          >
            {displayBrandText}
          </Link>
        </p>
      </div>

    
    </nav>
  );
};

export default Navbar;
