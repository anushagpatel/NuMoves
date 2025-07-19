import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import  { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import NotFound from "./components/NotFound/NotFound";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { setAuth, logout } from './components/redux/authSlice';
import { useDispatch, useSelector } from "react-redux"
import PostAd from './components/Advertisement/PostAd';
import Message from './components/Chat/Message';
import ConversationList from './components/Chat/ConversationList';
import ProdByUser from './components/Advertisement/ProdByUser';
const App = () => {

  const dispatch = useDispatch();
  const user = localStorage.getItem("user");

  const { isAuthorized } = useSelector((state) => {
    return state.auth;
  });
  useEffect(() => {
    const getUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("No user ID found in localStorage.");
        dispatch(logout());
        return;
      }
  
      try {
        const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
        const user = response.data;
  
        if (user) {
          dispatch(setAuth({ user }));
          localStorage.setItem("loggedIn", "true");
          localStorage.setItem("user", JSON.stringify(user)); // FIXED
        } else {
          dispatch(logout());
          localStorage.removeItem("loggedIn");
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        dispatch(logout());
        localStorage.setItem("loggedIn", "false");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
      }
    };
  
    getUser();
  }, [dispatch]);
  
  



  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar isLoggedIn={isAuthorized} />
  
        {/* Main content area should grow to push footer down */}
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/post" element={<PostAd />} />
            <Route path="/messages/:userId" element={<Message />} />
            <Route path="/conversations" element={<ConversationList />} />
            <Route path="/mypostings" element={<ProdByUser />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
  
        <Footer />
      </div>
  
      <Toaster />
    </Router>
  );
  
};

export default App;
