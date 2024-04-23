import './App.css';
import React, {createContext, useEffect, useState} from 'react';
import {Nav,Navbar,Container,Row,Col} from 'react-bootstrap';
import {BrowserRouter as Router,Routes,Route,Switch,Redirect,Link,Navigate, useNavigate} from 'react-router-dom';
import {About,Contact} from './Components/Info/Info';
import {NavBar, Home} from './Components/Home/Home';
import { Register,LogIn,LogOut, ResetPassword } from './Components/User/User';
import {CheckIn,CheckOut,SetClean,Add,Delete} from './Components/Update/Update';
import {getRoom} from './DB/DB.js';
import logo from './Components/images/logo.png'

function App() {
  //const [room, setRoom] = useState();
  useEffect(() => {
    getRoom().then((room) => {
      localStorage.setItem("Room",room);
    })
  });

  return (
    <Router>
    <div>
      <Container className="App">  
        <NavBar className="navbar"/>
      </Container> 
    <div>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/check-in" element={<CheckIn/>}/>
      <Route path="/check-out" element={<CheckOut/>}/>
      <Route path="/add" element={<Add/>}/>
      <Route path="/delete" element={<Delete/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/login" element={<LogIn/>}/>
      <Route path="/log-out" element={<LogOut/>}/>
      <Route path="/reset-pass" element={<ResetPassword/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/set-clean" element={<SetClean/>}/>
    </Routes>
    </div>
    </div>
    </Router>
  );
}

export default App;
