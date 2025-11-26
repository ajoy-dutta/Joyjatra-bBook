// src/components/navbar/HomeNavbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../Provider/UserProvider";

const HomeNavbar = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Top-right nav links
  const navLinks = [
    { to: "/", label: "Home" },
    ...(user
      ? [
          { to: "/dashboard", label: "Dashboard" },
          {
            to: "/",
            label: "Sign Out",
            onClick: () => {
              signOut();          
              navigate("/login");
            },
          },
        ]
      : [{ to: "/login", label: "Login" }]),
  ];

  // Main tile navigation tailored to Home page
  const mainNav = [
    { title: "About", subtitle: "Who we are", link: "/about" },
    { title: "Programs", subtitle: "Our initiatives", link: "/programs" },
    { title: "Donate", subtitle: "Support us", link: "/donate" },
    { title: "Volunteer", subtitle: "Join our team", link: "/volunteer" },
    { title: "Contact", subtitle: "Get in touch", link: "/contact" },
  ];

  return (
    <div className="w-full">
      {/* Top Nav */}
      <div className="bg-green-700 text-white text-sm px-4 py-1 flex justify-end gap-4">
        {navLinks.map((link) =>
          link.onClick ? (
            <button
              key={link.label}
              onClick={link.onClick}
              className="hover:underline"
            >
              {link.label}
            </button>
          ) : (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `hover:underline ${
                  isActive ? "font-bold underline text-yellow-300" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          )
        )}
      </div>

      {/* Optional: logo or title area */}
      <div className="bg-white py-2 px-2">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-x-6 text-center">
          {/* If you have a logo, place it here; otherwise show organization name */}
          {/* Example placeholder: */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-green-800">
              Joy Jatra
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Empowering communities, creating lasting impact
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tiles */}
      <div className="bg-green-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-1 text-white text-sm">
        {mainNav.map(({ title, subtitle, link }) => (
          <NavLink
            key={title}
            to={link}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-4 text-center border border-white transition-all ${
                isActive ? "bg-green-800" : "hover:bg-green-700"
              }`
            }
          >
            <p className="font-bold leading-tight">{title}</p>
            <p className="text-xs leading-none font-semibold">{subtitle}</p>
          </NavLink>
        ))}
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden px-4 py-2">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-green-700 font-semibold"
        >
          {isDropdownOpen ? "Close Menu" : "Menu"}
        </button>
        {isDropdownOpen && (
          <ul className="mt-2 bg-slate-100 shadow px-4 py-2 rounded space-y-2">
            {mainNav.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.link}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block py-1 hover:text-green-700"
                >
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomeNavbar;
