//Id of the group of students
var group = "66";

//TODO: create this variable from config file
var pcs = [{IP: "0.0.0.0"}, {IP: "0.0.0.0"}, {IP: "163.117.101.209"}, {IP: "163.117.101.210"}, {IP: "0.0.0.0"},
           {IP: "163.117.101.211"}, {IP: "163.117.101.212"}, {IP: "163.117.101.213"}, {IP: "163.117.101.214"}, {IP: "163.117.101.215"},
           {IP: "163.117.101.216"}, {IP: "163.117.101.217"}, {IP: "163.117.101.218"}, {IP: "163.117.101.219"}, {IP: "163.117.101.220"},
           {IP: "163.117.101.221"}, {IP: "163.117.101.222"}, {IP: "163.117.101.223"}, {IP: "163.117.101.224"}, {IP: "163.117.101.225"},
           {IP: "163.117.101.226"}, {IP: "163.117.101.227"}, {IP: "163.117.101.228"}, {IP: "163.117.101.229"}, {IP: "163.117.101.230"},
           {IP: "163.117.101.231"}, {IP: "163.117.101.232"}, {IP: "163.117.101.233"}, {IP: "163.117.101.234"}, {IP: "163.117.101.235"}
           ];

var teacher = document.location.href.substr(document.location.href.lastIndexOf('=')+1);
if(teacher=="igrojas"){
	group="67";
pcs = [{IP: "0.0.0.0"}, {IP: "0.0.0.0"}, {IP: "163.117.101.180"}, {IP: "163.117.101.179"}, {IP: "0.0.0.0"},
           {IP: "163.117.101.185"}, {IP: "163.117.101.184"}, {IP: "163.117.101.183"}, {IP: "163.117.101.182"}, {IP: "163.117.101.181"},
           {IP: "163.117.101.190"}, {IP: "163.117.101.189"}, {IP: "163.117.101.188"}, {IP: "163.117.101.187"}, {IP: "163.117.101.186"},
           {IP: "163.117.101.195"}, {IP: "163.117.101.194"}, {IP: "163.117.101.193"}, {IP: "163.117.101.192"}, {IP: "163.117.101.191"},
           {IP: "163.117.101.200"}, {IP: "163.117.101.199"}, {IP: "163.117.101.198"}, {IP: "163.117.101.197"}, {IP: "163.117.101.196"},
           {IP: "163.117.101.205"}, {IP: "163.117.101.204"}, {IP: "163.117.101.203"}, {IP: "163.117.101.202"}, {IP: "163.117.101.201"}
           ];
}

var students = [];

var icons = document.getElementsByClassName("comp_icon");
for (var i=0; i<icons.length;i++){
	icons[i].addEventListener("click", function(id){ 
		return function(){ showUsers(id);};
		}(i));
}

function showUsers(id){
	var main = document.getElementById("main");
	main.classList.add("hide");
	var users = document.getElementById("users");
	users.classList.remove("hide");
	users.innerHTML="";
	var actualUsers = pcs[id].users;
	
	if(actualUsers){
		console.log("showUsers (actualUsers): "+pcs[id].users.join(","));
		for(var i=0; i<actualUsers.length; i++){
			var figure = document.createElement("figure");
			users.appendChild(figure);
			var img = document.createElement("img");
			var figurecaption = document.createElement("figurecaption");
			var student;
			for(var j=0; j<students.length;j++){
				if(actualUsers[i] == students[j].username){
					student = students[j];
					break;
				}
			}
			if(student != undefined){
				console.log("showUsers (img): /users/photos/"+student.img);
				img.src = "/users/photos/"+student.img;
				figurecaption.innerHTML = student.name;
			} else {
				img.src = "/users/photos/f1.png";
				figurecaption.innerHTML = "NOT FOUND";
			}
			figure.appendChild(img);
			figure.appendChild(figurecaption);
		}
		console.log("showUsers (description):"+pcs[id].description);
		if(pcs[id].description){
			var desc = document.createElement("div");
			desc.innerHTML = "Problema: "+pcs[id].description;
			users.appendChild(desc);
		}
	}
	//initHelp button
	var button = document.createElement("div");
	button.addEventListener("click", function(){ initHelp(id);});
	users.appendChild(button);
	button.innerHTML = "INIT HELP";
	button.className = "button green relative";
	
	//Back button
	var button = document.createElement("div");
	button.addEventListener("click", goBack);
	users.appendChild(button);
	button.innerHTML = "VOLVER";
	button.className = "button red relative";
}

function goBack(){
	var users = document.getElementById("users");
	users.classList.add("hide");
	users.innerHTML = "";
	var main = document.getElementById("main");
	main.classList.remove("hide");
	
}

