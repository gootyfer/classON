//Id of the group of students
var group = "AMM_66";

//TODO: create this variable from config file
var pcs = [{IP: "163.117.101.208"}, {IP: "163.117.101.209"}, {IP: "163.117.101.210"}, {IP: "0.0.0.0"}, {IP: "0.0.0.0"},
           {IP: "163.117.101.211"}, {IP: "163.117.101.212"}, {IP: "163.117.101.213"}, {IP: "163.117.101.214"}, {IP: "163.117.101.215"},
           {IP: "163.117.101.216"}, {IP: "163.117.101.217"}, {IP: "163.117.101.218"}, {IP: "163.117.101.219"}, {IP: "163.117.101.220"},
           {IP: "163.117.101.221"}, {IP: "163.117.101.222"}, {IP: "163.117.101.223"}, {IP: "163.117.101.224"}, {IP: "163.117.101.225"},
           {IP: "163.117.101.226"}, {IP: "163.117.101.227"}, {IP: "163.117.101.228"}, {IP: "163.117.101.229"}, {IP: "163.117.101.230"},
           {IP: "163.117.101.231"}, {IP: "163.117.101.232"}, {IP: "163.117.101.233"}, {IP: "163.117.101.234"}, {IP: "0.0.0.0"}
           ];

var queryString = document.location.href.substr(document.location.href.lastIndexOf('?')+1);
var parameters = queryString.split("&");

var teacher = parameters[0].split("=")[1];
var session = parameters[1].split("=")[1];

