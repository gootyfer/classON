var canvas;
var ctx;
    
// Coordenadas de la pelota
var x; //= 200;
var y; // = 150;

// Desplazamiento pelota
var dx = 3;
var dy = 3;

// Coordenadas de la raqueta
var yr;

// Dimensiones raqueta
var hr = 75;
var wr = 10;

// Desplazamiento raqueta (un poco más lenta que la pelota)
var dr = 2;

// Estado de la raqueta:
//	0: parado
//	-1: hacia arriba
//	1: hacia abajo
var estadoRaqueta = 0;

var intervalId = 0;  // inicialmente no está jugando

window.onload = init;
document.addEventListener("keydown", moverRaqueta);
document.addEventListener("keyup", pararRaqueta);

var boton;

function init() {

boton = document.getElementById("playButton");
boton.addEventListener("click", playstop);

    // referencia al elemento canvas
    canvas = document.getElementById("canvas");
    
    if (canvas.getContext) {
        // referencia al contexto del canvas
        ctx = canvas.getContext("2d");

	playstop();
/*
	x = canvas.width / 2;
	y = canvas.height / 2;

	yr = (canvas.height - hr) / 2;
	
        intervalId = setInterval(pintar, 10);
        //pintar();
*/

    } else {
        // error
        alert("Su navegador no soporta el elemento canvas");
    }
}

function pintar() {
    
    var dist = 0;    // para controlar el ángulo de rebote con la raqueta

    // borrar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // re-pintar

    yr = yr + (dr * estadoRaqueta);   // movemos la raqueta, si es necesario
    dibujarRaqueta(0, yr);            // raqueta izquierda

    dibujarPelota();
    
    // comprobar rebotes arriba y abajo
    if ( ((y + dy) > canvas.height) || ((y + dy) < 0 )) {
        dy = -dy;
    }

    // comprobar rebotes laterales
    if ((x + dx) > canvas.width) {
        dx = -dx;
    } else if ((x + dx) < 0) {
	
	// comprobar rebote con raqueta
	if ( (y > yr) && ( y < yr + hr) ) {
	    dx = -dx;

	    // cambiar ángulo según nos alejamos del centro de la raqueta
	    // centro de la raqueta: yr + hr/2
	    dist= y - (yr + hr/2); // distancia al centro de la raqueta
	    dy = dy + dist/10;
	    
	} else {
	    // Game over
	    //clearInterval(intervalId);
	    playstop();
	}

    }
    
    // mover pelota
    x = x + dx;
    y = y + dy;


}

function dibujarPelota() {

    ctx.strokeStyle = "gray";
    ctx.fillStyle = "white";
    
    // dibuja un círculo
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function dibujarRaqueta(posx, posy){

    // dibuja un rectángulo
    ctx.strokeStyle = "gray";
    ctx.fillStyle = "black";

    ctx.fillRect(posx, posy, wr, hr);
}

function moverRaqueta(event) {
    if (event.keyCode == 38) estadoRaqueta = -1;
    if (event.keyCode == 40) estadoRaqueta = 1;
}

function pararRaqueta(event) {
    if (event.keyCode == 38 || event.keyCode == 40) estadoRaqueta = 0;
}

//Parada y reinicio del juego
function playstop(){
    if(intervalId){
	clearInterval(intervalId);
	intervalId = 0;
	log("Fin del juego: "+puntos+" puntos");
	puntos = 0;
    }else{
	x = canvas.width / 2;
	y = canvas.height / 2;

	yr = (canvas.height - hr) / 2;
	
	dx = 3;
	dy = 3;

        intervalId = setInterval(pintar, 10);
        //pintar();

	//log("Partido en juego");
    }
}

//Muestra información al jugador
function log(text){
    var log = document.getElementById("log");
    log.innerHTML = text;
}