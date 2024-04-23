import React, {useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route,Link,Navigate, useNavigate} from 'react-router-dom';
import {Container, Table} from 'react-bootstrap';
import { getScannedItems, addItems, deleteItems, undeleteItem, getEpcs, getRooms, getRoom, checkIn, checkOut, setClean} from '../../DB/DB';

export const CheckIn = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [checkedIn, setCheckedIn] = useState(false);
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
    },[navigate, rows, stopScan]);

    function getRows() {
        var items = [];
        for(let i=0; i<all_items.length; i++) {
            for(let j=0; j<all_items[i].length; j++) {
                items.push(all_items[i][j]);
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
            return;
        }
        for(let i=0; i<rows.length; i++) {
            if(rows[i].Status === "inUse") {
                setResult(`Item ${rows[i].ItemID} has to be checked out before it can be checked in.`);
                return;
            } else if(rows[i].Status === "unclean") {
                setResult(`Item ${rows[i].ItemID} has to be set clean before it can be checked in.`);
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

    return (
        <Container>
            <h3 className="scanItems">Scan items to be checked in...</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
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
    },[navigate, rows, stopScan]);

    function getRows() {
        var items = [];
        for(let i=0; i<all_items.length; i++) {
            for(let j=0; j<all_items[i].length; j++) {
                items.push(all_items[i][j]);
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
            return;
        }
        for(let i=0; i<rows.length; i++) {
            if(rows[i].Status !== "inUse") {
                setResult(`Item ${rows[i].ItemID} has to be checked in before it can be checked out.`);
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

    return (
        <Container>
            <h3 className="scanItems">Scan items to be checked out...</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
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

export const Add = () => {
    const [rows, setRows] = useState([]);
    const [all_epcs, setAllEpcs] = useState([]);
    const [item_types, setItemTypes] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [Added, setAdded] = useState(false);
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
    },[navigate, rows, stopScan]);

    function getRows() {
        var epcs = [];
        for(let i=0; i<all_epcs.length; i++) {
            for(let j=0; j<all_epcs[i].length; j++) {
                epcs.push(all_epcs[i][j]);
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

    const saveRoom = (event) => {
        setRoom(event.target.value);
    }

    function addScannedItems() {
        setStopScan(true)
        if(room === null || room === undefined) {
            setResult(`Please select room first.`);
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
        addItems(items, roomID).then(resp => {       
           setResult("Items successfully added!");     
           setAdded(true);
        })
    }
    
    const itemTypeChange = (event, i) => {
        const type_inputs = [...item_types];
        type_inputs[i] = (event.target.value).trim();
        setItemTypes(type_inputs);
    }

    return (
        <Container>
            <h3 className="scanItems">Scan items to be added (one at a time) ...</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="epc">EPC</th>
                    <th className="itemType">Item Type</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={i} className="tuple">
                        <td>{row}</td>
                        <td><input type="text" value={item_types[i]} onChange={(e) => itemTypeChange(e, i)} /></td>
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

export const Delete = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [undeleted, setUndeleted] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("User") === null) {
          navigate("/login");
          window.location.reload();
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
    },[navigate, rows, stopScan]);

    function getRows() {
        var items = [];
        for(let i=0; i<all_items.length; i++) {
            for(let j=0; j<all_items[i].length; j++) {
                items.push(all_items[i][j]);
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
        deleteItems(itemIDs).then(resp => {       
            setResult("Items successfully deleted!");     
            setDeleted(true);
        })
    }

    function undelete(itemID) {
        undeleteItem(itemID).then(resp => {
            setResult(`Item ${itemID} undeleted successfully!`);
            undeleted[itemID] = true;
        })
    }

    return (
        <Container>
            <h3 className="scanItems">Scan items to be deleted...</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    {deleted && <th className="undelete"></th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
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

export const SetClean = () => {
    const [rows, setRows] = useState([]);
    const [all_items, setAllItems] = useState([]);
    const [stopScan, setStopScan] = useState(false);
    const [result, setResult] = useState('');
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState();
    const [roomScanned, setRoomScanned] = useState(localStorage.getItem("Room") !== "no room identified");
    const [setCleaned, setSetCleaned] = useState(false);

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
    },[navigate, rows, stopScan]);

    function getRows() {
        var items = [];
        for(let i=0; i<all_items.length; i++) {
            for(let j=0; j<all_items[i].length; j++) {
                items.push(all_items[i][j]);
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

    return (
        <Container>
            <h3 className="scanItems">Scan items to be set clean...</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={row.ItemID} className="tuple">
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
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

