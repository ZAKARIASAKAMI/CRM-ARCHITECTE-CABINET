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

      <div className="relative flex h-[52px] items-center gap-3">
        <div className="flex h-10 w-[450px] items-center rounded-full border border-[#dfe7f5] bg-[white] px-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-colors sm:w-[500px] md:w-[620px]">
          <FiSearch className="h-4 w-4 shrink-0 text-[#64748b]" />
          <input
            type="text"
            placeholder="Rechercher un projet, client..."
            className="bg-transparent h-full w-full border-0 px-2.5 text-sm leading-none text-[#334155] outline-none placeholder:leading-none placeholder:text-[#94a3b8]"
          />
        </div>

        <span
          className="flex cursor-pointer rounded-full p-2 text-xl text-[#475569] transition-all hover:bg-[#eef4ff] xl:hidden"
          onClick={onOpenSidenav}
          title="Menu"
        >
          <FiAlignJustify className="h-5 w-5 text-[#334155]" />
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
