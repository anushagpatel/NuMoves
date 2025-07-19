import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaBriefcase,
  FaRegClipboard,
  FaFileAlt,
  FaPlusSquare,
  FaList,
  FaCross,
} from "react-icons/fa";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const navigateTo = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, role, isAuthorized } = useSelector((state) => {
    return state.auth;
  });
  const handleMenuToggler = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/users/logout", {
        withCredentials: true,
      });
      console.log("Logout API response:", response.data);

      if (response.data.success) {
        dispatch(logout()); // Dispatching the logout action
        localStorage.removeItem("user");
        sessionStorage.clear();
        localStorage.removeItem("userId");
        localStorage.removeItem("loggedIn")

        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error("Logout failed. Please try again.");
        console.log(response.error);
      }
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };


  const navItems = [
    
    {
      path: "/",
      title: "Home",
      icon: <FaHome />,
    },

  
  ];

  return (
    <header
      className={
        isAuthorized
          ? "max-w-screen-2xl container mx-auto xl:px-24 px-4"
          : "navbarHide"
      }
    >
      <nav className="flex justify-between items-center py-6 relative">
        <a href="/" className="flex items-center gap-2 text-2xl text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="29"
            height="30"
            viewBox="0 0 29 30"
            fill="none"
          >
            <circle
              cx="12.0143"
              cy="12.5143"
              r="12.0143"
              fill="#3575E2"
              fillOpacity="0.4"
            />
            <circle cx="16.9857" cy="17.4857" r="12.0143" fill="#3575E2" />
          </svg>
          <span>NuMoves</span>
        </a>

        <ul className="hidden md:flex gap-12">
  {user ? (
     (
      <>
      <li className="text-base text-primary">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>
        </li>
        <li>
        <NavLink
          to="/post"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Post Ad
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/conversations"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Conversations
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/mypostings"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          My Postings
        </NavLink>
      </li>
      </>
    )
  ) : null}
</ul>

        <div className="text-base text-primary font-medium space-x-5 hidden lg:block">
          {isAuthorized ? (
            <Link
              onClick={handleLogout}
              to="/login"
              className="py-2 px-5 border rounded bg-blue text-white"
            >
              Log out
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="py-2 px-5 border rounded bg-blue text-white"
              >
                Log in
              </Link>
              <Link
                to="/sign-up"
                className="py-2 px-5 border rounded bg-blue text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        <button onClick={handleMenuToggler} className="md:hidden block">
          {isMenuOpen ? (
            <FaXmark className="w-5 h-5 text-primary" />
          ) : (
            <FaBarsStaggered className="w-5 h-5 text-primary" />
          )}
        </button>
      </nav>
      <div className={`px-4 bg-black py-5 rounded-sm ${isMenuOpen ? "" : "hidden"}`}>
        <ul>
          {navItems
            .filter((item) => !item.role || (user && user.role === item.role))
            .map(({ path, title }) => (
              <li key={path} className="text-base text-white first:text-white py-1">
                <NavLink
                  to={path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {title}
                </NavLink>
              </li>
            ))}
          <li className="text-white py-1">
            {isAuthorized ? (
              <Link
                onClick={handleLogout}
                to="/login"
                className=""
              >
                Log out
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className=""
                >
                  Log in
                </Link>
                <Link
                  to="/sign-up"
                  className=""
                >
                  Sign up
                </Link>
              </>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;