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

export async function getMyItems(userID) {
    var url = "my-items/" + userID;
    return await getJson(url);
}

export async function getAllActivity() {
    var url = "all-activity";
    return await getJson(url);
}

export async function getMyActivity(userID) {
    var url = "my-activity/" + userID;
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

export async function addItems(items, roomID, adminID) {
    const json = {
        "Items": items,
        "RoomID": roomID,
        "AdminID": adminID
    };
    var url = "add-item"
    return await setJson(url, JSON.stringify(json));
}

export async function deleteItems(itemIDs, adminID) {
    const json = {
        "ItemIDs": itemIDs,
        "AdminID": adminID
    }
    var url = "delete-item";
    return await setJson(url, JSON.stringify(json));
}

export async function undeleteItem(itemID, adminID) {
    const json = {
        "ItemID": itemID,
        "AdminID": adminID
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

export async function addRooms(rooms, adminID) {
    const json = {
        "Rooms": rooms,
        "AdminID": adminID
    };
    var url = "add-room"
    return await setJson(url, JSON.stringify(json));
}

export async function deleteRooms(roomIDs, adminID) {
    const json = {
        "RoomIDs": roomIDs,
        "AdminID": adminID
    }
    var url = "delete-room";
    return await setJson(url, JSON.stringify(json));
}

export async function undeleteRoom(roomID, adminID) {
    const json = {
        "RoomID": roomID,
        "AdminID": adminID
    }
    var url = "undelete-room";
    return await setJson(url, JSON.stringify(json));
}

export async function getItemTypes() {
    var url = "item-types";
    return await getJson(url);
}

export async function getMissingItems() {
    var url = "missing-items";
    return await getJson(url);
}

export async function getUsageActivity() {
    var url = "usage-activity";
    return await getJson(url);
}

export async function getAdminActivity() {
    var url = "admin-activity";
    return await getJson(url);
}

export async function getUsers() {
    var url = "all-users";
    return await getJson(url);
}

export async function deleteUsers(userIDs, adminID) {
    const json = {
        "UserIDs": userIDs,
        "AdminID": adminID
    }
    var url = "delete-user";
    return await setJson(url, JSON.stringify(json));
}

export async function undeleteUser(userID, adminID) {
    const json = {
        "UserID": userID,
        "AdminID": adminID
    }
    var url = "undelete-user";
    return await setJson(url, JSON.stringify(json));
}


