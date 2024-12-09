// Teachable Machine Audio Recognizer via ml5.js
// Recognizes "Ooo", "Eee", "Ahh", "Ohh" (...as sung by Golan, anyway)
// and transmits the detected result via OSC to (e.g.) Processing/MaxMSP, etc.
//
// Requires https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.js
// Requires the OLD ml5: https://unpkg.com/ml5@0.12.0/dist/ml5.min.js


// Global variables to store the classifier and its results:
let classifier;
let label = 'listening...';
let confidence = 0.0; 

// Teachable Machine model URL, 
// trained with https://teachablemachine.withgoogle.com/train/audio
let soundModel = "https://teachablemachine.withgoogle.com/models/CRMYqkhY2/";

// OSC variables:
let bVerbose = false;
let socket; 


function preload() {
	// Load the Teachable Machine audio model before setup()
	classifier = ml5.soundClassifier(soundModel + 'model.json');
}


function setup() {
	createCanvas(500, 500);
	setupOsc(12000, 3334);

	// Start classifying. ml5 will continuously listen to the mic,
	// and will call the 'gotResult' function when it gets a result:
	classifier.classify(gotResult);
}


function draw() {
	background(0, 0, 255);
	
	// Draw a green ellipse at the mouse position
	noFill(); 
	stroke(0,255,0); 
	ellipse(mouseX,mouseY, 200,75);
	fill(0,255,0); 
	textAlign(CENTER);
	text("local (p5.js)", mouseX,mouseY-10);

	// Draw the most likely audio label
	fill(255);
	noStroke(); 
	textSize(32);
	textAlign(CENTER, CENTER);
	text(label, width / 2, height / 2);
  
	// Draw a confidence bar for that label
	fill('lime'); 
	rect(0,0, confidence*width, 40); 
	fill(0); 
	textAlign(LEFT, CENTER);
	text(nf(confidence,1,2), 15,20); 

	// Transmit the mouse, recognition label, and recognition confidence via OSC.
	let mx = mouseX + 0.000001; // mx, my must be floats to avoid OSC error.
	let my = mouseY + 0.000001; // add a tiny float number to avoid the error. 
	sendOsc("/mouseFromP5", [mx,my]);
	sendOsc("/recognitionFromP5", [label, confidence]);
}


function sendOsc(address, value) {
	socket.emit('message', [address].concat(value));
}


function setupOsc(oscPortIn, oscPortOut) {
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
}


// The model recognizing a sound will trigger this event.
// Note that the order of arguments (error, results) has been swapped in newer ml5.js versions!
function gotResult(error, results) {
	if (error) {
	  console.error(error);
	  return;
	}
	
	// The results are in an array, 
	// sorted in decreasing order of confidence.
	label = results[0].label;
	confidence = results[0].confidence;
}