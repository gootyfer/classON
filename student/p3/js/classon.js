//Load sections
var sections = document.getElementsByTagName("section");

//Create navigation menu
var menu = document.createElement("div");
menu.id = "menu";
var bg = document.createElement("div");
bg.id = "bg";
var content = document.createElement("div");
content.id = "content";

var header = document.getElementsByTagName("header")[0];

sections[0].parentNode.insertBefore(menu, header);
sections[0].parentNode.insertBefore(bg, header);
sections[0].parentNode.insertBefore(content, header);

content.appendChild(header);

var menuItems = []; //menu items array
for(var i=0; i<sections.length; i++){
	if(sections[i].id != "refs"){ 
		var itemName = sections[i].getElementsByTagName("h2")[0].childNodes[0].nodeValue; //collect section names
		//Create menu item
		var menuitem = document.createElement("div");
		menuitem.innerHTML = "<a class='menuitem' href='#"+sections[i].id+"'>"+itemName+"</a> ";
		menuitem.className = "menuitem";
		menu.appendChild(menuitem);
		//Create led indicator
		var progress = document.createElement("div");
		//progress.innerHTML = "<img src='images/white-off-16.png' />";
		progress.className = "progressIcon off";
		menu.appendChild(progress);
		menuItems.push(menuitem);
		sections[i].classList.add("hide");
	}
	content.appendChild(sections[i]); //append sections to the new content div
}

//Waypoints
/*
$('section').waypoint(function(event, direction){
	for(var i=0; i<sections.length; i++){
		if(sections[i]==this){
			var link = document.getElementsByClassName("menuitem")[i];
			link.classList.add("selected");
			$('.selected').removeClass('selected');
			break;
		}
	}
});
*/

var footer = document.getElementsByTagName("footer")[0];
content.appendChild(footer);

var progressdiv = document.createElement("div");
progressdiv.className = "progressdiv";
var progressbar = document.createElement("meter");
progressbar.max = 100;
progressbar.min = 0;
progressbar.low = 20;
progressbar.high = 80;
progressbar.optimum = 100;
progressbar.value = 0;
progressbar.innerHTML = "Progreso";
progressdiv.appendChild(progressbar);

menu.appendChild(progressdiv);


//Step in the progressbar
var step = Math.ceil(100 / menuItems.length);
var currentSection = 0;

//Init first section
indicateProgress();

//Help button
var helpButton = document.createElement("div");
helpButton.addEventListener("click", askForHelp);
helpButton.innerHTML = "AYUDA";
helpButton.className = "button red";
menu.appendChild(helpButton);
var helpNeeded = false;

//Load info from localstorage; otherwise, from the server
var user = window.localStorage.getItem("user");

if(!user){
	user = [];
	$.blockUI({
		theme:     true, 
        title:    'Participantes', 
		message: "<div>Por favor, introduce el nombre de los participantes para acceder al enunciado. Gracias.<br /><br />" +
		"Participante 1: <input type='text' id='p1' /><br />Participante 2: <input type='text' id='p2' /><br />" +
		"<div><input type='button' onclick='saveUsers()' value='OK' style='margin-left: 350px;' /></div></div>"});
}else{
	user = user.split(",");
	//askForHelp2();
}

function saveUsers(){
	var user1 = document.getElementById("p1").value;
	if(user1) user.push(user1);
	var user2 = document.getElementById("p2").value;
	if(user2) user.push(user2);
	//askForHelp2();
	window.localStorage.setItem("user", user);
	$.unblockUI();
}


function indicateProgress(back){
	if(back){
		
		if(currentSection==(menuItems.length-1)){
			progressdiv.removeChild(progressdiv.lastElementChild);
		}else{
			sections[currentSection+1].classList.add("hide");
			var nextIcon = menuItems[currentSection+1].nextElementSibling;
			nextIcon.removeEventListener("click", finishSection);
			nextIcon.className = "progressIcon off";
		}
		
		var currentIcon = menuItems[currentSection].nextElementSibling;
		currentIcon.removeEventListener("click", undoFinishSection);
		currentIcon.addEventListener("click", finishSection);
		currentIcon.className = "progressIcon progress active";
		
		if(currentSection>0){
			var formerIcon = menuItems[currentSection-1].nextElementSibling;
			formerIcon.addEventListener("click", undoFinishSection);
			formerIcon.className = "progressIcon finished active";
		}
		
	}else{
		sections[currentSection].classList.remove("hide");
		
		if(currentSection>1){ //Remove listener in former former icon
			var formerformerIcon = menuItems[currentSection-2].nextElementSibling;
			formerformerIcon.removeEventListener("click", undoFinishSection);
			formerformerIcon.className = "progressIcon finished";
		}
		
		if(currentSection>0){
			var formerIcon = menuItems[currentSection-1].nextElementSibling;
			formerIcon.addEventListener("click", undoFinishSection);
			formerIcon.removeEventListener("click", finishSection);
			formerIcon.className = "progressIcon finished active";
		}
		
		if(currentSection==menuItems.length){ //Last icon
			var completedDiv = document.createElement("div");
			completedDiv.className = "completed";
			completedDiv.innerHTML = "&iexcl;COMPLETADO!";
			progressdiv.appendChild(completedDiv);
		}else{
			if(currentSection>0){
				$('html, body').animate({
			         scrollTop: $("#"+sections[currentSection].id).offset().top
			     }, 2000);
			}
			var currentIcon = menuItems[currentSection].nextElementSibling;
			currentIcon.addEventListener("click", finishSection);
			currentIcon.className = "progressIcon progress active";
		}
	}
}

