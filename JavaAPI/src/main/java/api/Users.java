package api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import org.json.JSONArray;
import org.json.JSONObject;

import db.DB;

@Path("")
public class Users {
	@Path("{option}/{username}/{password}/{fname}/{lname}/{epc}/{admin}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getUser(@PathParam("option") String option,
							@PathParam("username") String username,
							@PathParam("password") String password,
							@PathParam("fname") String fname,
							@PathParam("lname") String lname,
							@PathParam("admin") String admin,
							@PathParam("epc") String epc) {
		String user = "";
		
		if(option.equals("login")) {
			user = DB.checkUser(username, password);	
		}
		else if(option.equals("register")) {
			user = DB.registerUser(username, password, fname, lname, epc, admin);
		}
		else if(option.equals("reset")) {
			user = DB.resetPass(username, password);
		}
		///http://localhost:8181/JavaAPI/rest/register/user4@site.com/password4/Fname4/Lname4/0/epc
		return user;
	}
	
	@Path("scanned-user")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getScannedUser() {
		String user = DB.getScannedUser();
		return user;
	}
	
	@Path("all-users")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getAllUsers() {
		String users = DB.getUsers();
		return users;
	}
	
	@Path("delete-user")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response deleteRoom(String json) {
		JSONObject info = new JSONObject(json);
		String adminID = info.getString("AdminID");
		JSONArray userIDs = info.getJSONArray("UserIDs");
		for(int i=0; i<userIDs.length(); i++) {
			DB.deleteUser(userIDs.getString(i), adminID);
		}
		return Response.ok().build();
	}
	
	@Path("undelete-user")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response undeleteRoom(String json) {
		JSONObject info = new JSONObject(json);
		String userID = info.getString("UserID");
		String adminID = info.getString("AdminID");
		DB.undeleteUser(userID, adminID);
		
		return Response.ok().build();
	}
}
