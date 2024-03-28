//import {login, register} from './DB';
var mysql = require('mysql');

let results;

function conn() {
    var param = {
        host: "rfidtracker.cpyweua2kjux.us-east-1.rds.amazonaws.com",
        user: "mavcare",
        database: "rfidtracker",
        password: "Hospitalrfid123"
    }

    var con = mysql.createConnection(param);

    con.connect(function(err){                                                
        if (err) throw err;
        console.log("Connected!");
    });
    
    return con;
}

function closeConn(con) {
    con.end((err) => {
        if (err) {
          console.error('Error closing MySQL connection:', error);
          return;
        }
        console.log('MySQL connection closed.');
    });
}

function execQuery(stmt) {
    return new Promise(
        function(resolve, reject){
            var con = conn();
            con.query(
                stmt, 
                function (err, result, fields) {
                    if (err) throw err;
                    if(result === undefined){
                        reject(new Error("result is undefined"));
                    }else{
                        resolve(result);
                        results = result;
                    }
                }
            )
            closeConn(con);
        }
    )
}

function logins(username,password) {
    execQuery()
    .then(()=>{})
    .catch((err)=>{console.log("Promise error: " + err);})
}

function registers() {

}

function test() {
    var stmt = "select * from Users;";
    execQuery(stmt)
    .then(()=>{console.log(results)})
    .catch((err)=>{console.log("Promise error: " + err);})
}

var XMLHttpRequest = require('xhr2');
//const sleep = ms => new Promise(r => setTimeout(r, ms));

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

async function login(username, password) {
    var url = `login/${username}/${password}/*/*`;
    return await getJson(url);
}

async function register(username, password, fname, lname) {
    var url = `register/${username}/${password}/${fname}/${lname}`;
    return await getJson(url);
}

async function resetPass(username, password) {
    var url = `reset/${username}/${password}/*/*`;
    return await getJson(url);
}

async function getAllItems() {
    var url = "all-items";
    return await getJson(url);
}

async function getScannedItems() {
    var url = "scanned-items"
    return await getJson(url);
}

getAllItems().then(items => {
    console.log(items)
});
