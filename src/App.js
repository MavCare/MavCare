import './App.css';
import React, {useEffect, useState} from 'react';
import {Nav,Navbar,Container,Row,Col} from 'react-bootstrap';
import {BrowserRouter as Router,Routes,Route,Link,Navigate} from 'react-router-dom';
import {About,Contact} from './Components/Info/Info';
import {NavBar, Home} from './Components/Home/Home';
import { Register,LogIn,LogOut, ResetPassword } from './Components/User/User';
import {CheckIn,CheckOut,SetClean,Add,Delete} from './Components/Update/Update';
import logo from './Components/images/logo.png'

var userID;
var name;

export const Heading = () => {
  return (
    <Container>
      <Row className="heading">
        <Col className="app-name"><h1>MavCare</h1></Col>
        <Col className="logo"><img src={logo}/></Col>
      </Row>      
    </Container>
  )
}

function App() {
  const [loginPage, setLoginPage] = useState();
  useEffect(() => {
    if(localStorage.getItem("User") === null) {
      setLoginPage(true);
    } else {
      setLoginPage(false);
    }
    var url = "http://localhost:8181/JavaAPI/rest/login/user1@site.com/password1/*/*";
    //fetch(url, {mode: 'no-cors'}).then(user => user.json()).then(data => console.log(data));
  },[setLoginPage]);

  return (
    <Router>
    <div>
      <Container className="App">  
        <NavBar className="navbar"/>
          <Row className="login">
            <Col >
          {loginPage && (<Navigate to="/login"/>)}
          </Col>
          </Row>
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
