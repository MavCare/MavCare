var XMLHttpRequest = require('xhr2');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJson(url) {
    url = "http://localhost:8181/JavaAPI/rest/" + url;
    var xmlh = new XMLHttpRequest();   
    async function setResult() {
        return new Promise(resolve => {
            setTimeout(() => {
                xmlh.open("GET",url,true);
                xmlh.setRequestHeader("content-type","application/json");
                xmlh.send();
                xmlh.onreadystatechange = function() {
                    if(xmlh.readyState === 4 && xmlh.status === 200) {
                        resolve(xmlh.responseText);
                    }
                }
            }, 500);
        });
    }
    return await setResult();
}

async function setJson(url, json) {
    url = "http://localhost:8181/JavaAPI/rest/" + url;
    var xmlh = new XMLHttpRequest();   
    async function setResult() {
        return new Promise(resolve => {
            setTimeout(() => {
                xmlh.open("POST",url,true);
                xmlh.setRequestHeader("content-type","application/json");
                xmlh.send(json);
                xmlh.onreadystatechange = function() {
                    if(xmlh.readyState === 4 && xmlh.status === 200) {
                        resolve(xmlh.responseText);
                    }
                }
            }, 500);
        });
    }   
    return await setResult();
}

export async function login(username, password) {
    var url = `login/${username}/${password}/*/*/*/*`;
    return await getJson(url);
}

export async function register(username, password, fname, lname, epc, admin) {
    var url = `register/${username}/${password}/${fname}/${lname}/${epc}/${admin}`;
    return await getJson(url);
}

export async function resetPass(username, password) {
    var url = `reset/${username}/${password}/*/*/*/*`;
    return await getJson(url);
}

export async function getAllItems() {
    var url = "all-items";
    return await getJson(url);
}

export async function getScannedItems() {
    var url = "scanned-items";
    return await getJson(url);
}

export async function getScannedUser() {
    var url = "scanned-user";
    return await getJson(url);
}

export async function getEpcs() {
    var url = "scanned-epcs";
    return await getJson(url);
}

export async function checkIn(itemIDs, roomID, userID) {
    const json = {
        "ItemIDs": itemIDs,
        "UserID": userID,
        "RoomID": roomID
    };
    var url = "check-in";
    return await setJson(url, JSON.stringify(json));
}

export async function checkOut(itemIDs, roomID) {
    const json = {
        "ItemIDs": itemIDs,
        "RoomID": roomID
    };
    var url = "check-out";
    return await setJson(url, JSON.stringify(json));
}

export async function setClean(itemIDs, roomID) {
    const json = {
        "ItemIDs": itemIDs,
        "RoomID": roomID
    };
    var url = "set-clean";
    return await setJson(url, JSON.stringify(json));
}

export async function addItems(items, roomID) {
    const json = {
        "Items": items,
        "RoomID": roomID
    };
    var url = "add-item"
    return await setJson(url, JSON.stringify(json));
}

export async function deleteItems(itemIDs) {
    const json = {
        "ItemIDs": itemIDs
    }
    var url = "delete-item";
    return await setJson(url, JSON.stringify(json));
}

export async function undeleteItem(itemID) {
    const json = {
        "ItemID": itemID
    }
    var url = "undelete-item";
    return await setJson(url, JSON.stringify(json));
}

export async function getRoom() {
    var url = "get-room";
    return await getJson(url);
}

export async function getRooms() {
    var url = "get-rooms";
    return await getJson(url);
}

