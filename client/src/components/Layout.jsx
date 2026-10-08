import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials, getAvatarColor } from "../lib/utils.js";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects",  icon: FolderKanban,   label: "Projects"  },
];

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-16 flex items-center px-5 gap-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <FolderKanban size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 tracking-tight">TaskForge</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
            <Icon size={17} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: getAvatarColor(user?.name) }}>
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }} aria-label="Log out"
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pageTitle = nav.find(n => location.pathname.startsWith(n.to))?.label ||
    (location.pathname.startsWith("/projects/") ? "Project Details" : "TaskForge");
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 border-r border-gray-200 z-50">
        <Sidebar />
      </aside>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative z-10 w-60 border-r border-gray-200">
            <button onClick={() => setOpen(false)} aria-label="Close menu"
              className="absolute top-4 right-3 p-1 text-gray-500 hover:text-gray-900 z-10">
              <X size={18} />
            </button>
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="flex-1 md:pl-60 flex flex-col">
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center px-5 gap-3">
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 -ml-1" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-gray-900">{pageTitle}</h1>
        </header>
        <main className="flex-1 p-5 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
