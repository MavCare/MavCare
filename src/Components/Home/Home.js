import React, {useEffect, useState} from 'react';
import {Nav,Navbar,NavDropdown,Container,Table, Form, InputGroup} from 'react-bootstrap';
import {useTable} from 'react-table';
import {BrowserRouter as Router, Routes,Route,useNavigate,Link} from 'react-router-dom';
import {About,Contact} from '../Info/Info';
import { Register,LogIn,LogOut } from '../User/User';
import {CheckIn,CheckOut,Add,Delete} from '../Update/Update';
import { getAllItems, getMyItems, getRoom } from '../../DB/DB';
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
  }, [navMenu, signedIn]);

  function getUserName() {
    var user = JSON.parse(localStorage.getItem("User"));
    return user.Fname;
  }

  function getAdmin() {
    var user = JSON.parse(localStorage.getItem("User"));
    if (user.Admin === '1') {
      return true;
    }
    return false;
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
      <Navbar bg="dark" data-bs-theme="dark" className="navbar" fixed="top">
        <Container className="justify-content-center" id="nav_container" style={{minWidth: "100%"}}>
          <Navbar.Brand as={Link} to="/" className="me-auto" style={{left: '0px'}}>
            MavCare
            <img src={logo} className="logo"/>
          </Navbar.Brand>
          <Navbar.Text className="ml-auto" id="room">
            {getRoomName()}
          </Navbar.Text>
          {navMenu && (
            <Navbar.Collapse className="me-auto" id="nav_items">
            <Nav>
            <Nav.Link as={Link} to="/my-items">My Items</Nav.Link>
            <NavDropdown title="Activity" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/all-usage">All Usage Activity</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/my-usage">My Usage Activity</NavDropdown.Item>
              {getAdmin() && <NavDropdown.Divider />}
              {getAdmin() && <NavDropdown.Item as={Link} to="/all-admin">All Admin Activity</NavDropdown.Item>}
              {getAdmin() && <NavDropdown.Item as={Link} to="/my-admin">My Admin Activity</NavDropdown.Item>}
            </NavDropdown>

            <NavDropdown title="Update" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/check-in">Check In</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/check-out">Check Out</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/set-clean">Set Clean</NavDropdown.Item>
            </NavDropdown>

            {getAdmin() && <NavDropdown title="Add" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/add-item">Add Item</NavDropdown.Item>
              {false && <NavDropdown.Item as={Link} to="/add-user">Add User</NavDropdown.Item>}
              <NavDropdown.Item as={Link} to="/add-room">Add Room</NavDropdown.Item>
            </NavDropdown>}

            {getAdmin() && <NavDropdown title="Delete" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/delete-item">Delete Item</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/delete-user">Delete User</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/delete-room">Delete Room</NavDropdown.Item>
            </NavDropdown>}

            {false && <Nav.Link as={Link} to="/about">About</Nav.Link>}
            {false && <Nav.Link as={Link} to="/contact">Contact</Nav.Link>}          
            <Nav.Link as={Link} to="/log-out">Log Out</Nav.Link>
            </Nav>
            </Navbar.Collapse>
          )}
          { signedIn &&
            <Navbar.Text className='nav_user'>
              Hello, {getUserName()}!
            </Navbar.Text>
          }
        </Container> 
      </Navbar>
      <br />
    </div>
  );
}

export const Home = () => {
  const [search, setSearch] = useState('');
  const [id_search, setIdSearch] = useState('');
  const [type_search, setTypeSearch] = useState('');
  const [room_search, setRoomSearch] = useState('');
  const [status_search, setStatusSearch] = useState('');
  const [user_search, setUserSearch] = useState('');
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

    function formatStatus(status) {
      if(status === "missing") {
        return {
          fontStyle: 'italic',
          color: 'red'
        };
      }
      else if(status === "free") {
        return {
          color: 'green'
        };
      }
      else if(status === "unclean") {
        return {
          color: 'purple'
        };
      }
      else if(status === "inUse") {
        return {
          color: 'blue'
        };
      }
    }

    return (
      <Container>
      <h1 className='text-center mt-4' style={{marginTop: 'auto'}}>All Items</h1>
      <Form>
        <InputGroup className='my-3'>
          <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
        </InputGroup>
      </Form>
      <Table striped bordered hover className="itemTable">
      <thead>
        <tr>
          <th className="itemID">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setIdSearch(e.target.value)} placeholder='Search by Item ID'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("ItemID")}>Item ID</div>
          </th>
          <th className="itemType">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setTypeSearch(e.target.value)} placeholder='Search by Item Type'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("ItemType")}>Item Type</div>
          </th>
          <th className="room">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setRoomSearch(e.target.value)} placeholder='Search by Room'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("Room")} className="room">Room</div>
          </th>
          <th className="status">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setStatusSearch(e.target.value)} placeholder='Search by Status'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("Status")}>Status</div>
          </th>
          <th className="lastUser">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setUserSearch(e.target.value)} placeholder='Search by Last User'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("LastUser")}>Last User</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {sortItems(rows).filter((item) => {
          return (
            ((id_search.toLowerCase().trim() === '' ? item.ItemID.toLowerCase().includes(id_search.toLowerCase().trim()) : item.ItemID.toLowerCase() === (id_search.toLowerCase().trim()))
            && item.ItemType.toLowerCase().includes(type_search.toLowerCase().trim())
            && item.Room.toLowerCase().includes(room_search.toLowerCase().trim())
            && item.Status.toLowerCase().includes(status_search.toLowerCase().trim())
            && item.LastUser.toLowerCase().includes(user_search.toLowerCase().trim()))
            && ((search.toLowerCase().trim() === '' ? item.ItemID.toLowerCase().includes(search.toLowerCase().trim()) : item.ItemID.toLowerCase() === (search.toLowerCase().trim())) 
            || item.ItemType.toLowerCase().includes(search.toLowerCase().trim())
            || item.Room.toLowerCase().includes(search.toLowerCase().trim())
            || item.Status.toLowerCase().includes(search.toLowerCase().trim())
            || item.LastUser.toLowerCase().includes(search.toLowerCase().trim()))
          )
        }).map((row, i) => (
          <tr key={i}>
            <td>{row.ItemID}</td>
            <td>{row.ItemType}</td>
            <td>{row.Room}</td>
            <td style={formatStatus(row.Status)}>{row.Status}</td>
            <td>{row.LastUser}</td>
          </tr>
        ))}
      </tbody>
    </Table>     
    </Container>
    )
}

