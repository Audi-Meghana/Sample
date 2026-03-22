import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <header className="w-full flex justify-end items-center bg-white shadow-sm px-6 py-3 relative">
      <div className="relative">
        {/* Profile Icon */}
        <div
          onClick={() => setOpen(!open)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition"
        >
          <User size={18} />
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
            
            <div
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition"
            >
              <User size={16} />
              View Profile
            </div>

            <div
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition"
            >
              <LogOut size={16} />
              Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
}