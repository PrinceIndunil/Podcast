import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/microphone.png';
import { IoReorderThreeOutline } from 'react-icons/io5';
import { RxCross1 } from 'react-icons/rx';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const isLoggedIn = useSelector((state)=>state.auth.isLoggedIn);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'All Podcast', path: '/all-podcasts' },
    { name: 'Library', path: '/library' },
    
  ];

  return (
    <nav className="px-4 md:px-8 lg:px-12 py-2 relative">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="logo brand-name w-2/6 flex items-center gap-4">
          <img src={Logo} alt="MyTube Logo" className="h-12 mr-2" />
          <Link to="/" className="text-2xl font-semibold">
            MyTube
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center justify-center w-2/6">
          {navLinks.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="ms-4 hover:font-semibold transition-all duration-300"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Login & Signup Buttons */}
        <div className="hidden lg:flex items-center justify-end w-2/6">
          {!isLoggedIn && (
            <>
            {""}
            <Link to="/login" className="px-6 py-3 border border-black rounded-full">
            Login
          </Link>
          <Link to="/signup" className="ms-4 px-6 py-3 bg-black text-white rounded-full">
            Signup
          </Link>
          </>
          )}
          {isLoggedIn && 
          <Link to="/profile" className="ms-4 px-6 py-3 bg-black text-white rounded-full">
          Profile
        </Link>
        }
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden w-4/6 flex items-center justify-end z-[100]">
          <button
            className="text-4xl"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <RxCross1 /> : <IoReorderThreeOutline />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed left-0 top-0 w-full h-screen bg-blue-100 z-50 transition-all duration-500 ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="h-full flex flex-col items-center justify-center">
          {navLinks.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="mb-6 text-3xl hover:font-semibold transition-all duration-300"
              onClick={() => setIsMenuOpen(false)} // Close menu on link click
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/login"
            className="mb-6 text-3xl hover:font-semibold transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="mb-6 text-3xl hover:font-semibold transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Signup
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
