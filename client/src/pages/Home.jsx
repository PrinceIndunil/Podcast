import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const bottomSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = () => {
    if (bottomSectionRef.current) {
      window.scrollTo({
        top: bottomSectionRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const AnimatedText = ({ text, delay, className }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }, [delay]);

    return (
      <span className={`transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 min-h-screen lg:h-[90vh] relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-7xl mx-auto px-6 py-12 z-10">
        <div className={`w-full flex flex-col lg:flex-row items-center justify-between gap-10 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <AnimatedText
                text="The Most Popular"
                delay={300}
                className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600"
              />
              <div className="flex items-end justify-center lg:justify-start">
                <AnimatedText
                  text="P"
                  delay={600}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-indigo-600"
                />
                <span className="transform transition-transform hover:scale-125 duration-300 mx-1">
                  <div className="h-12 sm:h-16 lg:h-20 w-12 sm:w-16 lg:w-20 relative animate-pulse">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full text-indigo-600">
                      <path d="M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                </span>
                <AnimatedText
                  text="dcast"
                  delay={900}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-indigo-600"
                />
              </div>
            </div>

            <AnimatedText
              text="Listen to the most popular podcasts on one platform - MyTube"
              delay={1200}
              className="block text-xl text-indigo-900 font-medium mt-6"
            />

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-8">
              <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-full shadow-lg transform transition-all hover:scale-105 hover:shadow-xl hover:from-indigo-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                Login to Listen
              </button>
              <button className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-full shadow-md border border-indigo-100 transform transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-200">
                Explore Podcasts
              </button>
            </div>

            <div className="flex flex-wrap gap-8 justify-center lg:justify-start mt-10">
              {[
                { icon: 'M9 19V6l12-3v13...', label: 'Premium Sound', bg: 'bg-purple-100', text: 'text-purple-600' },
                { icon: 'M3 15a4 4 0 004 4h9...', label: 'Cloud Sync', bg: 'bg-indigo-100', text: 'text-indigo-600' },
                { icon: 'M8 16H6a2 2 0 01-2-2V6...', label: 'Offline Mode', bg: 'bg-blue-100', text: 'text-blue-600' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div className={`w-12 h-12 rounded-full ${feature.bg} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${feature.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <span className="text-indigo-900">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center mt-12 lg:mt-0">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -inset-0 bg-white rounded-full opacity-80"></div>

              <div className="relative w-full max-w-md h-64 sm:h-80 md:h-96 rounded-3xl shadow-2xl transform transition-all duration-700 hover:scale-105 z-10 bg-gradient-to-r from-purple-400 to-indigo-500 overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-around">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={`bar-${i}`}
                      className="bg-white bg-opacity-70 w-3 sm:w-4 rounded-t-full animate-pulse"
                      style={{
                        height: `${Math.max(15, Math.random() * 100)}%`,
                        animationDuration: `${0.5 + Math.random() * 1}s`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30 text-white">
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center backdrop-filter backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-lg font-medium">Popular Podcast</p>
                  <p className="text-sm opacity-80">Now Playing</p>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-purple-600 rounded-xl transform rotate-12 animate-float"></div>
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-indigo-400 rounded-full transform -rotate-12 animate-float animation-delay-2000"></div>
              <div className="absolute top-1/2 -right-10 w-12 h-12 bg-blue-500 rounded-lg transform rotate-45 animate-float animation-delay-4000"></div>
            </div>
          </div>
        </div>

        {/* Bottom feature section */}
        <div ref={bottomSectionRef} className={`mt-20 w-full transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-lg">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-indigo-900">All your favorite podcasts</h3>
              <p className="text-indigo-700 mt-2">Stream or download thousands of shows</p>
            </div>
            <div className="flex gap-4">
              <button
  onClick={() => navigate('/login')}
  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md transform transition-all hover:scale-105 hover:bg-indigo-700"
>
  Get Started
</button>

              <button
  onClick={scrollToSection}
  className="px-6 py-3 bg-transparent text-indigo-600 font-semibold rounded-full border border-indigo-300 transform transition-all hover:scale-105 hover:bg-indigo-50 hover:border-indigo-400"
>
  Learn More
</button>

            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:block">
        <button
          onClick={scrollToSection}
          className="p-4 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg text-indigo-700 font-semibold rounded-full shadow-lg hover:bg-white hover:text-indigo-800 transition duration-300 flex items-center space-x-2 animate-bounce"
        >
          <span>Scroll Down</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Home;