function initHelp(id){
	socket.emit('teacher event', {group: group, eventType: "initHelp", user: pcs[id].users});
}

//Groups that asked for help
var pcs_needHelp = []; //List of computers that need help
var help_needed =  false; //Teacher has work to do

//Websockets
//Cambiar la IP a bruch:80
var server = document.location.href.substr(0,document.location.href.lastIndexOf(':'));
server = "163.117.141.206";
var socket = io.connect(server+':80');
socket.on('connect', function() {
	var button = document.getElementsByClassName("button")[0];
	button.classList.add("green");
	button.classList.remove("red");
	button.innerHTML = "Conectado";
	
	socket.emit("new teacher", {"group": group});
	socket.emit("userList", {"group": group});
});

/*
var client = new XMLHttpRequest();
client.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
		students = eval('(' + this.responseText + ')');
	} else if (this.readyState == 4 && this.status != 200){
		//alert("Error when saving the event: "+this.status+" "+this.statusText);
		return;
	}
};
client.open("POST", "/user");
client.setRequestHeader("Content-type", "application/json");
client.send(JSON.stringify({"group": group}));
*/

socket.on("init", function(my_session){

	var state = my_session.session;
	var order = my_session.queue;
	for(var i=0; i<pcs.length;i++){
		var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
		for(var j=0; j<state.length; j++){
console.log("init (data.IP): "+state[j].IP);
			if(pcs[i].IP == state[j].IP){
				if(pcs[i].users){
					pcs[i].users.push(state[j].username);
				}else{
					pcs[i].users = [state[j].username];
				}
				pcs[i].currentExercise = state[j].exercise+1;
				icon.innerHTML = pcs[i].currentExercise;
				//No need of the help field, but description
				console.log("init (description) :"+state[j].description);
				pcs[i].description = state[j].description;
				icon.classList.add("working");
			}
		}
		for(var j=0; j<order.length; j++){
			if(pcs[i].IP == order[j]){
				pcs[i].help = true;
				
				icon.classList.remove("working");
				icon.classList.add("waiting_start");
				//FIFO
				if(!help_needed){//Nobody is being attended
					help_needed = true;
					icons[i].classList.add("next_icon");
					var button = document.getElementsByClassName("button")[1];
					button.classList.add("red");
					button.classList.remove("green");
					button.innerHTML = "BUSY";
				}else{
					pcs_needHelp.push(i);
				}
			}
		}
		if(pcs_needHelp.length>0){
			pcs_needHelp.shift();
		}
	}
});

socket.on('userListResp', function(data){
	students = data;
});

socket.on('event', function (data) {
	//alert(data.IP);
console.log("event (data.IP): "+data.IP);
	for(var i=0; i<pcs.length;i++){
		if(data.IP == pcs[i].IP){
			var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
			switch(data.eventType){
			case "connection":
				if(!pcs[i].users==undefined){
					pcs[i].users = data.user;
					pcs[i].currentExercise = 1;
					pcs[i].help =  false;
					icon.innerHTML = pcs[i].currentExercise;
					icon.classList.add("working");
				}
				break;
			case "finishSection":
				pcs[i].currentExercise +=1;
				icon.innerHTML = pcs[i].currentExercise;
				break;
			case "undoFinishSection":
				pcs[i].currentExercise -=1;
				icon.innerHTML = pcs[i].currentExercise;
				break;
			case "help":
				pcs[i].help = true;
				pcs[i].description = data.description;
				console.log("help (description) :"+data.description);
				icon.classList.remove("working");
				icon.classList.add("waiting_start");
				//FIFO
				if(!help_needed){//Nobody is being attended
					help_needed = true;
					icons[i].classList.add("next_icon");
					var button = document.getElementsByClassName("button")[1];
					button.classList.add("red");
					button.classList.remove("green");
					button.innerHTML = "BUSY";
				}else{
					pcs_needHelp.push(i);
				}
				break;
			case "solved":
				pcs[i].help = false;
				icon.classList.remove("waiting_start");
				icon.classList.add("working");
				if(pcs_needHelp.indexOf(i)!=-1){ //queued, the remove form queue
					pcs_needHelp.splice(pcs_needHelp.indexOf(i),1);
					console.log("solved (found in queue) :"+data.user);
				}else{//not
					console.log("solved (not found in queue) :"+data.user);
					icons[i].classList.remove("next_icon");
					if(pcs_needHelp.length>0){
						icons[pcs_needHelp.shift()].classList.add("next_icon");
					}else{
						help_needed = false;
						var button = document.getElementsByClassName("button")[1];
						button.classList.add("green");
						button.classList.remove("red");
						button.innerHTML = "FREE";
					}
				}
				break;
			}
			break;
		}
	}
  //console.log(data);
});

