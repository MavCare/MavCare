package tags;

import com.fazecast.jSerialComm.SerialPort;
import com.thingmagic.*;

public class DeviceDetection {

    public static SerialReader getReader() throws ReaderException
    {
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
                    r.paramSet(TMConstants.TMR_PARAM_TRANSPORTTIMEOUT, 100);
                    r.paramSet(TMConstants.TMR_PARAM_COMMANDTIMEOUT, 100);
                    try
                    {
                        /* MercuryAPI tries connecting to the module using default baud rate of 115200 bps.
                         * The connection may fail if the module is configured to a different baud rate. If
                         * that is the case, the MercuryAPI tries connecting to the module with other supported
                         * baud rates until the connection is successful using baud rate probing mechanism.
                         */
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
                    if (SerialReader.Region.UNSPEC == (SerialReader.Region) r.paramGet(TMConstants.TMR_PARAM_REGION_ID))
                    {
                       SerialReader.Region[] supportedRegions = (SerialReader.Region[]) r.paramGet(TMConstants.TMR_PARAM_REGION_SUPPORTEDREGIONS);
                       if (supportedRegions.length < 1)
                       {
                          throw new Exception("Reader doesn't support any regions");
                       }
                       else
                       {
                          r.paramSet(TMConstants.TMR_PARAM_REGION_ID, supportedRegions[0]);
                       }
                    }
                    r.addTransportListener(r.simpleTransportListener);
                }
                catch (Exception ex)
                {
                   //Exception raised because the device detected is unsupported
                }
              }
          }
       }
       catch (Exception ex)
       {
           System.out.println("Error :" + ex.getMessage());
       }
       return r;
   }
  /*public static void main(String argv[]) {
    SerialReader r = null;
    String uri = "null";
    try{
        r = getReader();
        uri = (String) r.paramGet(TMConstants.TMR_PARAM_READER_URI);
    }catch(Exception e) {};
    System.out.println(uri);
   } */
}