if(teacher=="igrojas"){
	group="AMM_67";
	pcs = [{IP: "0.0.0.0"}, {IP: "0.0.0.0"}, {IP: "163.117.101.180"}, {IP: "163.117.101.179"}, {IP: "163.117.101.178"},
           {IP: "163.117.101.185"}, {IP: "163.117.101.184"}, {IP: "163.117.101.183"}, {IP: "163.117.101.182"}, {IP: "163.117.101.181"},
           {IP: "163.117.101.190"}, {IP: "163.117.101.189"}, {IP: "163.117.101.188"}, {IP: "163.117.171.58"}, {IP: "163.117.101.186"},
           {IP: "163.117.101.195"}, {IP: "163.117.101.194"}, {IP: "163.117.101.193"}, {IP: "163.117.101.192"}, {IP: "163.117.101.191"},
           {IP: "163.117.101.200"}, {IP: "163.117.101.199"}, {IP: "163.117.101.198"}, {IP: "163.117.101.197"}, {IP: "163.117.101.196"},
           {IP: "0.0.0.0"}, {IP: "163.117.101.204"}, {IP: "163.117.101.203"}, {IP: "163.117.171.67"}, {IP: "0.0.0.0"}
           ];
}else if(teacher=="derick"){
	group="AS_95";
	pcs = [{IP: "163.117.144.139"}, {IP: "163.117.144.138"}, {IP: "163.117.144.137"}, {IP: "163.117.144.136"}, {IP: "163.117.144.135"},
           {IP: "163.117.144.134"}, {IP: "163.117.144.133"}, {IP: "163.117.144.132"}, {IP: "163.117.144.131"}, {IP: "163.117.144.130"},
           {IP: "163.117.144.220"}, {IP: "163.117.144.219"}, {IP: "163.117.144.218"}, {IP: "163.117.144.217"}, {IP: "163.117.144.216"},
           {IP: "163.117.144.215"}, {IP: "163.117.144.214"}, {IP: "163.117.144.213"}, {IP: "163.117.144.212"}, {IP: "163.117.144.211"},
           {IP: "163.117.144.210"}, {IP: "163.117.144.209"}, {IP: "163.117.144.208"}, {IP: "163.117.144.207"}, {IP: "163.117.144.206"},
           {IP: "163.117.144.205"}, {IP: "163.117.144.204"}, {IP: "163.117.144.203"}, {IP: "163.117.144.202"}, {IP: "163.117.144.201"}
           ];
}else if(teacher=="damaris"){
	group="AS_91";
	pcs = [{IP: "163.117.171.156"}, {IP: "163.117.171.155"}, {IP: "163.117.171.154"}, {IP: "163.117.171.153"}, {IP: "163.117.171.152"},
           {IP: "163.117.171.151"}, {IP: "163.117.171.150"}, {IP: "163.117.171.149"}, {IP: "163.117.171.148"}, {IP: "163.117.171.147"},
           {IP: "163.117.171.146"}, {IP: "163.117.171.145"}, {IP: "163.117.171.144"}, {IP: "163.117.171.143"}, {IP: "163.117.171.142"},
           {IP: "163.117.171.141"}, {IP: "163.117.171.140"}, {IP: "163.117.171.139"}, {IP: "163.117.171.138"}, {IP: "163.117.171.137"},
           {IP: "163.117.171.136"}, {IP: "163.117.171.135"}, {IP: "163.117.171.134"}, {IP: "163.117.171.133"}, {IP: "163.117.171.132"},
           {IP: "163.117.171.129"}, {IP: "163.117.171.131"}, {IP: "163.117.171.130"}, {IP: "0.0.0.0"}, {IP: "0.0.0.0"}
           ];
}else if(teacher=="hugo" || teacher=="mar"){
	if(teacher=="hugo") group="AS_66";
	if(teacher=="mar") group="AS_67";
	pcs = [{IP: "163.117.171.128"}, {IP: "163.117.171.127"}, {IP: "163.117.171.126"}, {IP: "163.117.171.125"}, {IP: "163.117.171.124"},
           {IP: "163.117.171.123"}, {IP: "163.117.171.122"}, {IP: "163.117.171.121"}, {IP: "163.117.171.120"}, {IP: "163.117.171.119"},
           {IP: "163.117.171.118"}, {IP: "163.117.171.117"}, {IP: "163.117.171.116"}, {IP: "163.117.171.115"}, {IP: "163.117.171.114"},
           {IP: "163.117.171.113"}, {IP: "163.117.171.112"}, {IP: "163.117.171.111"}, {IP: "163.117.171.110"}, {IP: "163.117.171.109"},
           {IP: "163.117.171.108"}, {IP: "163.117.171.107"}, {IP: "163.117.171.106"}, {IP: "163.117.171.105"}, {IP: "163.117.171.104"},
           {IP: "0.0.0.0"}, {IP: "0.0.0.0"}, {IP: "163.117.171.103"}, {IP: "163.117.171.102"}, {IP: "163.117.171.101"}
           ];
}

var students = [];

var icons = document.getElementsByClassName("comp_icon");
for (var i=0; i<icons.length;i++){
	icons[i].addEventListener("click", function(id){ 
		return function(){ showUsers(id);};
		}(i));
}

document.getElementById("questions").addEventListener("click",showQuestions);

/*
 * Timer in the detail page
 */
var timer;
var timerTimeout;
var startTime;

function startTimer(){
	startTime = (new Date()).getTime();
	timerTimeout = setInterval(updateTimer, 1000);
}

function updateTimer(){
	var timeDiff = new Date();
	var diff = timeDiff.getTime() - startTime;
	timeDiff.setTime(diff);
	var minutes = timeDiff.getMinutes();
	var seconds = timeDiff.getSeconds();
	timer.innerHTML = (minutes<9?"0"+minutes:minutes) + ":" + (seconds<9?"0"+seconds:seconds);
}

function stopTimer(){
	if(timerTimeout){
		clearInterval(timerTimeout);
	}
}

