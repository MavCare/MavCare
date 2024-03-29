package api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.sql.Connection;

import db.DB;

@Path("{option}/{username}/{password}/{fname}/{lname}")
public class Users {
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getUser(@PathParam("option") String option,
							@PathParam("username") String username,
							@PathParam("password") String password,
							@PathParam("fname") String fname,
							@PathParam("lname") String lname) {
		String user = "";
		
		if(option.equals("login")) {
			user = DB.checkUser(username, password);	
		}
		else if(option.equals("register")) {
			user = DB.registerUser(username, password, fname, lname);
		}
		else if(option.equals("reset")) {
			user = DB.resetPass(username, password);
		}
		///http://localhost:8181/JavaAPI/rest/register/user4@site.com/password4/Fname4/Lname4
		return user;
	}
}
