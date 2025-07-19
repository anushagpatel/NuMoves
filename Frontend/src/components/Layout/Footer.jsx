import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { useSelector } from "react-redux";

const Footer = () => {
  const { isAuthorized } = useSelector((state) => state.auth);

  return (
    <footer
      className={`${
        isAuthorized ? "block" : "hidden"
      } bg-gray-800 text-white py-4 px-6 mt-auto`}
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="text-sm">&copy; NuMoves</div>
        <div className="flex space-x-4 text-xl">
          <Link to="https://github.com/" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </Link>
          <Link to="https://www.linkedin.com/in/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </Link>
          <Link to="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
            <RiInstagramFill />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
