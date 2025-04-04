import React from 'react';
import headphone from '../assets/headphone.png';
import music from '../assets/music.gif';

const Home = () => {
  return (
    <div className="bg-gradient-to-r from-[#E6E6FA] to-[#d3d3f5] px-6 py-12 min-h-screen lg:h-[89vh] flex flex-col items-center justify-center relative">

      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 relative">

        <div className="w-full lg:w-5/6 text-center lg:text-left lg:ml-[50px] mt-6 sm:mt-8 lg:mt-0">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#4b0082]">
         the most popular
            <br />
            <h1 className="flex items-end justify-center lg:justify-start text-[#6A5ACD]">
              P <span><img src={headphone} alt="headphone" className="h-12 sm:h-16 lg:h-20 transform transition-transform hover:scale-110" /></span>dcast
            </h1>
          </h1>
        </div>

        <div className="w-3/4 sm:w-2/3 lg:w-2/5 flex justify-center items-start">
          <img
            src={music}
            alt="broadcast mike"
            className="rounded-lg shadow-lg object-cover w-full sm:w-[350px] lg:w-[350px] h-auto transform transition-transform hover:scale-105"
          />
        </div>

        <div className="absolute bottom-10 right-10 hidden lg:block">
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="py-2 border border-black font-semibold rounded-full text-center rotate-90 p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 flex flex-row items-center space-x-2"
          >
            <span>Scroll Down</span>
          </button>
        </div>
      </div>

      <div className="mt-12 w-full flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
        <div className="mb-6 sm:mb-0 lg:ml-[50px]">
          <p className="text-xl font-semibold text-[#4b0082]">
            Listen to the most popular podcasts on one platform - {" "}
            <b>yTube</b>
          </p>
          
          <button className="px-6 py-4 bg-[#A19AD3] text-white font-semibold rounded-full mt-8 transform transition-all hover:scale-105 hover:bg-[#7f83b5]">
            Login to Listen
          </button>
        </div>
        <div>
          <p className="text-zinc-700 font-semibold">Our app contains all your needs</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
