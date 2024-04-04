import React, {useEffect, useState} from 'react';
import {Nav,Navbar,Container,Table} from 'react-bootstrap';
import {BrowserRouter as Router, Routes,Route,Link} from 'react-router-dom';
//import {DataTable,Column} from 'primereact';
import {About,Contact} from '../Info/Info';
import { Register,LogIn,LogOut } from '../User/User';
import {CheckIn,CheckOut,Add,Delete} from '../Update/Update';
import { getAllItems } from '../../DB/DB';
import logo from '../images/logo.png';
import './Home.css'
//import 'primereact/resources/themes/lara-light-indigo/theme.css';
//import 'primereact/resources/primereact.min.css';

export const NavBar = () => {
  const [navMenu, setNavMenu] = useState();
  const [signedIn, setSignedIn] = useState();
  useEffect(() => {
    if(localStorage.getItem("User") === null) {
        setNavMenu(false);
        setSignedIn(false);
    } else {
      setNavMenu(true);
      setSignedIn(true);
    }
  }, [setNavMenu, setSignedIn]);

  function getName() {
    var user = JSON.parse(localStorage.getItem("User"));
    return user.Fname;
  }

  return (
    <div>
      <Navbar bg="dark" data-bs-theme="dark" className="navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">
            MavCare
            <img src={logo} className="logo"/>
          </Navbar.Brand>
          {navMenu && (
            <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/check-in">Check In</Nav.Link>
            <Nav.Link as={Link} to="/check-out">Check Out</Nav.Link>
            <Nav.Link as={Link} to="/set-clean">Set Clean</Nav.Link>
            <Nav.Link as={Link} to="/add">Add</Nav.Link>
            <Nav.Link as={Link} to="/delete">Delete</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            <Nav.Link as={Link} to="/log-out">Log Out</Nav.Link>
            <></>
            </Nav>
          )}
          { signedIn &&
            <Navbar.Text className='nav_user'>
              Hello, {getName()}!
            </Navbar.Text>}
        </Container> 
      </Navbar>
      <br />
    </div>
  );
}

export const Home = () => {
  const [rows, setRows] = useState([]);

    useEffect(() => {
      getAllItems()
      .then(items => {
        items = JSON.parse(items);
        setRows(items.Items);
      })
    },[]);

    return (
      <Container>
      <Table striped bordered hover className="itemTable">
      <thead>
        <tr>
          <th className="itemID">Item ID</th>
          <th className="itemType">Item Type</th>
          <th className="room">Room</th>
          <th className="status">Status</th>
          <th className="lastUser">LastUser</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td>{row.ItemID}</td>
            <td>{row.ItemType}</td>
            <td>{row.Room}</td>
            <td>{row.Status}</td>
            <td>{row.LastUser}</td>
          </tr>
        ))}
      </tbody>
    </Table>
            
    </Container>
    )
}