export const MyItems = () => {
  const [search, setSearch] = useState('');
  const [id_search, setIdSearch] = useState('');
  const [type_search, setTypeSearch] = useState('');
  const [room_search, setRoomSearch] = useState('');
  const [status_search, setStatusSearch] = useState('');
  const [user_search, setUserSearch] = useState('');
  const [sort, setSort] = useState({sortKey: "ItemID", dir: "ASC"});
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

    useEffect(() => {
      if(localStorage.getItem("User") === null) {
        navigate("/login");
        window.location.reload();
      }
      getMyItems(JSON.parse(localStorage.getItem("User")).UserID)
      .then(items => {
        items = JSON.parse(items);
        setRows(items.Items);
      })
    },[rows]);

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

    function formatStatus(status) {
      if(status === "missing") {
        return {
          fontStyle: 'italic',
          color: 'red'
        };
      }
      else if(status === "free") {
        return {
          color: 'green'
        };
      }
      else if(status === "unclean") {
        return {
          color: 'purple'
        };
      }
      else if(status === "inUse") {
        return {
          color: 'blue'
        };
      }
    }

    return (
      <Container>
      <h1 className='text-center mt-4' style={{marginTop: 'auto'}}>My Items</h1>
      <Form>
        <InputGroup className='my-3'>
          <Form.Control onChange={(e) => setSearch(e.target.value)} placeholder='Search'/>
        </InputGroup>
      </Form>
      <Table striped bordered hover className="itemTable">
      <thead>
        <tr>
          <th className="itemID">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setIdSearch(e.target.value)} placeholder='Search by Item ID'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("ItemID")}>Item ID</div>
          </th>
          <th className="itemType">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setTypeSearch(e.target.value)} placeholder='Search by Item Type'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("ItemType")}>Item Type</div>
          </th>
          <th className="room">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setRoomSearch(e.target.value)} placeholder='Search by Room'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("Room")} className="room">Room</div>
          </th>
          <th className="status">
            <Form>
              <InputGroup className='my-3'>
                <Form.Control onChange={(e) => setStatusSearch(e.target.value)} placeholder='Search by Status'/>
              </InputGroup>
            </Form>
            <div onClick={() => chooseSort("Status")}>Status</div>
          </th>
        </tr>
      </thead>
      <tbody>
        {sortItems(rows).filter((item) => {
          return (
            ((id_search.toLowerCase().trim() === '' ? item.ItemID.toLowerCase().includes(id_search.toLowerCase().trim()) : item.ItemID.toLowerCase() === (id_search.toLowerCase().trim()))
            && item.ItemType.toLowerCase().includes(type_search.toLowerCase().trim())
            && item.Room.toLowerCase().includes(room_search.toLowerCase().trim())
            && item.Status.toLowerCase().includes(status_search.toLowerCase().trim()))
            && ((search.toLowerCase().trim() === '' ? item.ItemID.toLowerCase().includes(search.toLowerCase().trim()) : item.ItemID.toLowerCase() === (search.toLowerCase().trim())) 
            || item.ItemType.toLowerCase().includes(search.toLowerCase().trim())
            || item.Room.toLowerCase().includes(search.toLowerCase().trim())
            || item.Status.toLowerCase().includes(search.toLowerCase().trim()))
          )
        }).map((row, i) => (
          <tr key={i}>
            <td>{row.ItemID}</td>
            <td>{row.ItemType}</td>
            <td>{row.Room}</td>
            <td style={formatStatus(row.Status)}>{row.Status}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    </Container>
    )
}
