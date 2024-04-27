package api;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.json.*; 
import db.DB;

@Path("")
public class Logs {
	@Path("usage-activity")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String usageActivity() {
		String usageActivity = DB.getUsageActivity();
		return usageActivity;
	}
	
	@Path("admin-activity")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String adminActivity() {
		String adminActivity = DB.getAdminActivity();
		return adminActivity;
	}
}
