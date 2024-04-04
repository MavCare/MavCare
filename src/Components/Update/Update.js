import React, {useEffect, useState} from 'react';
import {Container,Table} from 'react-bootstrap';
import { getScannedItems } from '../../DB/DB';

/*function scannedItems() {
    getScannedItems()
    .then(items => {
        items = JSON.parse(items);
        items = items.Items;
        for(let i = 0; i < items.length; i++) {
            if(!rows.includes(items[i])) {
                rows.push(items[i]);
            }
        }
    })
} */

export const CheckIn = () => {
    const [rows, setRows] = useState([]);
    useEffect(() => {
        getScannedItems()
        .then(items => {
        items = JSON.parse(items);
        items = items.Items;
        for(let i = 0; i < items.length; i++) {
            if(!rows.includes(items[i])) {
                rows.push(items[i]);
            }
        }
    })},[rows]); 

    return (
        <Container>
            <h3 className="scanItems">Scan items to be checked in...</h3>
            <Table striped bordered hover className="itemTable">
                <thead>
                    <tr>
                    <th className="itemID">Item ID</th>
                    <th className="itemType">Item Type</th>
                    <th className="status">Status</th>
                    <th className="remove">Remove</th>
                    
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                    <tr key={i}>
                        <td>{row.ItemID}</td>
                        <td>{row.ItemType}</td>
                        <td>{row.Status}</td>
                        <td><button>x</button></td>
                    </tr>
                    ))}
                </tbody>
            </Table>
            <button onclick="">Stop Scanning</button>
        </Container>
    )
}

export const CheckOut = () => {
    return (
        <div>
            <h2>Check-out Page</h2>
        </div>
    )
}

export const Add = () => {
    return (
        <div>
            <h2>Add Page</h2>
        </div>
    )
}

export const Delete = () => {
    return (
        <div>
            <h2>Delete Page</h2>
        </div>
    )
}

export const SetClean = () => {
    return (
        <div>
            <h2>Set Clean Page</h2>
        </div>
    )
}

