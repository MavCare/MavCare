package api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.sql.Connection;

import db.DB;

@Path("")
public class Items {
	@Path("all-items")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String allItems() {
		String items = DB.getAllItems();
		return items;
	}
	
	@Path("scanned-items")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String scannedItems() {
		String items = DB.getScannedItems();
		return items;
	}
}
