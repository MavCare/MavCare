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
    
    public static String getUsageActivity() {
    	JSONObject allActivity = new JSONObject();
    	JSONArray usageList = new JSONArray();
    	Connection conn = connect();
    	Statement stmt = getStmt(conn);
    	String usageQuery = "select * from Usage_Log, Items, Rooms, Users"
    			+ " where Usage_Log.ItemID = Items.ItemID"
    			+ " and Usage_Log.UserID = Users.UserID"
    			+ " and Usage_Log.RoomID = Rooms.RoomID"
    			+ " order by Usage_Log.UsageID desc;";
    	ResultSet usageResults = getResult(stmt, usageQuery);
    	
    	try {
        	while(usageResults.next()) {
        		JSONObject usage = new JSONObject();
        		String usageID = usageResults.getString("UsageID");
        		String itemID = usageResults.getString("ItemID");
        		String itemType = usageResults.getString("ItemType");
        		String userID = usageResults.getString("UserID");
        		String userName = usageResults.getString("Fname") + " " + usageResults.getString("Lname").charAt(0) + "."; 
        		String roomID = usageResults.getString("RoomID");
        		String roomName = usageResults.getString("RoomName"); 
        		String timeIn = usageResults.getString("TimeIn");
        		String timeOut = "";
        		if(usageResults.getString("TimeOut") != null) {
        			timeOut = usageResults.getString("TimeOut");
        		}
        		
        		usage.put("UsageID", usageID);
        		usage.put("ItemID", itemID);
        		usage.put("ItemType", itemType);
        		usage.put("UserID", userID);
        		usage.put("UserName", userName);
        		usage.put("RoomID", roomID);
        		usage.put("RoomName", roomName);
        		usage.put("TimeIn", timeIn);
        		usage.put("TimeOut", timeOut);
        		
        		usageList.put(usage);
        		
        	}
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
    	
    	allActivity.put("usageActivity",usageList);
    	closeConn(conn);
    	return allActivity.toString();
    }
    
    public static String undeleteUser(String userID, String adminID) {
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String update = String.format("update Users set `Active` = 1 where UserID = %s;",userID);
        update(stmt, update);
        
        update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Undelete','User',%s,current_timestamp());",adminID,userID);
        update(getStmt(conn),update);
        
        closeConn(conn);
        
    	return "success";
    }
    
    public static String getAdminActivity() {
    	JSONObject allActivity = new JSONObject();
    	JSONArray actionList = new JSONArray();
    	Connection conn = connect();
    	Statement stmt = getStmt(conn);
    	String actionQuery = "select * from Admin_Log order by `Time` desc;";
    	ResultSet actionResults = getResult(stmt, actionQuery);
    	
    	try {
        	while(actionResults.next()) {
        		JSONObject action = new JSONObject();
        		String actionID = actionResults.getString("ActionID");
        		String adminID = actionResults.getString("AdminID");
        		String operation = actionResults.getString("Operation");
        		String objectType = actionResults.getString("ObjectType");
        		String objectID = actionResults.getString("ObjectID"); 
        		String time = actionResults.getString("Time");
        		
        		String adminQuery = String.format("select * from Users where UserID = %s;",adminID);
        		ResultSet adminResults = getResult(getStmt(conn), adminQuery);
        		adminResults.next();
        		String adminName = adminResults.getString("Fname") + " " + adminResults.getString("Lname").charAt(0) + ".";
        		
        		String objectName = "";
        		if (objectType.equals("Item")) {
        			String itemQuery = String.format("select * from Items where ItemID = %s;",objectID);
            		ResultSet itemResults = getResult(getStmt(conn), itemQuery);
            		itemResults.next();
            		objectName = itemResults.getString("ItemType");
        		}
        		if (objectType.equals("User")) {
        			String userQuery = String.format("select * from Users where UserID = %s;",objectID);
            		ResultSet userResults = getResult(getStmt(conn), userQuery);
            		userResults.next();
            		objectName = userResults.getString("Username");
        		}
        		if (objectType.equals("Room")) {
        			String roomQuery = String.format("select * from Rooms where RoomID = %s;",objectID);
            		ResultSet roomResults = getResult(getStmt(conn), roomQuery);
            		roomResults.next();
            		objectName = roomResults.getString("RoomName");
        		}
        		
        		action.put("ActionID", actionID);
        		action.put("AdminID", adminID);
        		action.put("AdminName", adminName);
        		action.put("Operation", operation);
        		action.put("ObjectType", objectType);
        		action.put("ObjectID", objectID);
        		action.put("ObjectName", objectName);
        		action.put("Time", time);
        		
        		actionList.put(action);
        		
        	}
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
    	
    	allActivity.put("adminActivity",actionList);
    	closeConn(conn);
    	return allActivity.toString();
    }
    
    public static String getUsers() {
    	JSONObject users = new JSONObject();
    	JSONArray userList = new JSONArray();
    	Connection conn = connect();
    	Statement stmt = getStmt(conn);
    	String query = "select * from Users;";
    	ResultSet results = getResult(stmt, query);
    	try {
        	while(results.next()) {
        		JSONObject user = new JSONObject();
        		String userID = results.getString("UserID");
        		String username = results.getString("Username");
        		String fname = results.getString("Fname");
        		String lname = results.getString("Lname");
        		String admin = results.getString("admin");
        		String active = results.getString("Active");
        		
        		user.put("UserID", userID);
        		user.put("Username", username);
        		user.put("Fname", fname);
        		user.put("Lname", lname);
        		user.put("Admin", admin);
        		user.put("Active", active);
        		
        		userList.put(user);
        		
        	}

        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
    	
    	users.put("Users", userList);
    	return users.toString();	
    }
    
    public static String getMissingItems() {
    	JSONArray missingItemList = new JSONArray();
    	Connection conn = connect();
        String timeOutQuery = "select * from Usage_Log where TimeOut is null;";
        String currTimeQuery = "select current_timestamp;";
        ResultSet timeOutResults = getResult(getStmt(conn), timeOutQuery);
        ResultSet currTimeResults = getResult(getStmt(conn), currTimeQuery);
        try {
        	currTimeResults.next();
        	String currTime = currTimeResults.getString("current_timestamp");
        	while(timeOutResults.next()) {
        		String timeIn = timeOutResults.getString("TimeIn");
        		String timeDiffQuery = String.format("SELECT TIMESTAMPDIFF(HOUR, '%s', '%s') AS time_diff;",timeIn,currTime);
        		ResultSet timeDiffResults = getResult(getStmt(conn), timeDiffQuery);
        		timeDiffResults.next();
        		int timeDiff = timeDiffResults.getInt("time_diff");
        		if(timeDiff >= 24) {
        			String itemID = timeOutResults.getString("ItemID");
        			String update = String.format("update Items set `Status` = 'missing' where ItemID = %s;",itemID);
        			update(getStmt(conn),update);
        			String itemQuery = String.format("select * from Items where ItemID = %s;",itemID);
        			ResultSet itemResults = getResult(getStmt(conn),itemQuery);
        			itemResults.next();
        			if(itemResults.getInt("Active") == 1) {
        				JSONObject item = new JSONObject();
        				item.put("ItemID",itemID);
        				item.put("ItemType",itemResults.getString("ItemType"));
        				item.put("TimeMissing", timeDiff/24);
        				item.put("LastUser", timeOutResults.getString("UserID"));
        				missingItemList.put(item);
        			}
        		}
        	}
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        
        JSONObject missingItems = new JSONObject();
        missingItems.put("MissingItems", missingItemList);
        
        closeConn(conn);
        
    	return missingItems.toString();
    }
    
    public static String addRoom(String epc, String name, String adminID) {
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        String roomQuery = String.format("select * from Rooms where RoomName = '%s';",name);
        ResultSet roomResults = getResult(stmt, roomQuery);
        String epcQuery = String.format("select Items.ItemID from Items where Items.EPC = '%s' "
						        		+ "union all select Rooms.RoomID from Rooms where Rooms.EPC = '%s';",epc,epc);
        ResultSet epcResults = getResult(stmt, epcQuery);
        try {
        	if(roomResults.next()) {
        		return "Room already exists";
        	}
        	else if(epcResults.next()) {
        		return "Tag already in use";
        	}
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        
        String update = String.format("insert into Rooms(RoomName, EPC, `Active`) values('%s', '%s', 1);",name,epc);
        update(stmt,update);
        
        String roomID = "";
        String query = String.format("select * from Rooms where EPC = '%s';",epc);
        ResultSet results = getResult(getStmt(conn),query);
        try {
        	results.next();
        	roomID = results.getString("RoomID");
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        
        String log_update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Add','Room',%s,current_timestamp());",adminID,roomID);
        update(getStmt(conn),log_update);
        
        closeConn(conn);
        
        return "success";
    }
    
    public static String deleteRoom(String roomID, String adminID) {
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String update = String.format("update Rooms set `Active` = 0 where RoomID = %s;",roomID);
        update(stmt, update);
        
        update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Delete','Room',%s,current_timestamp());",adminID,roomID);
        update(getStmt(conn),update);
        
        closeConn(conn);
        
    	return "success";
    }
    
    public static String undeleteRoom(String roomID, String adminID) {
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String update = String.format("update Rooms set `Active` = 1 where RoomID = %s;",roomID);
        update(stmt, update);
        
        update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Undelete','Room',%s,current_timestamp());",adminID,roomID);
        update(getStmt(conn),update);
        
        closeConn(conn);
        
    	return "success";
    }
    
    public static String getRoom() {
    	Connection conn = connect();
    	JSONObject room = new JSONObject();
    	String[] tags = ReadTags.readTags(1000, 2700);
    	
    	for(String tag : tags) {
    		if(tag != null) {
	    		String query = String.format("select * from Rooms where EPC = '%s' and `Active` = 1;",tag);
	            ResultSet results = getResult(getStmt(conn), query);
	            try {
	            	if(results.next()) {
	            		room.put("RoomID",results.getString("RoomID"));
	            		room.put("RoomName",results.getString("RoomName"));
	            		//room.put("EPC",results.getString("EPC"));
	            		return room.toString();
	            	}
	            }catch(SQLException e) { 
	                System.err.println("Error fetching next:");
	                e.printStackTrace();
	            }
	    	}
    	}
    	
    	closeConn(conn);
    	
    	return "no room identified";
    }
    
    public static String getRooms() {
    	Connection conn = connect();
    	JSONObject rooms = new JSONObject();
    	JSONArray roomList = new JSONArray();
    	String query = "select * from Rooms where `Active` = 1;";
    	ResultSet results = getResult(getStmt(conn), query);
    	try {
    		while(results.next()) {
    			JSONObject room = new JSONObject();
    			room.put("RoomID",results.getString("RoomID"));
        		room.put("RoomName",results.getString("RoomName"));
        		roomList.put(room);
    		}
    	}catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
    	rooms.put("Rooms", roomList);
    	closeConn(conn);
    	return rooms.toString();
    }
    
    public static String getItemTypes() {
    	Connection conn = connect();
    	JSONObject types = new JSONObject();
    	ArrayList<String> typeArray = new ArrayList<String>();
    	
    	String query = "select * from Items;";
    	ResultSet results = getResult(getStmt(conn), query);
    	try {
    		while(results.next()) {
    			String type = results.getString("ItemType");
        		if (!typeArray.contains(type)) {
        			typeArray.add(type);
        		}
    		}
    	}catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
    	
    	JSONArray typeList = new JSONArray(typeArray);
    	types.put("ItemTypes", typeList);    	
    	closeConn(conn);
    	return types.toString();
    }
    
    public static String getAllItems() {
    	JSONObject items = new JSONObject();
    	JSONArray itemList = new JSONArray();
    	
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String query = "select * from Items where `Active` = 1;";
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
                    lastUser = user.getString("Fname") + " " + user.getString("Lname").charAt(0) + ".";

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
    	closeConn(conn);
    	return items.toString();
    }
    
    public static String getMyItems(String userID) {
    	JSONObject items = new JSONObject();
    	JSONArray itemList = new JSONArray();
    	
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String query = "select * from Items where `Active` = 1;";
        ResultSet results = getResult(stmt, query);
        try {
            while(results.next()) {
            	JSONObject item = new JSONObject();
                String itemID = results.getString("ItemID");
                String itemType = results.getString("ItemType");
                String status = results.getString("Status");
                String roomID = results.getString("RoomID");
                String roomName = getRoomName(roomID,getStmt(conn));
                
                String queryUser = String.format("select * from Usage_Log, Users where Usage_Log.ItemID = %s"
                									+ " and Usage_Log.UserID = Users.UserID"
                									+ " and Usage_Log.UserID = %s"
                									+ " and TimeOut is null;", itemID, userID);
                ResultSet user = getResult(getStmt(conn),queryUser);
                
                if(user.next()) {
                	item.put("ItemID",itemID);
                    item.put("ItemType",itemType);
                    item.put("Room",roomName);
                    item.put("Status",status);
                    itemList.put(item);
                    
                }
                
            }
             
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
    	
    	items.put("Items",itemList);
    	closeConn(conn);
    	return items.toString();
    	
    }
    
    public static String getItem(String itemID) {
    	JSONObject item = new JSONObject();
    	Connection conn = connect();
    	String query = "select * from Items where ItemID = '" + itemID + "' and `Active` = 1;";
		ResultSet results = getResult(getStmt(conn),query);
		try {
			if(results.next()) {
                String itemType = results.getString("ItemType");
                String status = results.getString("Status");
                String roomName = getRoomName(results.getString("RoomID"),getStmt(conn));
                
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
			}
			else {
				return "no item found";
			}
		} catch(SQLException e) {
			System.err.println("Error fetching next:");
            e.printStackTrace();
		}
    	closeConn(conn);
		return item.toString();
    }
    
    public static String getScannedItems() {
        JSONObject items = new JSONObject();
        JSONArray itemList = new JSONArray();
        
        String[] tags = ReadTags.readTags(6, 3);
        
        Connection conn = connect();
                
        for(String tag : tags) {
        	if(tag != null) {
        		String query = "select * from Items where EPC = '" + tag + "' and `Active` = 1;";
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
                        
                        itemList.put(item.toString());
        			}
        		} catch(SQLException e) {
        			System.err.println("Error fetching next:");
                    e.printStackTrace();
        		}
        		
        	}
        }
    	
        items.put("Items",itemList);
    	closeConn(conn);
    	return items.toString();
    }
    
    public static String getScannedUser() {        
        String[] tags = ReadTags.readTags(6, 3);
        
        Connection conn = connect();
                
        for(String tag : tags) {
        	if(tag != null) {
        		String query = "select * from Users where EPC = '" + tag + "' and `Active` = 1;";
        		ResultSet result = getResult(getStmt(conn),query);
        		try {
        			if(result.next()) {
        				JSONObject user = new JSONObject();
                        user.put("UserID",result.getString("UserID"));
                        user.put("Username",result.getString("Username"));
                        user.put("Epc", tag);
                        user.put("Fname",result.getString("Fname"));
                        user.put("Lname",result.getString("Lname"));
                        user.put("Admin", result.getString("admin"));
                        return user.toString();
                        
        			}
        		} catch(SQLException e) {
        			System.err.println("Error fetching next:");
                    e.printStackTrace();
        		}
        		
        	}
        }
        
    	closeConn(conn);
    	return "no user scanned";
    }


    public static String checkIn(String itemID, String userID, String roomID) {
        String time = new String();

        Connection conn = connect();
        Statement stmt = getStmt(conn);

        //check if item already checked in or doesn't exist
        String query = "select * from Usage_Log where ItemID = " + itemID
                + " and TimeOut is null;";
        ResultSet results = getResult(stmt, query);
        
        try {
            if(results.next()) {
            	return "item in use";
            } 
            
            query = String.format("select * from Items where ItemID = %s and Status = 'unclean';",itemID);
            results = getResult(stmt,query);
            
            if(results.next()) {
                return "item not clean";
            }

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
        setStatus("inUse", itemID);
        setRoom(itemID, roomID);

        closeConn(conn);
        return getItem(itemID);
    }

    public static String checkOut(String itemID, String roomID) {
        Connection conn = connect();
        Statement stmt = getStmt(conn);

        String time = new String();
        String usageID = new String();

        //check if item not checked out or doesn't exist
        String query = "select * from Usage_Log where ItemID = " + itemID
                + " and TimeOut is null;";
        ResultSet results = getResult(stmt, query);
        try {
            if(results.next()) {
            	usageID = results.getString("UsageID");
            }
            else {
                return "item not checked in";
            }

            time = getTime(stmt);
            
        } catch(SQLException e) { 
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }

        String update = String.format("update Usage_Log set TimeOut = '%s' where UsageID = %s;",time,usageID);
        update(stmt, update);

        setStatus("unclean", itemID);
        setRoom(itemID, roomID);

        closeConn(conn);
        return getItem(itemID);
    }

    public static void setStatus(String choice, String itemID) {
    	Connection conn = connect();
        String update = String.format("update Items set Status = '%s' where ItemID = %s;",choice,itemID);
        update(getStmt(conn),update);
        closeConn(conn);
    }
    public static void setRoom(String itemID, String roomID) {
    	Connection conn = connect();
        String update = String.format("Update Items set RoomID = %s where ItemID = %s;",roomID,itemID);
        update(getStmt(conn),update);
    	closeConn(conn);
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
    
    public static String getEPCs() {
    	Connection conn = connect();
        
    	String[] tags = ReadTags.readTags(6, 1000);
    	JSONArray epcList = new JSONArray();
    	JSONObject epc = new JSONObject();
    	for (String tag : tags) {
    		if(tag != null) {
    			String itemQuery = "select * from Items where EPC = '" + tag + "';";
    	        ResultSet itemResults = getResult(getStmt(conn),itemQuery);
    	        String roomQuery = "select * from Rooms where EPC = '" + tag + "';";
	            ResultSet roomResults = getResult(getStmt(conn),roomQuery);
	            String userQuery = "select * from Users where EPC = '" + tag + "';";
	            ResultSet userResults = getResult(getStmt(conn),userQuery);
    	        try {
    	            if(!itemResults.next() && !roomResults.next() && !userResults.next()) {
    	            	epcList.put(tag);
    	            }
    	        } catch(SQLException e) {
    	            System.err.println("Error fetching next:");
    	            e.printStackTrace();
    	        }
    		}
    	}
    	epc.put("EPC", epcList);
    	closeConn(conn);
    	return epc.toString();
    }

    public static String addItem(String epc, String itemType, String roomID, String adminID) {
        Connection conn = connect();
        Statement stmt = getStmt(conn);
        String itemID = "";

        //check if tag already in use
        String query = "select * from Items where EPC = '" + epc + "';";
        ResultSet results = getResult(stmt,query);
        try {
            if(results.next()) {
            	if(results.getInt("Active") == 0) {
            		return "tag already been used";
            	}
                return "tag already in use for " + results.getString("ItemType").toLowerCase() 
                		+ " with ID " + results.getString("ItemID");
            }
            query = "select * from Rooms where EPC = '" + epc + "';";
            results = getResult(stmt,query);
            if(results.next()) {
                return "room tag";
            }
            query = "select * from Users where EPC = '" + epc + "';";
            results = getResult(stmt,query);
            if(results.next()) {
                return "user tag";
            }
            
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }

        //add item
        String defaultStatus = "free";
        String update = String.format("insert into Items(ItemType,RoomID,Status,EPC,`Active`) " + 
                                    "values('%s',%s,'%s','%s',1);",itemType.toUpperCase(),roomID,defaultStatus,epc);
        update(stmt,update); 
        
        query = "select * from Items where EPC = '" + epc + "';";
        results = getResult(stmt,query);
        try {
            if(results.next()) {
            	itemID = results.getString("ItemID");
            }
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        
        String log_update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Add','Item',%s,current_timestamp());",adminID,itemID);
        update(getStmt(conn),log_update);

        closeConn(conn);
        return getItem(itemID);
    }

    public static String deleteItem(String itemID, String adminID) {
        Connection conn = connect();
        Statement stmt = getStmt(conn);

        //make sure item exists
        String query = "select * from Items where ItemID = '" + itemID + "';";
        ResultSet results = getResult(stmt, query);
        try {
            if(results.next()) {
            	String update = String.format("update Items set `Active` = 0 where ItemID = '%s';",itemID);
                update(stmt, update);
            }
            else {
            	return "item not found";
            }
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        
        String log_update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Delete','Item',%s,current_timestamp());",adminID,itemID);
        update(getStmt(conn),log_update);

        closeConn(conn);
        return "success";
    }
    
    public static String undeleteItem(String itemID, String adminID) {
        Connection conn = connect();
        Statement stmt = getStmt(conn);

        //make sure item exists
        String query = "select * from Items where ItemID = '" + itemID + "';";
        ResultSet results = getResult(stmt, query);
        try {
            if(results.next()) {
            	String update = String.format("update Items set `Active` = 1 where ItemID = '%s';",itemID);
                update(stmt, update);
            }
            else {
            	return "item not found";
            }
        } catch(SQLException e) {
            System.err.println("Error fetching next:");
            e.printStackTrace();
        }
        
        String log_update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Undelete','Item',%s,current_timestamp());",adminID,itemID);
        update(getStmt(conn),log_update);

        closeConn(conn);
        return getItem(itemID);
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

    public static String registerUser(String email, String password, String fname, String lname, String epc, String admin) {
    	JSONObject user = new JSONObject();
        email = email.toLowerCase();
        
        String getEpc = getEPCs();
        JSONObject epcs = new JSONObject(getEpc);
        JSONArray epcList = epcs.getJSONArray("epcList");
        String card = "";
        if(epcList.length() > 0) {
        	card = epcList.getString(0);
        }

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
        String update = String.format("insert into Users(Username,`Password`,Fname,Lname,EPC,`admin`,`Active`) " +
                                            "values('%s','%s','%s','%s','%s',%s,1);",email,pswdhash,fname,lname,card,admin);
        update(stmt,update);
        
        query = "select * from Users where Username='" + email + "';";
        results = getResult(stmt,query);
        try {
            if(results.next()) {
            	user.put("UserID",results.getString("UserID"));
                user.put("Username",results.getString("Username"));
                user.put("Password", password);
                user.put("Epc", results.getString("EPC"));
                user.put("Fname",results.getString("Fname"));
                user.put("Lname",results.getString("Lname"));
                user.put("Admin", results.getString("admin"));
              

            }
        } catch(SQLException e) {
        }

        closeConn(conn);
        return user.toString();
    }
    
    public static String deleteUser(String userID, String adminID) {
    	Connection conn = connect();
        Statement stmt = getStmt(conn);
        
        String update = String.format("update Users set `Active` = 0 where UserID = %s;",userID);
        update(stmt, update);
        
        update = String.format("insert into Admin_Log(AdminID, Operation, ObjectType, ObjectID, `Time`) values(%s,'Delete','User',%s,current_timestamp());",adminID,userID);
        update(getStmt(conn),update);
        
        closeConn(conn);
        
    	return "success";
    }
    
    public static String checkUser(String username, String password) {
    	JSONObject user = new JSONObject();
    	String pswdhash = createHash(password);
    	
    	Connection conn = connect();
        Statement stmt = getStmt(conn);        
        
    	String query = "select * from Users where Username='" + username + "' and `Password`='" + pswdhash + "' and `Active` = 1;";
        ResultSet result = getResult(stmt,query);
        
        try {
            if(result.next()) {
            	user.put("UserID",result.getString("UserID"));
                user.put("Username",result.getString("Username"));
                user.put("Password", password);
                user.put("Epc", result.getString("EPC"));
                user.put("Fname",result.getString("Fname"));
                user.put("Lname",result.getString("Lname"));
                user.put("Admin", result.getString("admin"));
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
                user.put("Epc", result.getString("EPC"));
                user.put("Fname",result.getString("Fname"));
                user.put("Lname",result.getString("Lname"));
                user.put("Admin", result.getString("admin"));
            }
            else {
            	return "no user found";
            }
        } catch(SQLException e) {
        }
        
        closeConn(conn);
    	return user.toString();
    }
    
    public static void main(String[] args) {
    	//Connection conn = connect();
    	//Statement stmt = getStmt(conn);
    	//String rooms = getRooms();
    	//String[] tags = ReadTags.readTags(500,2700);
    	/*for(String tag : tags) {
    		if(tag != null) {
    			String res = addItem(tag,"SCALPEL","5");
    			System.out.println(res);
    		}
    	}*/
    	System.out.println(getUsers());
       // System.out.println(rooms);
       // closeConn(conn);
    }
}