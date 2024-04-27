package api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.json.*; 
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
	
	@Path("my-items/{userID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String myItems(@PathParam("userID") String userID) {
		String myItems = DB.getMyItems(userID);
		return myItems;
	}
	
	@Path("scanned-items")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String scannedItems() {
		String items = DB.getScannedItems();
		return items;
	}
	
	@Path("scanned-epcs")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String scannedEpcs() {
		String epcs = DB.getEPCs();
		return epcs;
	}
	
	@Path("check-in")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
    public Response checkIn(String json) {
		JSONObject info = new JSONObject(json);
		String userID = info.getString("UserID");
		String roomID = info.getString("RoomID");
		JSONArray itemIDs = info.getJSONArray("ItemIDs");
		
		for(int i=0; i<itemIDs.length(); i++) {
			DB.checkIn(itemIDs.getString(i), userID, roomID);
		}
        return Response.ok().build();
    }
	
	@Path("check-out")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
    public Response checkOut(String json) {
		JSONObject info = new JSONObject(json);
		String roomID = info.getString("RoomID");
		JSONArray itemIDs = info.getJSONArray("ItemIDs");
		
		for(int i=0; i<itemIDs.length(); i++) {
			DB.checkOut(itemIDs.getString(i), roomID);
		}
        return Response.ok().build();
    }
	
	@Path("set-clean")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response setClean(String json) {
		JSONObject info = new JSONObject(json);
		String roomID = info.getString("RoomID");
		JSONArray itemIDs = info.getJSONArray("ItemIDs");
		
		for(int i=0; i<itemIDs.length(); i++) {
			DB.setStatus("free", itemIDs.getString(i));
			DB.setRoom(itemIDs.getString(i), roomID);
		}
		return Response.ok().build();
	}
	
	@Path("add-item")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response addItem(String json) {
		JSONObject info = new JSONObject(json);
		String adminID = info.getString("AdminID");
		String roomID = info.getString("RoomID");
		JSONArray items = info.getJSONArray("Items");
		for(int i=0; i<items.length(); i++) {
			JSONObject item = new JSONObject(items.getString(i));
			String epc = item.getString("EPC");
			String itemType = item.getString("ItemType");
			DB.addItem(epc, itemType, roomID, adminID);
		}
		return Response.ok().build();
	}
	
	@Path("delete-item")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response deleteItem(String json) {
		JSONObject info = new JSONObject(json);
		String adminID = info.getString("AdminID");
		JSONArray itemIDs = info.getJSONArray("ItemIDs");
		for(int i=0; i<itemIDs.length(); i++) {
			DB.deleteItem(itemIDs.getString(i), adminID);
		}
		return Response.ok().build();
	}
	

	@Path("undelete-item")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response undeleteItem(String json) {
		JSONObject info = new JSONObject(json);
		String itemID = info.getString("ItemID");
		String adminID = info.getString("AdminID");
		DB.undeleteItem(itemID, adminID);
		
		return Response.ok().build();
	}
	
	@Path("item-types")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String itemTypes() {
		return DB.getItemTypes();
	}
	
	@Path("missing-items")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String missingItems() {
		return DB.getMissingItems();
	}
}
