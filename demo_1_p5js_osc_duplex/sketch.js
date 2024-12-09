// Uses p5.js v.1.9.2, https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.js
// Uses

let rcvX, rcvY;
let bVerbose = false;
let socket; 

function setup() {
	createCanvas(500, 500);
	setupOsc(12000, 3334);
	rcvX = rcvY = 0; 
}

function draw() {
	background(0, 0, 255);
	fill(0, 255, 0);
	ellipse(rcvX,rcvY, 200,75);
	fill(0);
	textAlign(CENTER,CENTER); 
	text("Controlled by Processing", rcvX,rcvY);
	
	noFill(); 
	stroke(0,255,0); 
	ellipse(mouseX,mouseY, 200,75);
	fill(0,255,0); 
	text("local", mouseX,mouseY);

	let mx = mouseX + 0.000001; // must be a float! :(
	let my = mouseY + 0.000001;
	sendOsc("/mouseFromP5", [mx,my]);

}

function receiveOsc(address, value) {
	if (bVerbose){
		console.log("received OSC: " + address + ", " + value);
	}
	if (address == '/mouseFromProcessing') {
		rcvX = value[0];
		rcvY = value[1];
	}
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
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}