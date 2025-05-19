import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoReorderThreeOutline } from 'react-icons/io5';
import { RxCross1 } from 'react-icons/rx';
import { useSelector } from 'react-redux';
import logo from "../../assets/headphone.png"

const Navbar = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'All Podcast', path: '/all-podcasts' },
    { name: 'Library', path: '/library' },
  ];

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} className='w-10 h-10' />
            <span className="text-red-600 text-2xl font-bold mr-2">My</span>
            <span className="text-white text-2xl font-bold">Tube</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((item, i) => (
              <Link 
                key={i} 
                to={item.path} 
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Login & Signup Buttons */}
          <div className="hidden md:flex items-center">
            {!isLoggedIn ? (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-300 hover:text-white px-3 py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-red-600 text-white px-4 py-2 rounded-md ml-3 hover:bg-red-700"
                >
                  Signup
                </Link>
              </>
            ) : (
              <Link 
                to="/profile" 
                className="bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? 
                <RxCross1 className="h-6 w-6" /> : 
                <IoReorderThreeOutline className="h-7 w-7" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 px-2 pt-2 pb-4">
          <div className="space-y-1">
            {navLinks.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-800">
              {!isLoggedIn ? (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Signup
                  </Link>
                </div>
              ) : (
                <Link
                  to="/profile"
                  className="block px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;