function showUsers(id){
	var main = document.getElementById("main");
	main.classList.add("hide");
	var users = document.getElementById("users");
	users.classList.remove("hide");
	users.innerHTML="";
	var actualUsers = pcs[id].users;
	
	if(actualUsers){
		//console.log("showUsers (actualUsers): "+pcs[id].users.join(","));
		for(var i=0; i<actualUsers.length; i++){
			var figure = document.createElement("div");
			users.appendChild(figure);
			var img = document.createElement("img");
			var figurecaption = document.createElement("div");
			var student;
			for(var j=0; j<students.length;j++){
				if(actualUsers[i] == students[j].username){
					student = students[j];
					break;
				}
			}
			if(student != undefined){
				//console.log("showUsers (img): /users/photos/"+student.img);
				img.src = "/users/photos/"+student.img;
				figurecaption.innerHTML = student.surname+" "+student.name;
			} else {
				img.src = "/users/photos/f1.png";
				figurecaption.innerHTML = "NOT FOUND";
			}
			img.width = "200";
			figure.className = "figure";
			figure.appendChild(img);
			figure.appendChild(figurecaption);
		}
		//console.log("showUsers (description):"+pcs[id].description);
		if(pcs[id].description){
			var desc = document.createElement("div");
			desc.className = "desc";
			desc.innerHTML = "Duda: "+pcs[id].description;
			users.appendChild(desc);
		}
	}
	
	//Timer
	timer = document.createElement("div");
	timer.innerHTML = "00:00";
	timer.className = "timer";
	users.appendChild(timer);
	
	//initHelp button
	var button = document.createElement("div");
	button.addEventListener("click", onInitHelp = function(){ initHelp(id, button);});
	users.appendChild(button);
	button.innerHTML = "INIT HELP";
	button.className = "button green help";
	
	//Back button
	var back_button = document.createElement("div");
	back_button.addEventListener("click", function(){ goBack(id, button);});
	users.appendChild(back_button);
	back_button.innerHTML = "VOLVER";
	back_button.className = "button gray back";
	
}

var questions = [];

function showQuestions(){
	var main = document.getElementById("main");
	main.classList.add("hide");
	var users = document.getElementById("users");
	users.classList.remove("hide");
	users.innerHTML="";

	var sHTML = "<h4>Questions</h4><ul>";
	for(var i=0; i<questions.length;i++){
		sHTML+="<li>"+questions[i].description+" (<span>"+questions[i].votes.length+
			" votos</span>)</li>";
	}
	sHTML += "</ul><br><input type='button' class='button gray back' value='VOLVER' "+
	"onclick='goBack()' />";
	users.innerHTML = sHTML;
}

var helpingStudent =  false;

function goBack(id, button){
	if(id && helpingStudent){
		endHelp(id, button);
	}
	var users = document.getElementById("users");
	users.classList.add("hide");
	users.innerHTML = "";
	var main = document.getElementById("main");
	main.classList.remove("hide");	
}

function initHelp(id, button){
	button.removeEventListener("click", onInitHelp);
	button.addEventListener("click", onEndHelp = function(){ endHelp(id, button);});
	button.innerHTML = "END HELP";
	button.className = "button red help";
	
	socket.emit('teacher event', {
		session: group+session, 
		eventType: "initHelp", 
		eventSection: pcs[id].currentExercise,
		user: pcs[id].users
		});
	//Teacher is helping the students on screen
	helpingStudent =  true;
	
	//Start timer
	startTimer();
}

function endHelp(id, button){
	//Redraw interface
	problemSolved(id);
	//Stop timer
	stopTimer();
	//Change button display
	button.removeEventListener("click", onEndHelp);
	button.addEventListener("click", onInitHelp = function(){ initHelp(id, button);});
	button.innerHTML = "INIT HELP";
	button.className = "button green help";
	//No more helping
	helpingStudent =  false;
	//Save event
	socket.emit('teacher event', {
		session: group+session, 
		eventType: "endHelp", 
		eventSection: pcs[id].currentExercise,
		user: pcs[id].users,
		IP: pcs[id].IP
		});
}

//Groups that asked for help
var pcs_needHelp = []; //List of computers that need help
var help_needed =  false; //Teacher has work to do

