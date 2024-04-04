package db;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.*;
import java.util.*;
import org.json.*; 
import tags.ReadTags;

public class DB {
    public static Connection connect() {
        String url = "jdbc:mysql://rfidtracker.cpyweua2kjux.us-east-1.rds.amazonaws.com:3306/rfidtracker";
        String username = "mavcare";
        String password = "Hospitalrfid123";
        Connection conn = null;
        try {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
            } catch (ClassNotFoundException ex) {
                Logger.getLogger(DB.class.getName()).log(Level.SEVERE, null, ex);
            }
            conn = DriverManager.getConnection(url, username, password);
            System.out.println("Connected to the database!");
        } catch (SQLException e) {
            System.err.println("Connection error:");
            e.printStackTrace();
        }
        
        return conn;
    }

    public static void closeConn(Connection conn) {
        try {
            conn.close();
        } catch(SQLException e) {
            System.err.println("Error closing connection:");
            e.printStackTrace();
        }
    }

    public static Statement getStmt(Connection conn) {
        Statement stmt = null;
        try{
            stmt = conn.createStatement();
        } catch(SQLException e) {
            System.err.println("Statement Creation error:");
            e.printStackTrace();
        }
        return stmt;
    }
    
    public static String getAllItems() {
    	JSONObject items = new JSONObject();
    	JSONArray itemList = new JSONArray();
    	
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String query = "select * from Items;";
        ResultSet results = getResult(stmt, query);
        try {
            while(results.next()) {
            	JSONObject item = new JSONObject();
                String itemID = results.getString("ItemID");
                String itemType = results.getString("ItemType");
                String status = results.getString("Status");
                String roomID = results.getString("RoomID");
                String roomName = getRoomName(roomID,getStmt(conn));
                
                //last user
                String queryUser = String.format("select * from Usage_Log, Users where Usage_Log.ItemID = %s"
                									+ " and Usage_Log.UserID = Users.UserID "
                									+ " order by TimeIn desc;", itemID);
                ResultSet user = getResult(getStmt(conn),queryUser);
                String lastUser = "";
                if(user.next()) {
                    lastUser = user.getString("Fname");

                }
                
                item.put("ItemID",itemID);
                item.put("ItemType",itemType);
                item.put("Room",roomName);
                item.put("Status",status);
                item.put("LastUser",lastUser);
                
                itemList.put(item);
            }
             
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
    	
    	items.put("Items",itemList);
    	return items.toString();
    }
    
    public static String getScannedItems() {
        JSONObject items = new JSONObject();
        JSONArray itemList = new JSONArray();
        
        String[] tags = ReadTags.readTags();
        
        Connection conn = connect();
       // Statement stmt = getStmt(conn);
                
        for(String tag : tags) {
        	if(tag != null) {
        		String query = "select * from Items where EPC = '" + tag + "';";
        		ResultSet results = getResult(getStmt(conn),query);
        		try {
        			if(results.next()) {
        				JSONObject item = new JSONObject();
                        String itemID = results.getString("ItemID");
                        String itemType = results.getString("ItemType");
                        String status = results.getString("Status");
                        String roomID = results.getString("RoomID");
                        String roomName = getRoomName(roomID,getStmt(conn));
                        
                        //last user
                        String queryUser = String.format("select * from Usage_Log, Users where Usage_Log.ItemID = %s"
                        									+ " and Usage_Log.UserID = Users.UserID "
                        									+ " order by TimeIn desc;", itemID);
                        ResultSet user = getResult(getStmt(conn),queryUser);
                        String lastUser = "";
                        if(user.next()) {
                            lastUser = user.getString("Fname");
                        }
                        
                        item.put("ItemID",itemID);
                        item.put("ItemType",itemType);
                        item.put("Room",roomName);
                        item.put("Status",status);
                        item.put("LastUser",lastUser);
                        
                        itemList.put(item);
        			}
        		} catch(SQLException e) {
        			System.err.println("Error fetching next:");
                    e.printStackTrace();
        		}
        		
        	}
        }
    	
        items.put("Items",itemList);
    	return items.toString();
    }

    public static String checkIn(String epc, String username, String room) {
        String itemID = new String();
        String userID = new String();
        String roomID = new String();
        String time = new String();

        Connection conn = connect();
        Statement stmt = getStmt(conn);

        //check if item already checked in or doesn't exist
        String query = "select * from Items where EPC = '" + epc + "';";
        ResultSet results = getResult(stmt, query);
        try {
            if(results.next()) {
                itemID = results.getString("ItemID");
                query = "select * from Usage_Log where ItemID = " + itemID
                        + " and TimeOut is null;";
                results = getResult(stmt, query);
                if(results.next()){ 
                    return "item in use";
                }
                query = String.format("select * from Items where ItemID = %s and Status = 'unclean';",itemID);
                results = getResult(stmt,query);
                if(results.next()) {
                    return "item not clean";
                }
            }
            else {
                return "item not found";
            }
            //getting userID
            query = "select * from Users where Username = '" + username + "';";
            results = getResult(stmt, query);
            results.next();
            userID = results.getString("UserID");

            //getting roomID
            roomID = getRoomID(room,stmt);

            //getting time
            time = getTime(stmt);
            
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
       
        //add to usage table
        String update = String.format("insert into Usage_Log(ItemID,UserID,RoomID,TimeIn) " + 
                        "values(%s,%s,%s,'%s');",itemID,userID,roomID,time);
        update(stmt,update);

        //update item as necessary
        setStatus("inUse", itemID, stmt);
        setRoom(itemID, roomID, stmt);

        closeConn(conn);
        return "success";
    }

    public static String checkOut(String epc, String room) {
        Connection conn = connect();
        Statement stmt = getStmt(conn);

        String itemID = new String();
        String roomID = new String();
        String time = new String();
        String usageID = new String();

        //check if item not checked out or doesn't exist
        String query = "select * from Items where EPC = '" + epc + "';";
        ResultSet results = getResult(stmt, query);
        try {
            if(results.next()) {
                itemID = results.getString("ItemID");
                query = "select * from Usage_Log where ItemID = " + itemID
                        + " and TimeOut is null;";
                results = getResult(stmt, query);
                if(results.next()){
                    usageID = results.getString("UsageID");
                }
                else {
                    return "item not checked in";
                }
            }
            else {
                return "item not found";
            }

            //getting roomID
            roomID = getRoomID(room, stmt);
            //getting time
            time = getTime(stmt);
            
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }

        String update = String.format("update Usage_Log set TimeOut = '%s' where UsageID = %s;",time,usageID);
        update(stmt, update);

        //update item status and room if necessary
        setStatus("unclean", itemID, stmt);
        setRoom(itemID, roomID, stmt);

        closeConn(conn);
        return "success";
    }

    public static void setStatus(String choice, String itemID, Statement stmt) {
        String update = String.format("update Items set Status = '%s' where ItemID = %s;",choice,itemID);
        update(stmt,update);
    }
    public static void setRoom(String itemID, String roomID, Statement stmt) {
        String update = String.format("Update Items set RoomID = %s where ItemID = %s;",roomID,itemID);
        update(stmt,update);
    }
    public static String getRoomName(String roomID, Statement stmt) {
    	String query = "select * from Rooms where RoomID = " + roomID + ";";
        ResultSet results = getResult(stmt, query);
        try {
            results.next();
            return results.getString("RoomName");
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        return "error getting RoomName";
    }
    public static String getRoomID(String room, Statement stmt) {
        String query = "select * from Rooms where RoomName = '" + room + "';";
        ResultSet results = getResult(stmt, query);
        try {
            results.next();
            return results.getString("RoomID");
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        return "error getting RoomID";
    }
    public static String getTime(Statement stmt) {
        String query = "select CURRENT_TIMESTAMP;";
        ResultSet results = getResult(stmt, query);
        try {
            results.next();
            return results.getString("CURRENT_TIMESTAMP"); 
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        return "error getting time";
    }

    public static ResultSet getResult(Statement stmt, String query) {
        ResultSet results = null;
        try {
            results = stmt.executeQuery(query);
        } catch(SQLException e) {
            System.err.println("ResultSet Creation error:");
            e.printStackTrace();
        }
        return results;
    }

    public static int update(Statement stmt, String update) {
        int rows = 0;
        try {
            rows = stmt.executeUpdate(update);
        } catch(SQLException e) {
            System.err.println("Error executing update:");
            e.printStackTrace();
        }
        return rows;
    }

    public static String addItem(String epc, String itemType, String room) {
        Connection conn = connect();
        Statement stmt = getStmt(conn);

        //check if tag already in use
        String query = "select * from Items where EPC = '" + epc + "';";
        ResultSet results = getResult(stmt,query);
        try {
            if(results.next()) {
                return "tag already in use.";
            }
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }

        //get RoomID
        String roomID = new String();
        query = "select * from Rooms where RoomName = '" + room + "';";
        results = getResult(stmt, query);
        try {
            results.next();
            roomID = results.getString("RoomID");
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        
        //add item
        String defaultStatus = "free";
        String update = String.format("insert into Items(ItemType,RoomID,Status,EPC) " + 
                                    "values('%s',%s,'%s','%s');",itemType,roomID,defaultStatus,epc);
        update(stmt,update); 

        closeConn(conn);
        return "success";
    }

    public static String deleteItem(String epc) {
        Connection conn = connect();
        Statement stmt = getStmt(conn);

        //make sure item exists
        String query = "select * from Items where EPC = '" + epc + "';";
        ResultSet results = getResult(stmt, query);
        try {
            if(!results.next()) {
                return "item not found";
            }
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }

        //figure out how to manage item in usage_table

        closeConn(conn);
        return "success";
    }

    public static String createHash(String password) {
        String hash = new String();
        try{
            MessageDigest dgst = MessageDigest.getInstance("MD5");
            byte[] md = dgst.digest(password.getBytes());
            BigInteger Int = new BigInteger(1,md);
            hash = Int.toString(16);
        } catch(NoSuchAlgorithmException e) {
            System.out.println(e);
        }
        return hash;
    }

    public static String registerUser(String email, String password, String fname, String lname) {
    	JSONObject user = new JSONObject();
        email = email.toLowerCase();

        Connection conn = connect();
        Statement stmt = getStmt(conn);

        //check if email in use
        String query = "select * from Users where Username = '" + email + "';";
        ResultSet results = getResult(stmt,query);
        try {
            if(results.next()) {
                return "email already in use.";
            }
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }

        //hash password
        String pswdhash = createHash(password);

        //add user 
        String update = String.format("insert into Users(Username,`Password`,Fname,Lname) " +
                                            "values('%s','%s','%s','%s');",email,pswdhash,fname,lname);
        update(stmt,update);
        
        query = "select * from Users where Username='" + email + "';";
        results = getResult(stmt,query);
        try {
            if(results.next()) {
            	user.put("UserID",results.getString("UserID"));
                user.put("Username",results.getString("Username"));
                user.put("Password", password);
                user.put("Fname",results.getString("Fname"));
                user.put("Lname",results.getString("Lname"));
            }
        } catch(SQLException e) {
        }
        

        closeConn(conn);
        return user.toString();
    }
    
    public static String checkUser(String username, String password) {
    	JSONObject user = new JSONObject();
    	String pswdhash = createHash(password);
    	
    	Connection conn = connect();
    	
        Statement stmt = getStmt(conn);
        String query = "select * from Users where Username='" + username + "' and `Password`='" + pswdhash + "';";
        ResultSet result = getResult(stmt,query);
        try {
            if(result.next()) {
            	user.put("UserID",result.getString("UserID"));
                user.put("Username",result.getString("Username"));
                user.put("Password", password);
                user.put("Fname",result.getString("Fname"));
                user.put("Lname",result.getString("Lname"));
            }
            else {
            	return "no user found";
            }
        } catch(SQLException e) {
        }
        
        closeConn(conn);
    	return user.toString();
    }
    
    public static String resetPass(String username, String password) {
    	JSONObject user = new JSONObject();
    	String pswdhash = createHash(password);
    	
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String update = String.format("update Users set `Password` = '%s'" +
                " where Username = '%s';",pswdhash,username);
        update(stmt,update);
        
        String query = "select * from Users where Username='" + username + "';";
        ResultSet result = getResult(stmt,query);
        try {
            if(result.next()) {
            	user.put("UserID",result.getString("UserID"));
                user.put("Username",result.getString("Username"));
                user.put("Password", password);
                user.put("Fname",result.getString("Fname"));
                user.put("Lname",result.getString("Lname"));
            }
            else {
            	return "no user found";
            }
        } catch(SQLException e) {
        }
        
        closeConn(conn);
    	return user.toString();
    }

    public static void regUserDemo() {
        Connection conn = connect();
        Statement stmt = getStmt(conn);

        String query = "select * from Users;";
        ResultSet result = getResult(stmt,query);
        try {
            while(result.next()) {
               System.out.print(result.getString("UserID") + " ");
               System.out.print(result.getString("Username") + " ");
               System.out.print(result.getString("Password") + " ");
               System.out.print(result.getString("Fname") + " ");
               System.out.print(result.getString("Lname") + " ");
               System.out.println("");
            }
        } catch(SQLException e) {
        }

        Scanner scanner = new Scanner(System.in);  
        System.out.println("email: ");
        String email = scanner.nextLine();
        System.out.println("first name: ");
        String fname = scanner.nextLine();
        System.out.println("last name: ");
        String lname = scanner.nextLine();
        System.out.println("password: ");
        String password = scanner.nextLine();

        String outcome = registerUser(email,password,fname,lname);
        System.out.println(outcome);

        query = "select * from Users;";
        result = getResult(stmt,query);
        try {
            while(result.next()) {
               System.out.print(result.getString("UserID") + " ");
               System.out.print(result.getString("Username") + " ");
               System.out.print(result.getString("Password") + " ");
               System.out.print(result.getString("Fname") + " ");
               System.out.print(result.getString("Lname") + " ");
               System.out.println("");
            }
        } catch(SQLException e) {
        } 

        closeConn(conn);
    }
    public static void main(String[] args) {
        String items = getAllItems();
        System.out.println(items);
    }
}