/*eslint-disable*/
import React from "react";
export default function Footer() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-center text-xs text-gray-400">
        &copy;{new Date().getFullYear()} Cabinet d'Architecture CRM. Tous droits
        réservés.
      </p>
      <ul className="flex items-center gap-4">
        <li>
          <a
            href="mailto:hello@simmmple.com"
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            Support
          </a>
        </li>
        <li className="h-3 w-px bg-gray-200" />
        <li>
          <a
            href="#!"
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            Licence
          </a>
        </li>
        <li className="h-3 w-px bg-gray-200" />
        <li>
          <a
            href="#!"
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            Conditions
          </a>
        </li>
      </ul>
    </div>
  );
}
