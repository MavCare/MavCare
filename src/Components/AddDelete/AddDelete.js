import React, {useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route,Link,Navigate, useNavigate} from 'react-router-dom';
import {Container, Table} from 'react-bootstrap';
import { getScannedItems, getUsers, addItems, deleteUsers, undeleteUser, deleteItems, undeleteItem, getEpcs, getRooms, getRoom, checkIn, checkOut, setClean, getItemTypes, addRooms, deleteRooms, undeleteRoom} from '../../DB/DB';

export const AddItem = () => {
    const [rows, setRows] = useState([]);
    const [all_epcs, setAllEpcs] = useState([]);
    const [item_types, setItemTypes] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [item_type_list, setItemTypeList] = useState([]);
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [Added, setAdded] = useState(false);
    const [removedEpcs, setRemovedEpcs] = useState([]);
    const [admin, setAdmin] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        setAdmin(JSON.parse(localStorage.getItem("User")).UserID);
        if(!roomScanned) {
            getRoomSelections();
        } else {
            setRoom(localStorage.getItem("Room"));
        }
        getItemTypeList();
        if(stopScan !== true) {
            getEpcs()
            .then(epcs => {
                epcs = JSON.parse(epcs);
                epcs = epcs.EPC;
                let tuples = [];
                for(let i = 0; i < epcs.length; i++) {
                    tuples.push(epcs[i]);
                } 
                all_epcs.push(tuples);
            })
            .then(() => getRows());
        }
    },[navigate, rows, stopScan, all_epcs, removedEpcs]);

    function getRows() {
        var epcs = [];
        for(let i=0; i<all_epcs.length; i++) {
            for(let j=0; j<all_epcs[i].length; j++) {
                if(!removedEpcs.includes(all_epcs[i][j])) {
                    epcs.push(all_epcs[i][j]);
                }
            }
        }
        epcs = epcs.filter((epc, ind, self) => 
            ind === self.findIndex((tupple) => (
                tupple === epc
            ))
        );
        setRows(epcs);
    }

    function getRoomSelections() {
        getRooms().then((roomList) => {
            roomList = JSON.parse(roomList);
            roomList = roomList.Rooms;
            setRooms(roomList);
        })
    }

    function getItemTypeList() {
        getItemTypes().then((itemTypeList) => {
            itemTypeList = JSON.parse(itemTypeList);
            itemTypeList = itemTypeList.ItemTypes;
            setItemTypeList(itemTypeList);
        })
    }

    const saveRoom = (event) => {
        setRoom(event.target.value);
    }

    function addScannedItems() {
        setStopScan(true)
        if(room === null || room === undefined) {
            setResult(`Please select room first.`);
            setStopScan(false);
            return;
        }
        
        var roomID = JSON.parse(room).RoomID;
        var epcs = rows;
        var items = [];
        for(let i=0; i<rows.length; i++) {
            const json = {
                "EPC": rows[i],
                "ItemType": item_types[i]
            }
            items.push(JSON.stringify(json));
        }
        addItems(items, roomID, admin).then(resp => {       
           setResult("Items successfully added!");     
           setAdded(true);
        })
    }
    
    const itemTypeChange = (event, i) => {
        const type_inputs = [...item_types];
        type_inputs[i] = (event.target.value).trim();
        setItemTypes(type_inputs);
    }

    function removeEpc(epc) {
        var new_epcs = []
        for(let i=0; i<all_epcs.length; i++) {
            const arr = all_epcs[i].filter(tag => tag !== epc);
            new_epcs.push(arr)
        }
        setAllEpcs(new_epcs)
        removedEpcs.push(epc);
        if(stopScan === true) {
            getRows();
        }
        setRemovedEpcs([]);
    }

    return (
        <Container>
            {!Added && <h3 className="scanItems">Scan items to be added (one at a time) ...</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="epc">EPC</th>
                    <th className="itemType">Item Type</th>
                    {!Added && <th className="remove">Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={i} className="tuple">
                        <td>{row}</td>
                        <td>
                            <select value={item_types[i]} onChange={(e) => itemTypeChange(e, i)} style={{ marginRight: '20px' }}>
                                <option>Select Item Type</option>
                                {item_type_list.map((type, j) => (
                                    <option key={j} value={type}>{type}</option>
                                ))}
                            </select>
                            <input type="text" placeholder="Enter Item Type" onChange={(e) => itemTypeChange(e, i)}/>
                            {false && 
                            <div>
                            <input
                                type="text"
                                placeholder="Item Type"
                                value={item_types[i]}
                                onChange={(e) => itemTypeChange(e, i)}
                                list="type_options"
                            />
                            <datalist id="type_options">
                                {item_type_list.map((type, j) => (
                                    <option key={j} value={type}>{type}</option>
                                ))}
                            </datalist>
                            </div> }
                        </td>
                       {!Added && <td><button onClick={() => removeEpc(row)} style={{width:40, fontSize:17}}>x</button></td>}
                    </tr>
                    ))}
                </tbody>
            </Table>
            <br></br>
            {!roomScanned && <div>
            <select onChange={saveRoom}>
                <option>Select Room</option>
                {rooms.map((room, i) => (
                    <option key={room.RoomID} value={JSON.stringify(room)}>{room.RoomName}</option>
                ))}
            </select>
            </div>}
            <br></br>
            <div>
            {!Added &&
            <button className="checkInButton" onClick={() => addScannedItems()}>
            Finish Adding Items</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const DeleteItem = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [undeleted, setUndeleted] = useState([]);
    const [removedItems, setRemovedItems] = useState([]);
    const [admin, setAdmin] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        setAdmin(JSON.parse(localStorage.getItem("User")).UserID);
        if(stopScan !== true) {
            getScannedItems()
            .then(items => {
                items = JSON.parse(items);
                items = items.Items;
                let tuples = [];
                for(let i = 0; i < items.length; i++) {
                    tuples.push(JSON.parse(items[i]));
                } 
                all_items.push(tuples);
            })
            .then(() => getRows());
        }
    },[navigate, rows, stopScan, all_items, removedItems]);

    function getRows() {
        var items = [];
        for(let i=0; i<all_items.length; i++) {
            for(let j=0; j<all_items[i].length; j++) {
                if(!removedItems.includes(all_items[i][j].ItemID)) {
                    items.push(all_items[i][j]);
                }
            }
        }
        items = items.filter((item, ind, self) => 
            ind === self.findIndex((tupple) => (
                tupple.ItemID === item.ItemID
            ))
        );
        setRows(items);
    }


    function deleteScannedItems() {
        setStopScan(true)
        
        var itemIDs = rows.map((item) => {
            return item.ItemID;
        });
        deleteItems(itemIDs, admin).then(resp => {       
            setResult("Items successfully deleted!");     
            setDeleted(true);
        })
    }

    function undelete(itemID) {
        undeleteItem(itemID, admin).then(resp => {
            setResult(`Item ${itemID} undeleted successfully!`);
            undeleted[itemID] = true;
        })
    }

    function removeItem(id) {
        var new_items = []
        for(let i=0; i<all_items.length; i++) {
            const arr = all_items[i].filter(item => item.ItemID !== id);
            new_items.push(arr)
        }
        setAllItems(new_items)
        removedItems.push(id);
        if(stopScan === true) {
            getRows();
        }
        setRemovedItems([]);
    }

    return (
        <Container>
            {!deleted && <h3 className="scanItems">Scan items to be deleted...</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    {!deleted && <th className="remove">Remove</th>}
                    {deleted && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
                        {!deleted && <td><button onClick={() => removeItem(row.ItemID)} style={{width:40, fontSize:17}}>x</button></td>}
                        {deleted && <td>{!undeleted[row.ItemID] && <button onClick={() => undelete(row.ItemID) }>undelete</button>}</td>}
                    </tr>
                    ))}
                </tbody>
            </Table>
            <br></br>
            <br></br>
            <div>
            {!deleted &&
            <button className="checkInButton" onClick={() => deleteScannedItems()}>
            Finish Deleting Items</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const AddRoom = () => {
    const [rows, setRows] = useState([]);
    const [all_epcs, setAllEpcs] = useState([]);
    const [room_names, setRoomNames] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [Added, setAdded] = useState(false);
    const [removedEpcs, setRemovedEpcs] = useState([]);
    const [admin, setAdmin] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        setAdmin(JSON.parse(localStorage.getItem("User")).UserID);
        if(stopScan !== true) {
            getEpcs()
            .then(epcs => {
                epcs = JSON.parse(epcs);
                epcs = epcs.EPC;
                let tuples = [];
                for(let i = 0; i < epcs.length; i++) {
                    tuples.push(epcs[i]);
                } 
                all_epcs.push(tuples);
            })
            .then(() => getRows());
        }
    },[navigate, rows, stopScan, all_epcs, removedEpcs, Added]);

    function getRows() {
        var epcs = [];
        for(let i=0; i<all_epcs.length; i++) {
            for(let j=0; j<all_epcs[i].length; j++) {
                if(!removedEpcs.includes(all_epcs[i][j])) {
                    epcs.push(all_epcs[i][j]);
                }
            }
        }
        epcs = epcs.filter((epc, ind, self) => 
            ind === self.findIndex((tupple) => (
                tupple === epc
            ))
        );
        setRows(epcs);
    }

    function addScannedRooms() {
        setStopScan(true)
        var epcs = rows;
        var rooms = [];
        for(let i=0; i<rows.length; i++) {
            const json = {
                "EPC": rows[i],
                "RoomName": room_names[i]
            }
            rooms.push(JSON.stringify(json));
        }
        addRooms(rooms, admin).then(resp => {       
           setResult("Rooms successfully added!");     
           setAdded(true);
        })
    }
    
    const roomNameChange = (event, i) => {
        const name_inputs = [...room_names];
        name_inputs[i] = (event.target.value).trim();
        setRoomNames(name_inputs);
    }

    function removeEpc(epc) {
        var new_epcs = []
        for(let i=0; i<all_epcs.length; i++) {
            const arr = all_epcs[i].filter(tag => tag !== epc);
            new_epcs.push(arr)
        }
        setAllEpcs(new_epcs)
        removedEpcs.push(epc);
        if(stopScan === true) {
            getRows();
        }
        setRemovedEpcs([]);
    }

    return (
        <Container>
            {!Added && <h3 className="scanItems">Scan Room Tags (one at a time) ...</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="epc">EPC</th>
                    <th className="roomName">Room Name</th>
                    {!Added && <th className="remove">Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={i} className="tuple">
                        <td>{row}</td>
                        <td>
                            <input type="text" placeholder="Enter Room Name" onChange={(e) => roomNameChange(e, i)}/>
                        </td>
                       {!Added && <td><button onClick={() => removeEpc(row)} style={{width:40, fontSize:17}}>x</button></td>}
                    </tr>
                    ))}
                </tbody>
            </Table>
            <br></br>
            <br></br>
            <div>
            {!Added &&
            <button className="checkInButton" onClick={() => addScannedRooms()}>
            Finish Adding Rooms</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const DeleteRoom = () => {
    const [rows, setRows] = useState([]);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState([]);
    const [undeleted, setUndeleted] = useState([]);
    const [admin, setAdmin] = useState('');
    const [selectedRooms, setSelectedRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        setAdmin(JSON.parse(localStorage.getItem("User")).UserID);
        getRooms().then(rooms => {
            rooms = JSON.parse(rooms).Rooms;
            setRows(rooms);
            for(let i = 0; i<rooms.length; i++) {
                deleted[rooms[i].RoomID] = false;
            }
        })
    },[]);

    function deleteSelectedRooms() {
        if(selectedRooms.length === 0) {
            setResult("Please select at least one room to delete.");
            return
        }
        var roomIDs = selectedRooms.map((room) => {
            return room.RoomID;
        });
        deleteRooms(roomIDs, admin).then(resp => {       
            setResult("Rooms successfully deleted!");   
            for(let i=0; i<roomIDs.length; i++)  {
                deleted[roomIDs[i]] = true;
            }
        })
    }

    function undelete(room) {
        undeleteRoom(room.RoomID, admin).then(resp => {
            setResult(`${room.RoomName} undeleted successfully!`);
            deleted[room.RoomID] = false;
        })
    }

    const setRooms = (event, room) => {
        const selected = event.target.checked;
        if (selected) {
            setSelectedRooms([...selectedRooms, room]);
        } else {
            setSelectedRooms(selectedRooms.filter(element => element !== room));
        }

        setResult("");
    }

    const someDeleted = () => {
        for(let i=0; i<rows.length; i++) {
            if(deleted[rows[i].RoomID]) {
                return true;
            }
        }
        return false;
    }

    return (
        <Container>
            <h3 className="scanItems">Choose Rooms to be deleted</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="roomID">Room ID</th>
                    <th className="roomName">Room Name</th>
                    <th className="delete">Delete</th>
                    {someDeleted() && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.RoomID} className="tuple">
                        <td>{row.RoomID}</td>
                        <td>{row.RoomName}</td>
                        <td><input type="checkbox" onChange={(e) => setRooms(e, row)}/></td>
                        {someDeleted() && <td>{deleted[row.RoomID] && <button onClick={() => undelete(row) }>undelete</button>}</td>}
                    </tr>
                    ))}
                </tbody>
            </Table>
            <br></br>
            <br></br>
            <div>
            <button className="checkInButton" onClick={() => deleteSelectedRooms()}>Delete Selected Rooms</button>
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const AddUser = () => {
    const [rows, setRows] = useState([]);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState([]);
    const [undeleted, setUndeleted] = useState([]);
    const [admin, setAdmin] = useState('');
    const [selectedRooms, setSelectedRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        setAdmin(JSON.parse(localStorage.getItem("User")).UserID);
        getRooms().then(rooms => {
            rooms = JSON.parse(rooms).Rooms;
            setRows(rooms);
            for(let i = 0; i<rooms.length; i++) {
                deleted[rooms[i].RoomID] = false;
            }
        })
    },[]);

    function deleteSelectedRooms() {
        if(selectedRooms.length === 0) {
            setResult("Please select at least one room to delete.");
            return
        }
        var roomIDs = selectedRooms.map((room) => {
            return room.RoomID;
        });
        deleteRooms(roomIDs, admin).then(resp => {       
            setResult("Rooms successfully deleted!");   
            for(let i=0; i<roomIDs.length; i++)  {
                deleted[roomIDs[i]] = true;
            }
        })
    }

    function undelete(room) {
        undeleteRoom(room.RoomID, admin).then(resp => {
            setResult(`${room.RoomName} undeleted successfully!`);
            deleted[room.RoomID] = false;
        })
    }

    const setRooms = (event, room) => {
        const selected = event.target.checked;
        if (selected) {
            setSelectedRooms([...selectedRooms, room]);
        } else {
            setSelectedRooms(selectedRooms.filter(element => element !== room));
        }

        setResult("");
    }

    const someDeleted = () => {
        for(let i=0; i<rows.length; i++) {
            if(deleted[rows[i].RoomID]) {
                return true;
            }
        }
        return false;
    }

    return (
        <Container>
            <h3 className="scanItems">Choose Rooms to be deleted</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="roomID">Room ID</th>
                    <th className="roomName">Room Name</th>
                    <th className="delete">Delete</th>
                    {someDeleted() && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.RoomID} className="tuple">
                        <td>{row.RoomID}</td>
                        <td>{row.RoomName}</td>
                        <td><input type="checkbox" onChange={(e) => setRooms(e, row)}/></td>
                        {someDeleted() && <td>{deleted[row.RoomID] && <button onClick={() => undelete(row) }>undelete</button>}</td>}
                    </tr>
                    ))}
                </tbody>
            </Table>
            <br></br>
            <br></br>
            <div>
            <button className="checkInButton" onClick={() => deleteSelectedRooms()}>Delete Selected Rooms</button>
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const DeleteUser = () => {
    const [rows, setRows] = useState([]);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState([]);
    const [admin, setAdmin] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        setAdmin(JSON.parse(localStorage.getItem("User")).UserID);
        getUsers().then(users => {
            users = JSON.parse(users).Users;
            setRows(users.filter(user => {return user.Active === '1';}));
            for(let i = 0; i<users.length; i++) {
                deleted[users[i].UserID] = false;
            }
        })
    },[]);

    function deleteSelectedUsers() {
        if(selectedUsers.length === 0) {
            setResult("Please select at least one user to delete.");
            return
        }
        var userIDs = selectedUsers.map((user) => {
            return user.UserID;
        });
        deleteUsers(userIDs, admin).then(resp => {       
            setResult("Users successfully deleted!");   
            for(let i=0; i<userIDs.length; i++)  {
                deleted[userIDs[i]] = true;
            }
        })
    }

    function undelete(user) {
        undeleteUser(user.UserID, admin).then(resp => {
            setResult(`User ${user.UserID} undeleted successfully!`);
            deleted[user.UserID] = false;
        })
    }

    const setUsers = (event, user) => {
        const selected = event.target.checked;
        if (selected) {
            setSelectedUsers([...selectedUsers, user]);
        } else {
            setSelectedUsers(selectedUsers.filter(element => element !== user));
        }

        setResult("");
    }

    const someDeleted = () => {
        for(let i=0; i<rows.length; i++) {
            if(deleted[rows[i].UserID]) {
                return true;
            }
        }
        return false;
    }

    return (
        <Container>
            <h3 className="scanItems">Choose Users to be deleted</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="roomID">User ID</th>
                    <th className="roomName">Username</th>
                    <th className="roomID">Fname</th>
                    <th className="roomName">Lname</th>
                    <th className="delete">Admin</th>
                    <th className=""></th>
                    {someDeleted() && <th className="undelete">Undelete</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.UserID} className="tuple">
                        <td>{row.UserID}</td>
                        <td>{row.Username}</td>
                        <td>{row.Fname}</td>
                        <td>{row.Lname}</td>
                        <td>{row.Admin}</td>
                        <td><input type="checkbox" onChange={(e) => setUsers(e, row)}/></td>
                        {someDeleted() && <td>{deleted[row.UserID] && <button onClick={() => undelete(row) }>undelete</button>}</td>}
                    </tr>
                    
                    ))}
                </tbody>
            </Table>
            <br></br>
            <br></br>
            <div>
            <button className="checkInButton" onClick={() => deleteSelectedUsers()}>Delete Selected Users</button>
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}