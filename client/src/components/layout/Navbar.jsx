import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../Provider/UserProvider";
import { useEffect, useState } from "react";
import AxiosInstance from "../AxiosInstance";

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useUser();
  const navigate = useNavigate();

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    JSON.parse(localStorage.getItem("business_category")) || null
  );

  // Fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await AxiosInstance.get("business-categories/");
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  
  // Handle switching category
  const handleCategorySelect = (cat) => {
    localStorage.setItem("business_category", JSON.stringify(cat));
    setSelectedCategory(cat);
    setCategoryOpen(false);

    // Reload current page to reflect new category data
    window.location.reload();
  };

  const getTitle = () => {
    if (location.pathname.startsWith("/sales")) return "Sales";
    if (location.pathname.startsWith("/purchases")) return "Purchases";
    if (location.pathname.startsWith("/expenses")) return "Expenses";
    if (location.pathname.startsWith("/accounting")) return "Accounting";
    if (location.pathname.startsWith("/stock")) return "Stock";
    if (location.pathname.startsWith("/assets")) return "Assets";
    if (location.pathname.startsWith("/reports")) return "Reports";
    return "Dashboard";
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">

      {/* LEFT SIDE */}
      <div>
        <h2 className="text-lg font-semibold">{getTitle()}{}</h2>
        <p className="text-xs text-slate-500">
          Manage your finances, stock, and assets in one place.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* CATEGORY SELECT DROPDOWN */}
        <div className="relative">
          <div
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="cursor-pointer px-3 py-1.5 border rounded-lg text-sm bg-blue-50 text-blue-700 font-medium"
          >
            {selectedCategory ? selectedCategory.name : "Select Category"}
          </div>

          {/* Dropdown list */}
          {categoryOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md z-50">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH BOX */}
        <input
          type="text"
          placeholder="Search in bBOOK..."
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
        />

        {/* USER MENU */}
        <div className="relative">
          <div
            className="w-9 h-9 p-1 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 cursor-pointer"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            {user?.username?.slice(0, 2)?.toUpperCase()}
          </div>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded-md py-2 z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/dashboard/profile");
                }}
              >
                Profile
              </button>

              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                onClick={() => {
                  signOut();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
