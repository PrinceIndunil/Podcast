import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Home from "./pages/Home";
import AuthLayout from './layout/AuthLayout';
import Signup from './pages/signup.jsx';
import Login from './pages/Login.jsx'; 
import Categories from "./pages/Categories.jsx"
import Profile from './pages/Profile.jsx';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { authActions } from './store/auth.js';
import AddPodcast from './pages/AddPodcast.jsx';

const App = () => {
  const dispatch = useDispatch();
  useEffect(() =>{
     const fetch = async () =>{
      try {
        const res = await axios.get("http://localhost:8800/api/v1/check-cookie" , {
          withCredentials: true,
        });
        if(res.data.message){
          dispatch(authActions.login());
        }
      } catch (error) {
        console.log(error)
      }
      
     };
     fetch();
  },[])
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/categories" element={<Categories/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/add-podcast" element={<AddPodcast/>}/>
          </Route>

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
