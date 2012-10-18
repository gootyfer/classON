//Nodejs modules
var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
//Socket IO: silent log
io.set('log level', 1);
//Use express config
app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

//File and path modules
var path = require('path');
var fs = require('fs');

//Use own modules
var EventManager = require('./eventmanager').EventManager;
//Database connection for events
var eventManager = new EventManager(config.database.url, config.database.port);
//Load configuration
var config = require('./config.json');


/*
 * HTTP server init
 */
var serve_http = function(request, response){
//console.log('requester IP:'+request.connection.remoteAddress);
//console.log('requesting file:'+request.url);


	var filePath = '.' + request.url;
	if(filePath.indexOf('?')!=-1) filePath = filePath.substr(0,filePath.indexOf('?'));
	if (filePath.substr(-1)==('/')) filePath += 'index.html';
	
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.gif':
            contentType = 'imge/gif';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.ico':
        	contentType = 'image/x-icon';
        	break;
		case '.svg':
        	contentType = 'image/svg+xml';
        	break;
		case '.swf':
			contentType = 'application/x-shockwave-flash';
			break;
		case '.ogg':
			contentType = 'application/ogg';
			break;
			
    }
    
    fs.exists(filePath, function(exists) {
    	if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }  else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        } else {
            response.writeHead(404);
            response.end();
        }
    });
};

var show_stats = function(request, response){
	
}

app.get('/student/*', function (request, response) {
	serve_http(request, response);
});

app.get('/teacher/*', function (request, response) {
	serve_http(request, response);
});

app.get('/users/photos/*', function (request, response) {
	serve_http(request, response);
});

app.get('/stats', function (request, response){
	show_stats(request, response);
});

/*
 * HTTP server end
 */


//sessions: list of users in the session, including their status
//queues: list of the users in the waiting queue (identified by IP)
/*	session_item = { 
		username: ["username", ..],
		exercise: 0,
		help: false,
		IP: "IP"
	}
	queue_item = IPs
	question_item = {
		description: "blah",
		votes: ["user1", "user2"]
	}
 */
var sessions = {};
var queues = {};
var questions = {};

function getSession(id){
	if(sessions[id]==undefined) sessions[id] = [];
	return sessions[id];
}

function getQueue(id){
	if(queues[id]==undefined) queues[id] = [];
	return queues[id];
}

function getQuestions(id){
	if(questions[id]==undefined) questions[id] = [];
	return questions[id];
}

//User manager
function getUserByParam(userParams, handler){
	var mongodb = require('mongodb');
	var server = new mongodb.Server("127.0.0.1", 27017, {});
	new mongodb.Db('classon', server, {}).open(function (error, client) {
		  if (error) throw error;
		  var collection = new mongodb.Collection(client, 'users');
		  collection.find(userParams).toArray(function(err, docs) {
			  handler(err, docs);
			  client.close();
		  });
	});
}
//Get user info of an array of users
function getUsersByUsername(usernameArray, userInfoArray, handler){
	if(usernameArray.length>0){
		var username = usernameArray.pop();
		getUserByParam({username: username}, function(error, userInfo){
			if(!error && userInfo.length>0){
				userInfoArray.push(userInfo[0]);
				getUsersByUsername(usernameArray, userInfoArray, handler);
			}else{
				handler("error");
			}
		});
	}else{
		handler(null, userInfoArray);
	}
}
//Send event to teacher
function sendEventToSession(event, sessionType){
	var clients = io.sockets.clients();
	for(var i=0; i<clients.length; i++){
		clients[i].get(sessionType, function(err, session){
			if(session == event.session){//Check the teacher
				clients[i].emit('event', event);
				console.log('emit new event to teacher in session:'+session);
			}
		});
	}
}
//Send queue position to connected students
function sendQueuePositions(userIPs, solvedIP){
	var clients = io.sockets.clients();
	for(var i=0; i<clients.length; i++){
		//fakeIP
		//clients[i].get("fakeIP", function(err, fakeIP){
			var clientIP = clients[i].handshake.address.address;
			//clientIP = fakeIP;
			var position = userIPs.indexOf(clientIP);
			//console.log('sendQueuePositions: check '+userIPs+' and '+fakeIP);
			if(position!=-1){
				clients[i].emit('update queue', position+1);
				//console.log('emitted update queue to: '+fakeIP);
			}
			if(solvedIP){
				if(solvedIP==clientIP){
					clients[i].emit('update queue', 0);
					//console.log('emitted update queue to: '+fakeIP);
				}
			}
		//});
	}
}

