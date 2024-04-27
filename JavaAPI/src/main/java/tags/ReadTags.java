package tags;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import com.fazecast.jSerialComm.SerialPort; 
import com.thingmagic.*;
import java.io.IOException;


import org.json.JSONArray;

public class ReadTags {

    public static SerialReader getReader() {
    	SerialReader r = null;
    	
    	try
        {
           SerialPort[] portList = SerialPort.getCommPorts();
           String[] results = new String[portList.length];
           for (int i=0; i<portList.length;i++) 
           {
               results[i] = portList[i].getSystemPortName();
               if (results[i].contains("COM"))
               {
                  try
                  {
                     r = (SerialReader)SerialReader.create("tmr:///"+ results[i]);
                  } catch(Exception e) {}
               }
           }
        } catch(Exception e) {}
    	
    	return r;
    }

    public static String[] readTags(int time, int power)
    {
    
    String[] tagID = new String[100];
    
    SerialReader r = getReader();
    int[] antennaList = null; //
    //boolean printTagMetaData = false; 
    
    try
    { 
        TagReadData[] tagReads;
        
        try
        {
            r.connect();
        }
        catch (Exception ex)
        {
            if((ex.getMessage().contains("Timeout")) && (r instanceof SerialReader))
            {
                // create a single element array and pass it as parameter to probeBaudRate().
                int currentBaudRate[] = new int[1];
                // Default baudrate connect failed. Try probing through the baudrate list
                // to retrieve the module baudrate
                ((SerialReader)r).probeBaudRate(currentBaudRate);
                //Set the current baudrate so that next connect will use this baudrate.
                r.paramSet("/reader/baudRate", currentBaudRate[0]);
                // Now connect with current baudrate
                r.connect();
            }
            else
            {
                throw new Exception(ex.getMessage().toString());
            }
        }

        if (SerialReader.Region.UNSPEC == (SerialReader.Region) r.paramGet("/reader/region/id"))
        {
            SerialReader.Region[] supportedRegions = (SerialReader.Region[]) r.paramGet(TMConstants.TMR_PARAM_REGION_SUPPORTEDREGIONS);
            if (supportedRegions.length < 1)
            {
                throw new Exception("Reader doesn't support any regions");
            }
            else
            {
                r.paramSet("/reader/region/id", supportedRegions[0]);
            }
        }
        String model = (String)r.paramGet("/reader/version/model");
        SimpleReadPlan plan;
        // Metadata is not supported for M6 reader. Hence conditionalize here.
        if (!model.equalsIgnoreCase("Mercury6"))
        {
            Set<TagReadData.TagMetadataFlag> setMetaDataFlags = EnumSet.of(TagReadData.TagMetadataFlag.ALL);
            r.paramSet(TMConstants.TMR_PARAM_READER_METADATA, setMetaDataFlags);
        }
        // Create a simplereadplan which uses the antenna list created above
        if (model.equalsIgnoreCase("M3e"))
        {
            // initializing the simple read plan with tag type
            plan = new SimpleReadPlan(antennaList, TagProtocol.ISO14443A, null, null, 1000);
        }
        else
        {
            plan = new SimpleReadPlan(antennaList, TagProtocol.GEN2, null, null, 1000);
        }
        // Set the created readplan
        r.paramSet("/reader/read/plan", plan);
        
        // read power
        int[][] portPowerList = new int[][]{{1,power}};
        r.paramSet("/reader/radio/portWritePowerList",portPowerList);
        r.paramSet("/reader/radio/readPower",power);
        
        // Read tags
        tagReads = r.read(time);
        int j = 0;
        for (TagReadData tr : tagReads)
        {
            tagID[j] = tr.epcString();
            //System.out.println("Tag ID: " + tr.epcString());
            j++;
        }

        // Shut down reader
        r.destroy();
    } 
    catch (ReaderException re)
    {
        System.out.println("Reader Exception: " + re.getMessage());
        // In case of tag id buffer full exception, pull the tags from the module's buffer
        if(re instanceof ReaderCodeException && re.getMessage().equalsIgnoreCase("Tag ID buffer full."))
        {
            if(r instanceof SerialReader)
            {
                try
                {
                    // retrieve all the tags
                    TagReadData[] tagReads = ((SerialReader) r).getAllTagReadsFromBuffer().toArray(new TagReadData[0]);
                    
                    // Print tag reads
                    int k = 0;
                    for (TagReadData tr : tagReads)
                    {
                        tagID[k] = tr.epcString();
                        //System.out.println("Tag ID: " + tr.epcString());
                        k++;
                    }
                }
                catch(ReaderException ex)
                {
                    System.out.println("Reader Exception while pulling tags from buffer: " + ex.getMessage());
                }
            }
        }
        // Shut down reader
        if(r!=null)
        {
            r.destroy();
        }

    }
    catch (Exception re)
    {
        // Shut down reader
        if(r!=null)
        {
            r.destroy();
        }
        System.out.println("Exception: " + re.getMessage());
    }
    return tagID;
  }
  
  public static void main(String argv[]) {
	for(int i=0; i<1; i++) {
		JSONArray tagList = new JSONArray();
        String[] tags = ReadTags.readTags(6, 3);
        for(String tag : tags) {
            if(tag != null) {
               tagList.put(tag);
            }
        }
        String Json = tagList.toString();
        System.out.println(tagList.length());
        System.out.println(tagList.toString());
        
	}
	
  }
}