//Websockets
var server = document.location.href.substr(0,document.location.href.lastIndexOf(':'));
server = "163.117.141.206";
//local server
//server = "127.0.0.1";
var socket = io.connect(server+':80');
socket.on('connect', function() {
	var button = document.getElementsByClassName("button")[0];
	button.classList.add("green");
	button.classList.remove("red");
	button.innerHTML = "Connected";
	
	socket.emit("new teacher", {session: group+session});
	socket.emit("userList", {group: group});
});

socket.on("init", function(my_session){
	console.log("init received. session received:");
	console.log(my_session.session);
	console.log("queue received:"+my_session.queue);
	var state = my_session.session;
	var order = my_session.queue;
	questions = my_session.questions;
	for(var i=0; i<pcs.length;i++){
		var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
		for(var j=0; j<state.length; j++){
//console.log("init (data.IP): "+state[j].IP);
			if(pcs[i].IP == state[j].IP){
				pcs[i].users = state[j].username;
				/*
				if(pcs[i].users){
					pcs[i].users.push(state[j].username);
				}else{
					pcs[i].users = [state[j].username];
				}
				*/
				pcs[i].currentExercise = state[j].exercise+1;
				icon.innerHTML = pcs[i].currentExercise;
				//No need of the help field, but description
				//console.log("init (description) :"+state[j].description);
				pcs[i].description = state[j].description;
				icon.classList.add("working");
			}
		}
		
		
		//if(pcs_needHelp.length>0){
		//	pcs_needHelp.shift();
		//}
	}

	for(var j=0; j<order.length; j++){
		for(var i=0; i<pcs.length;i++){
			var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
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
					//console.log("add to queue:"+pcs[i].IP);
					pcs_needHelp.push(i);
				}
			}
		}
	}
	//console.log("session in teacher browser:");
	//console.log(pcs);
	console.log("queue in teacher browser:"+pcs_needHelp);
});

socket.on('userListResp', function(data){
	students = data;
});


function problemSolved(index){
	var icon = document.getElementsByClassName("comp_icon")[index].firstElementChild;
	pcs[index].help = false;
	icon.classList.remove("waiting_start");
	icon.classList.add("working");
	if(pcs_needHelp.indexOf(index)!=-1){ //queued, then remove from queue
		pcs_needHelp.splice(pcs_needHelp.indexOf(index),1);
	}else{//not queued
		if(icons[index].classList.contains("next_icon")){ //This group was in the first position of the queue
			icons[index].classList.remove("next_icon");
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
	}
}
/*
function changeColor(index){
	var icon = document.getElementsByClassName("comp_icon")[index].firstElementChild;
	var color = pcs[index].color;
	if (color==0){
		icon.style.backgroundColor = "";
		//clearInterval(pcs[index].interval);
	}else{
		color--;
		icon.style.backgroundColor = "#f5"+color.toString(16)+"00";
		pcs[index].color = color;
	}
}
*/
socket.on('event', function (data) {
	//alert(data.IP);
console.log("event (data.IP): "+data.IP+" event:"+data.eventType+" user:"+data.user);
	for(var i=0; i<pcs.length;i++){
		if(data.IP == pcs[i].IP){
			var icon = document.getElementsByClassName("comp_icon")[i].firstElementChild;
			//console.log("event: IP found!");
			switch(data.eventType){
			case "connection":
				if(pcs[i].users==undefined){
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

				pcs[i].color = 0x90;
				//pcs[i].interval = setInterval("changeColor("+i+")", 10000);
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
				problemSolved(i);
				break;
			}
			console.log("event received. info:");
			console.log(pcs[i]);
			console.log("queue:"+pcs_needHelp);
			break;
		}
	}
  //console.log(data);
});
socket.on('update questions', function(new_questions){
	console.log("new questions:"+new_questions);
	questions = new_questions;
});
