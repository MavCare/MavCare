package api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.json.*; 
import db.DB;

@Path("")
public class Rooms {
	
	@Path("get-room")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getRoom() {
		return DB.getRoom();
	}
	
	@Path("get-rooms")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getRooms() {
		return DB.getRooms();
	}
	
	@Path("add-room")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response addRoom(String json) {
		JSONObject info = new JSONObject(json);
		String adminID = info.getString("AdminID");
		JSONArray rooms = info.getJSONArray("Rooms");
		for(int i=0; i<rooms.length(); i++) {
			JSONObject room = new JSONObject(rooms.getString(i));
			String epc = room.getString("EPC");
			String roomName = room.getString("RoomName");
			DB.addRoom(epc, roomName, adminID);
		}
		return Response.ok().build();
	}
	
	@Path("delete-room")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response deleteRoom(String json) {
		JSONObject info = new JSONObject(json);
		String adminID = info.getString("AdminID");
		JSONArray roomIDs = info.getJSONArray("RoomIDs");
		for(int i=0; i<roomIDs.length(); i++) {
			DB.deleteRoom(roomIDs.getString(i), adminID);
		}
		return Response.ok().build();
	}
	
	@Path("undelete-room")
	@POST
    @Consumes(MediaType.APPLICATION_JSON)
	//@Produces(MediaType.APPLICATION_JSON)
	public Response undeleteRoom(String json) {
		JSONObject info = new JSONObject(json);
		String roomID = info.getString("RoomID");
		String adminID = info.getString("AdminID");
		DB.undeleteRoom(roomID, adminID);
		
		return Response.ok().build();
	}
}