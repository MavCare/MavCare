import React, {useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route,Link,Navigate, useNavigate} from 'react-router-dom';
import {Container, Table} from 'react-bootstrap';
import { getScannedItems, addItems, deleteItems, undeleteItem, getEpcs, getRooms, getRoom, checkIn, checkOut, setClean, getItemTypes} from '../../DB/DB';

export const CheckIn = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [checkedIn, setCheckedIn] = useState(false);
    const [removedItems, setRemovedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        if(!roomScanned) {
            getRoomSelections();
        } else {
            setRoom(localStorage.getItem("Room"));
        }
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

    function getRoomSelections() {
        getRooms().then((roomList) => {
            roomList = JSON.parse(roomList);
            roomList = roomList.Rooms;
            setRooms(roomList);
        })
    }

    const saveRoom = (event) => {
        setRoom(event.target.value);
    }

    function checkInItems() {
        setStopScan(true)
        if(room === null || room === undefined) {
            setResult(`Please select room first.`);
            setStopScan(false);
            return;
        }
        for(let i=0; i<rows.length; i++) {
            if(rows[i].Status === "inUse" || rows[i].Status === "missing") {
                setResult(`Item ${rows[i].ItemID} has to be checked out before it can be checked in.`);
                setStopScan(false);
                return;
            } else if(rows[i].Status === "unclean") {
                setResult(`Item ${rows[i].ItemID} has to be set clean before it can be checked in.`);
                setStopScan(false);
                return;
            } 
        }
        var user = JSON.parse(localStorage.getItem("User"));
        var userID = user.UserID;
        var roomID = JSON.parse(room).RoomID;
        var itemIDs = rows.map((item) => {
            return item.ItemID;
        });
        checkIn(itemIDs, roomID, userID).then(resp => {       
            setResult("Items successfully checked in!");     
            setCheckedIn(true);
        })
    }

    function removeItem(id) {
        var new_items = []
        for(let i=0; i<all_items.length; i++) {
            const arr = all_items[i].filter(item => item.ItemID !== id);
            new_items.push(arr)
        }
        setAllItems(new_items);
        removedItems.push(id);
        if(stopScan === true) {
            getRows();
        }
        setRemovedItems([]);
    }

    return (
        <Container>
            {!checkedIn && <h3 className="scanItems">Scan items to be checked in...</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    {!checkedIn && <th className="remove">Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
                        {!checkedIn && <td><button onClick={() => removeItem(row.ItemID)} style={{width:40, fontSize:17}}>x</button></td>}
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
            {!checkedIn &&
            <button className="checkInButton" onClick={() => checkInItems()}>
            Complete Check In</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const CheckOut = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [checkedOut, setCheckedOut] = useState(false);
    const [removedItems, setRemovedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        if(!roomScanned) {
            getRoomSelections();
        } else {
            setRoom(localStorage.getItem("Room"));
        }
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
    },[navigate, rows, stopScan, removedItems, all_items]);

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

    function getRoomSelections() {
        getRooms().then((roomList) => {
            roomList = JSON.parse(roomList);
            roomList = roomList.Rooms;
            setRooms(roomList);
        })
    }

    const saveRoom = (event) => {
        setRoom(event.target.value);
    }

    function checkOutItems() {
        setStopScan(true)
        if(room === null || room === undefined) {
            setResult(`Please select room first.`);
            setStopScan(false);
            return;
        }
        for(let i=0; i<rows.length; i++) {
            if(rows[i].Status !== "inUse" && rows[i].Status !== "missing") {
                setResult(`Item ${rows[i].ItemID} has to be checked in before it can be checked out.`);
                setStopScan(false);
                return;
            }
        }
        
        var roomID = JSON.parse(room).RoomID;
        var itemIDs = rows.map((item) => {
            return item.ItemID;
        });
        checkOut(itemIDs, roomID).then(resp => {       
            setResult("Items successfully checked out!");     
            setCheckedOut(true);
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
            {!checkedOut && <h3 className="scanItems">Scan items to be checked out...</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    {!checkedOut && <th className="remove">Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
                        {!checkedOut && <td><button onClick={() => removeItem(row.ItemID)} style={{width:40, fontSize:17}}>x</button></td>}
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
            {!checkedOut &&
            <button className="checkInButton" onClick={() => checkOutItems()}>
            Complete Check Out</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

export const SetClean = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [setCleaned, setSetCleaned] = useState(false);
    const [removedItems, setRemovedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
        } 
        if(!roomScanned) {
            getRoomSelections();
        } else {
            setRoom(localStorage.getItem("Room"));
        }
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

    function getRoomSelections() {
        getRooms().then((roomList) => {
            roomList = JSON.parse(roomList);
            roomList = roomList.Rooms;
            setRooms(roomList);
        })
    }

    const saveRoom = (event) => {
        setRoom(event.target.value);
    }

    function SetItemsClean() {
        setStopScan(true)
        if(room === null || room === undefined) {
            setResult(`Please select room first.`);
            setStopScan(false)
            return;
        }
        
        var roomID = JSON.parse(room).RoomID;
        var itemIDs = rows.map((item) => {
            return item.ItemID;
        });
        setClean(itemIDs, roomID).then(resp => {       
            setResult("Items successfully set clean!");     
            setSetCleaned(true);
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
            {!setCleaned && <h3 className="scanItems">Scan items to be set clean...</h3>}
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    {!setCleaned && <th className="remove">Remove</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
                        {!setCleaned && <td><button onClick={() => removeItem(row.ItemID)} style={{width:40, fontSize:17}}>x</button></td>}
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
            {!setCleaned &&
            <button className="checkInButton" onClick={() => SetItemsClean()}>
            Complete Set Clean</button>}
            </div>
            <br></br>
            <p>{result}</p>
        </Container>
    )
}

