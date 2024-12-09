// Uses p5.js v.1.11.2, https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.js

let bVerbose = false;
let socket; 

function setup() {
	createCanvas(500, 500);
	setupOsc(12000, 3334);
}

function draw() {
	background(0, 0, 255);
	
	noFill(); 
	stroke(0,255,0); 
	ellipse(mouseX,mouseY, 200,75);
	fill(0,255,0); 
	textAlign(CENTER);
	text("local (p5.js)", mouseX,mouseY-10);

	let mx = mouseX + 0.000001; // mx must be a float! :(
	let my = mouseY + 0.000001; // add a small number to avoid OSC error. 
	sendOsc("/mouseFromP5", [mx,my]);
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