function askForHelp(){
	$.blockUI({
		theme:     true, 
        title:    (helpNeeded)?'Solución':'Duda', 
		message: "<div>Por favor, describe brevemente la "+(helpNeeded?'respuesta a tu duda':'duda que vas a preguntar')+".<br /><br />" +
		"<textarea id='duda' style='width:375px;height:100px'></textarea><br /><br />" +
		"<div><input type='button' onclick='$.unblockUI();' value='Cancelar' style='margin-left: 0px;' />" +
		"<input type='button' onclick='askForHelp2()' value='OK' style='margin-left: 270px;' /></div></div>"});
}


function askForHelp2(){
	var eventType = "help";
	if(helpNeeded){
		helpButton.innerHTML = "AYUDA";
		helpButton.className = "button red";
		eventType = "solved";
		/*
		if(helpNeeded === 1){
			helpNeeded = true;
			eventType = "connection";
		}
		*/
	}else{
		helpButton.innerHTML = "SOLUCIONADO";
		helpButton.className = "button green";
	}
	
	//Send event to the server
	
	var event = {
			user: user,
			eventType: eventType,
			eventSection: currentSection
	};
	var duda = document.getElementById("duda");
	if(duda){
		event.description = duda.value;
	}
	sendEventToServer(event);
	
	helpNeeded = !helpNeeded;
	$.unblockUI();
}

function finishSection(){
	$.blockUI({
		theme:     true, 
        title:    "Sección terminada", 
		message: "<div>¿Seguro que has terminado el apartado correpondiente?<br /><br />" +
		"<div><input type='button' onclick='$.unblockUI();' value='Cancelar' style='margin-left: 0px;' />" +
		"<input type='button' onclick='finishSection2();' value='OK' style='margin-left: 270px;' /></div></div>"});
}

function finishSection2(){
	//Send event to the server
	var event = {
			user: user,
			eventType: 'finishSection',
			eventSection: currentSection
	};
	sendEventToServer(event);
	finishSection3();
	$.unblockUI();
}
function finishSection3(){
	progressbar.value += step;
	currentSection++;
	indicateProgress();
}

function undoFinishSection(){
	$.blockUI({
		theme:     true, 
        title:    "Deshacer progreso", 
		message: "<div>¿Seguro que deseas volver al apartado anterior?<br /><br />" +
		"<div><input type='button' onclick='$.unblockUI();' value='Cancelar' style='margin-left: 0px;' />" +
		"<input type='button' onclick='undoFinishSection2();' value='OK' style='margin-left: 270px;' /></div></div>"});
}

function undoFinishSection2(){
	//Send event to the server
	var event = {
			user: user,
			eventType: 'undoFinishSection',
			eventSection: currentSection
	};
	sendEventToServer(event);
	
	progressbar.value -= step;
	currentSection--;
	indicateProgress(-1);
	$.unblockUI();
}

function setExercise(savedSection){
	for (var i=0; i<savedSection; i++){
		finishSection3();
	}
}

var server = document.location.href.substr(0,document.location.href.lastIndexOf(':'));
server = "163.117.141.206";
var socket = io.connect(server+':80');
socket.on('connect', function() {
	socket.emit('new student', {user: user});
	socket.on('student registered', function(state){
		setExercise(state.exercise);
		console.log("exercise:"+state.exercise);
		if(state.help){
			helpNeeded = true;
			helpButton.innerHTML = "SOLUCIONADO";
			helpButton.className = "button green";
		}
	});
	
	//Connection to the practice event
	var event = {
			user: user,
			eventType: "connection",
			eventSection: currentSection
	};
	socket.emit('new event', event);
});


function sendEventToServer(event){
	socket.emit('new event', event);
}

/*
function sendEventToServer(event){
	var client = new XMLHttpRequest();
	client.onreadystatechange = handler;
	try{
		client.open("POST", "/event");
		client.setRequestHeader("Content-type", "application/json");
		client.send(JSON.stringify(event));
	}catch(err){
         //alert("Connection error: " + err);
         return;
    }
}

function handler() {
	if(this.readyState == 4 && this.status == 201){
		//alert("Event saved!");
		return;
	} else if (this.readyState == 4 && this.status != 201){
		//alert("Error when saving the event: "+this.status+" "+this.statusText);
		return;
	}
	
}
*/
