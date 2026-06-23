import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";

const pageTitles = {
  "/": "Dashboard",
  "/invoices": "Invoices",
  "/invoices/create": "Create Invoice",
  "/quotations": "Quotations",
  "/quotations/create": "Create Quotation",
};

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const getTitle = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    if (location.pathname.startsWith("/invoices/")) return "Invoice Details";
    if (location.pathname.startsWith("/quotations/")) return "Quotation Details";
    return "Dashboard";
  };

  return (
    <header className="h-12 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-soft sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-600 hover:text-gray-900 transition"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden sm:block">
          {user?.email}
        </span>

        <button
          onClick={logout}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-medium text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;