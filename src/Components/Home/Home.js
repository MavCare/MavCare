import React, {useEffect, useState} from 'react';
import {Nav,Navbar,Container,Table, Form, InputGroup} from 'react-bootstrap';
import {useTable} from 'react-table';
import {BrowserRouter as Router, Routes,Route,useNavigate,Link} from 'react-router-dom';
import {About,Contact} from '../Info/Info';
import { Register,LogIn,LogOut } from '../User/User';
import {CheckIn,CheckOut,Add,Delete} from '../Update/Update';
import { getAllItems, getRoom } from '../../DB/DB';
import logo from '../images/logo.png';
import './Home.css'

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
    getRoom().then((room) => {
      localStorage.setItem("Room",room);
    })
  }, [setNavMenu, setSignedIn]);

  function getUserName() {
    var user = JSON.parse(localStorage.getItem("User"));
    return user.Fname;
  }

  function getRoomName() {
    var room = localStorage.getItem("Room");
    if(room !== "no room identified" && room !== null && room!== undefined) {
      console.log(room);
      room = JSON.parse(room);
      return room.RoomName;
    } else {
      return "";
    }
  }

  return (
    <div>
      <Navbar bg="dark" data-bs-theme="dark" className="navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">
            MavTrack
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
            </Nav>
          )}

          { signedIn &&
            <Navbar.Text className='nav_user'>
              Hello, {getUserName()}!
            </Navbar.Text>
          }
          <Navbar.Text className="nav_room">
            {getRoomName()}
          </Navbar.Text>
        </Container> 
      </Navbar>
      <br />
    </div>
  );
}

export const Home = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({sortKey: "ItemID", dir: "ASC"});
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

    useEffect(() => {
      if(localStorage.getItem("User") === null) {
        navigate("/login");
        window.location.reload();
      }
      getAllItems()
      .then(items => {
        items = JSON.parse(items);
        setRows(items.Items);
      })
    },[rows]);

    /*const sorting = (column) => {
      if(order === "ASC"){
        const sorted = [...rows].sort((a,b) => 
          a[column].toLowerCase() > b[column].toLowerCase() ? 1 : -1
        );
        setRows(sorted);
        setOrder("DSC");
      }
      else if(order === "DSC"){
        const sorted = [...rows].sort((a,b) => 
          a[column].toLowerCase() < b[column].toLowerCase() ? 1 : -1
        );
        setRows(sorted);
        setOrder("ASC");
      }
    }*/

    function chooseSort(column) {
      setSort({
          sortKey: column,
          dir: column === sort.sortKey ? sort.dir === 'ASC' ? 'DSC' : 'ASC' : 'DSC'
        })
    }

    function sortItems(itemList) {
      if (sort.dir === 'ASC') {
        if(sort.sortKey === "ItemID") {
          return itemList.sort((a,b) => 
            parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? 1 : -1
          );
        }
        return itemList.sort((a,b) => 
          a[sort.sortKey] > b[sort.sortKey] ? 1 : -1
        );
      }
      else {
        if(sort.sortKey === "ItemID") {
          return itemList.sort((a,b) => 
            parseInt(a[sort.sortKey]) > parseInt(b[sort.sortKey]) ? -1 : 1
          );
        }
        return itemList.sort((a,b) =>
          a[sort.sortKey] > b[sort.sortKey] ? -1 : 1
        );
      }
    }

    return (
      <Container>
      <h1 className='text-center mt-4'>All Items</h1>
      <Form>
        <InputGroup className='my-3'>
          <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search Items'/>
        </InputGroup>
      </Form>
      <Table striped bordered hover className="itemTable">
      <thead>
        <tr>
          <th onClick={() => chooseSort("ItemID")} className="itemID">Item ID</th>
          <th onClick={() => chooseSort("ItemType")} className="itemType">Item Type</th>
          <th onClick={() => chooseSort("Room")} className="room">Room</th>
          <th onClick={() => chooseSort("Status")} className="status">Status</th>
          <th onClick={() => chooseSort("LastUser")} className="lastUser">Last User</th>
        </tr>
      </thead>
      <tbody>
        {sortItems(rows).filter((item) => {
          return search.toLowerCase() === ''
          ? item
          : (item.ItemID.toLowerCase().includes(search) 
            || item.ItemType.toLowerCase().includes(search)
            || item.Room.toLowerCase().includes(search)
            || item.Status.toLowerCase().includes(search)
            || item.LastUser.toLowerCase().includes(search))
        }).map((row, i) => (
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