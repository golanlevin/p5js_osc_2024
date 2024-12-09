/**
 This Processing sketch will receive mouse position and audio recognition information
 over OSC from the p5.js sketch in the folder "demo_3_p5js_transmits_teachable_osc".
 You need the library OscP5 to run it: https://sojamo.de/libraries/oscp5/
 Works with Processing 4.3, December 2024
 
 Run npm to get required libraries. 
 This will create and populate the `node_modules` folder:
  $ cd p5js_osc/
  $ npm install
 Start node. It's essential to run this "bridge" for OSC to work: 
  $ node bridge.js
 */
 
import oscP5.*;
import netP5.*;

OscP5 oscP5;
NetAddress myRemoteLocation;

float rcvX; 
float rcvY; 
String label; 
float confidence;

void setup() {
  size(500, 500);
  oscP5 = new OscP5(this, 3334);
  myRemoteLocation = new NetAddress("127.0.0.1", 12000);
  rcvX = 0; 
  rcvY = 0; 
  label = "waiting..."; 
  confidence = 0.0; 
}


void draw() {
  background(0);
  fill(255);
  ellipse(rcvX, rcvY, 200, 75);
  fill(0);
  textAlign(CENTER,CENTER); 
  text("Controlled by p5", rcvX,rcvY);
  
  textAlign(LEFT, CENTER); 
  fill(0,255,0); 
  rect(0,0, width*confidence, 40); 
  text(label, 15,60); 
  fill(0);
  text(nf(confidence,1,2), 15,20); 
}


/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  
  // print the address pattern and the typetag of the received OscMessage
  boolean bVerbose = false; 
  if (bVerbose){
    print("### received an OSC message.");
    print(" addrpattern: "+theOscMessage.addrPattern());
    println(" typetag: "+theOscMessage.typetag());
  }
  
  // check if theOscMessage has the address pattern we are looking for. 
  if(theOscMessage.checkAddrPattern("/mouseFromP5")==true) {
    // check if the typetag is the right one. 
    if(true){ ///theOscMessage.checkTypetag("ff")) {
      // parse theOscMessage and extract the values from the osc message arguments.
      rcvX = theOscMessage.get(0).floatValue(); 
      rcvY = theOscMessage.get(1).floatValue();
    }  
  } 
  
  if (theOscMessage.checkAddrPattern("/recognitionFromP5") == true){
    // parse theOscMessage and extract the values from the osc message arguments.
    label = theOscMessage.get(0).stringValue();
    confidence = theOscMessage.get(1).floatValue();
  }
}
