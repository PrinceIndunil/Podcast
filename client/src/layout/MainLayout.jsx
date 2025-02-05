import React from 'react';
import {Outlet} from "react-router-dom";
import Navbar from '../components/Navbar/Navbar';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer';

const MainLayout = ()=>{
  return(
    <div className='relative'>
        <Navbar/>
        <main>
          <Outlet/>
        </main>
        <div className=' w-full'>
          <AudioPlayer/>
        </div>
        
    </div>
  )
}

export default MainLayout