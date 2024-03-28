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
            }, 2000);
        });
    }
    return await setResult();
}

export async function login(username, password) {
    var url = `login/${username}/${password}/*/*`;
    return await getJson(url);
}

export async function register(username, password, fname, lname) {
    var url = `register/${username}/${password}/${fname}/${lname}`;
    return await getJson(url);
}

export async function resetPass(username, password) {
    var url = `reset/${username}/${password}/*/*`;
    return await getJson(url);
}

export async function getAllItems() {
    var url = "all-items";
    return await getJson(url);
}

export async function getScannedItems() {
    var url = "scanned-items"
    return await getJson(url);
}

