import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-3 transition font-medium ${
      isActive
        ? "bg-primary-600 text-white shadow-medium"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const navItems = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/invoices", label: "Invoices" },
    { to: "/quotations", label: "Quotations" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden  bg-gray-200 md:flex md:flex-col justify-center items-center md:w-36 border-r border-gray-200 min-h-screen py-6 shadow-soft">
        <nav className=" flex-1 min-w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              style={({ isActive }) => ({
                backgroundImage: isActive
                  ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                  : "none",
                backgroundColor: isActive ? "transparent" : "transparent",
                color: isActive ? "#FFFFFF" : "#4b5563", // Muted gray for inactive, crisp white for active
                width: "100%",
                boxShadow: isActive
                  ? "0 4px 12px rgba(37, 99, 235, 0.2)"
                  : "none", // Subtle blue glow matching the reference image
                transition: "all 0.2s ease-in-out", // Smoothly fades the gradient on click
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">Version 1.0</p>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col p-6 shadow-prominent ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="self-end text-gray-500 hover:text-gray-700 mb-8"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h1 className="text-2xl font-bold mb-8 bg-linear-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          InvoiceHub
        </h1>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