//To be refactorized
function sendQuestions(event, sessionType){
	var clients = io.sockets.clients();
	for(var i=0; i<clients.length; i++){
		clients[i].get(sessionType, function(err, session){
			if(session == event.session){
				clients[i].emit('update questions', event.questions);
				console.log('emit new questions to session:'+session);
			}
		});
	}
}

//Connection of the new websocket client
io.sockets.on('connection', function (socket) {
	//Event to request user list (TEACHER)
	socket.on('userList', function (userParams) {
		//console.log('userList:'+JSON.stringify(userParams));
		getUserByParam(userParams, function(err, docs){
			if(err){
				  console.log('Error: while retrieveing user list');
				  socket.emit('userListResp', []);
				}else{
					//console.log('docs:'+JSON.stringify(docs));
					socket.emit('userListResp', docs);
				}
		});
	});
	
	//Learning event (STUDENT)
	socket.on('new event', function(event){
		eventManager.save(event, function(error, events){
			var event = events[0];
			//fakeIP
			event.IP = socket.handshake.address.address;
			console.log('new event:'+JSON.stringify(event));
			
			//Forward event to the teachers + other students: old
			//socket.broadcast.emit('event', event);

			if(event.eventType == "vote"){
				var my_questions = getQuestions(event.session);
				my_questions[event.qid].votes.push(event.user[0]);
				event.questions = my_questions;
				sendQuestions(event, "sessionStudent");
				sendQuestions(event, "sessionTeacher");
			}else{
				var my_session = getSession(event.session);
				var my_queue = getQueue(event.session);
				
				//console.log('new event(my_session):'+JSON.stringify(my_session));
				//console.log('new event(my_queue):'+JSON.stringify(my_queue));
				
				//console.log('new event(sessions):'+JSON.stringify(sessions));
				//console.log('new event(queues):'+JSON.stringify(queues));
				
				var students = event.user;
				
				//for(var i=0; i<students.length; i++){
					var found = false;
					for(var j=0; j<my_session.length; j++){
						//check by first username only
						if(my_session[j].username.indexOf(students[0])!=-1){
							switch(event.eventType){
							
							case "connection":
								break;
							case "finishSection":
								my_session[j].exercise +=1;
								break;
							case "undoFinishSection":
								my_session[j].exercise -=1;
								break;
							case "help":
								my_session[j].help = true;
								my_session[j].description = event.description;
								//Update questions
								var my_questions = getQuestions(event.session);
								my_questions.push({description: event.description, votes: [event.user[0]]});
								event.questions = my_questions;
								sendQuestions(event, "sessionStudent");
								sendQuestions(event, "sessionTeacher");
								//Update queue
								my_queue.push(event.IP);
								//Send event to this group
								socket.emit("update queue", my_queue.length);
								break;
							case "solved":
								my_session[j].help = false;
								if(my_queue.indexOf(event.IP)!=-1){
									my_queue.splice(my_queue.indexOf(event.IP),1);
								}
								sendQueuePositions(my_queue);
								break;
							}
							found = true;
							break;
						}
					}
					if(!found){
						//Error situation: Not found!
						console.log("Error: not found info about students "+students.join(","));
						my_session.push({ 
							username: students,
							exercise: 0,
							help: false,
							IP: event.IP
						});
					}
					
				//}
				
				console.log("sessions after the event:");
				console.log(my_session);
				console.log("queue after the event:");
				console.log(my_queue);
				
				sendEventToSession(event, "sessionTeacher");
				/*
				//Test retransmission of messages:done
				var clients = io.sockets.clients();
				//console.log('sockets:'+clients);
				//console.log('sockets:'+JSON.stringify(clients));
				//console.log('sockets.length:'+clients.length);
				//console.log(clients[0]);
				//io.sockets.emit('event', event);
				
				for(var i=0; i<clients.length; i++){
					//console.log('sockets[i]:'+JSON.stringify(io.sockets[i]));
					clients[i].get("session", function(err, teacher_session){
						if(teacher_session == event.session){//Check the teacher
							clients[i].emit('event', event);
							//clients[i].emit('init', {session: my_session, queue: my_queue});
							console.log('emit new event to teacher in session:'+teacher_session);
							//console.log(event);
							//console.log(my_session);
							//console.log(my_queue);
						}
					});
				}
				*/

			}
			
		});
	});
	
	
	//End help event (TEACHER)
	socket.on('teacher event', function(event){
		if(event.eventType=="endHelp" && event.user){
			var IP = event.IP;
			delete event.IP;
			
			var my_session = getSession(event.session);
			var my_queue = getQueue(event.session);
			//console.log('teacher event before loop'+JSON.stringify(event));
			var students = event.user;
			//for(var i=0; i<students.length; i++){
				for(var j=0; j<my_session.length; j++){
					//check by first username only
					if(my_session[j].username.indexOf(students[0])!=-1){
						//console.log('teacher event found student for'+students[i]);
						my_session[j].help = false;
						if(my_queue.indexOf(IP)!=-1){
							my_queue.splice(my_queue.indexOf(IP),1);
						}
						sendQueuePositions(my_queue, IP);
						break;
					}
				}
			//}
			console.log("sessions after the event:");
			console.log(my_session);
			console.log("queue after the event:");
			console.log(my_queue);
		}
		eventManager.save(event, function(error, events){
			var event = events[0];
			console.log('teacher event'+JSON.stringify(event));
		});
		
	});
	
	//New student event (STUDENT)
	socket.on("new student", function(users){
		students = users.user;
		console.log('new student:'+students.join(","));
		//Check info of the first student, suppose the second is in the same group
		//Slice is used to make a copy of the array
		getUsersByUsername(students.slice(0), [], function(error, userInfoArray){
			if(error){
				console.log('student registered: error emitted');
				socket.emit('student registered',{error:error});
			}else{
				if(userInfoArray.length==0) return;
				var my_session = getSession(userInfoArray[0].group+users.session);
				var my_queue = getQueue(userInfoArray[0].group+users.session);
				var my_questions = getQuestions(userInfoArray[0].group+users.session);
				//console.log('new student:'+students.join(","));
				//console.log('new student(userInfoArray):'+userInfoArray);
				//for(var i=0; i<students.length; i++){
					var found = false;
					
					for(var j=0; j<my_session.length; j++){
						//check by first username only
						if(my_session[j].username.indexOf(students[0])!=-1){
							console.log('student '+students+' found in session');
							var my_queue_pos = my_queue.indexOf(socket.handshake.address.address);
							//fakeIP
							//my_queue_pos = my_queue.indexOf(users.IP);
							//console.log("Position("+my_queue_pos+") of "+socket.handshake.address.address+" in queue "+my_queue);
							socket.emit('student registered', {
								userInfoArray : userInfoArray,
								exercise: my_session[j].exercise, 
								help: (my_queue_pos===-1)?false:(my_queue_pos+1),
								questions: my_questions
							});
							found = true;
							break;
						}
					}
					if(!found){
						//Not found
						my_session.push({ 
							username: students,
							exercise: 0,
							help: false,
							//fakeIP
							//IP: users.IP
							IP: socket.handshake.address.address
						});
						console.log('new student '+students+' registered on session:');
						//console.log(my_session);
						socket.emit('student registered', {
							userInfoArray : userInfoArray,
							questions: my_questions
						});
					}
					//Save session name to the socket
					socket.set("sessionStudent", userInfoArray[0].group+users.session);
					//fakeIP
					//socket.set("fakeIP", users.IP);
				//}
			}
		});
	});
	
	//New teacher event (TEACHER)
	socket.on("new teacher", function(session){
		var my_session = getSession(session.session);
		var my_queue = getQueue(session.session);
		var my_questions = getQuestions(session.session);
		//console.log('new event(my_session):'+JSON.stringify(my_session));
		//console.log('new event(my_queue):'+JSON.stringify(my_queue));
		//Save session name to the socket
		socket.set("sessionTeacher", session.session);
		socket.emit('init', {session: my_session, queue: my_queue, questions: my_questions});
		console.log('new teacher: at session '+session.session);
	});
	
	//Client disconnected!
	socket.on("disconnect", function(){
		/*
		socket.get('username', function(err, students){
			var index = 0; //Grupo 66
			if(students_66.indexOf(students[0])==-1){//67
				index = 1;
			}
			for(var i=0; i<students.length; i++){
				sessions[index].splice(sessions[index].indexOf(students[i]),1);
			}
		});
		*/
	});
});

//Launch app
server.listen(config.server.port);
console.log('Server running on port '+config.server.port+'...');

