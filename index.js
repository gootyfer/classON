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

//Load configuration
var config = require('./config.json');
var rooms = require('./rooms.json');

//Use own modules
var EventManager = require('./eventmanager').EventManager;
var UserManager = require('./usermanager').UserManager;
var SessionManager = require('./sessionmanager').SessionManager;
//Database connections
var eventManager = new EventManager(config.database.url, config.database.port);
var userManager = new UserManager(config.database.url, config.database.port);
var sessionManager = new SessionManager(config.database.url, config.database.port);


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


app.get('/student/*', function (request, response) {
	serve_http(request, response);
});

app.get('/teacher/*', function (request, response) {
	serve_http(request, response);
});

app.get('/users/photos/*', function (request, response) {
	serve_http(request, response);
});

/*
 * HTTP server end
 */

function getStation(room, IP){
	for(var i=0; i<rooms.length; i++){
		if(rooms[i].name === room){
			return rooms[i].ips.indexOf(IP) +1;
		}
	}
	return null;
}

//Connection of the new websocket client
io.sockets.on('connection', function (socket) {

	//Event to request user list (TEACHER)
	socket.on('user list', function (userParams) {
		//console.log('userList:'+JSON.stringify(userParams));
		userManager.find(userParams, function(err, docs){
			if(err){
				console.log('Error: while retrieveing user list');
				socket.emit('userListResp', []);
			}else{
				//console.log('docs:'+JSON.stringify(docs));
				socket.emit('userListResp', docs);
			}
		});
	});
	
	//New teacher event (TEACHER)
	socket.on('new teacher', function(session){
		sessionManager.findOrCreate(session, function(error, currentSession){
			if(!error && results.length > 0){
				socket.join(currentSession._id);
				socket.emit('init', currentSession.sessionData);
				console.log('new teacher: at session '+session.subject+' '+session.group+' '+session.assignment);
			}
		});
	});

	//New student event (STUDENT)
	/*
		1. check user in the database
		2. find/create current session
		3. if user not in session, save to the session
		4. broadcast data
	*/
	socket.on("new student", function(session){
		//Check info of the first student, suppose the second is in the same group
		userManager.findByUsername(session.userNames, function(error, userInfoArray){
			if(error){
				console.log('student registered: error emitted');
				socket.emit('student registered',{error:error});
				return;
			}
			if(userInfoArray.length==0){
				console.log('student not found: error emitted');
				socket.emit('student registered',{error:'not found'});
				return;
			}
			var sessionParams = {
				subject:session.subject, 
				group:userInfoArray[0].group, 
				assignment:session.assignment
			};
			sessionManager.findOrCreate(sessionParams, function(error, currentSession){
				var users = currentSession.sessionData.users;
				var station = session.station || getStation(currentSession.room, socket.handshake.address.address);
				if(!station){
					console.log('IP not found: error emitted');
					socket.emit('student registered',{error:'not station'});
					return;
				}
				//Add user to room
				socket.join(currentSession._id);
				//TODO: check if students registered in a previous station
				var user = users[station];
				if(!user){//New user
					user = { 
						username: session.userNames,
						exercise: 0,
						currentQuestion: null,
						station: station
					};
					users[station] = user;
					sessionManager.update(currentSession._id, currentSession.sessionData, function(){
						console.log('new student '+session.userNames.join(',')+' registered on session');
					});
				}
				//Answer back: registration OK
				socket.emit('student registered', {
					currentUser : users[i],
					queue: currentSession.sessionData.users, 
					questions: currentSession.sessionData.questions,
					session: sessionParams
				});

				//Broadcast updated users
				io.socket.in(currentSession._id).emit('update users', users);
			});
		});
	});

	//Init help event (TEACHER)
	socket.on('init help', function(event){
		eventManager.save(event, function(error, events){
			console.log('teacher init help '+JSON.stringify(events[0]));
		});
	});

	//End help event (TEACHER)
	socket.on('end help', function(event){
		eventManager.save(event, function(error, events){
			console.log('teacher end help '+JSON.stringify(events[0]));
		});
		sessionManager.findOrCreate(event.session, function(error, currentSession){
			//Not update user until they enter the answer
			//var user = currentSession.sessionData.users[event.station];
			//user.currentQuestion = null;
			var queue = currentSession.sessionData.queue;
			if(queue.indexOf(station)!=-1){
				queue.splice(queue.indexOf(station),1);
			}
			//io.socket.in(currentSession._id).emit('update users', currentSession.sessionData.users);
			io.socket.in(currentSession._id).emit('update queue', queue);

			sessionManager.update(currentSession._id, currentSession.sessionData, function(){});
		});
	});

	//Learning event (STUDENT)
	socket.on('student event', function(event){
		eventManager.save(event, function(error, events){
			console.log('new event:'+JSON.stringify(event));
		});

		sessionManager.findOrCreate(event.session, function(error, currentSession){
			switch(event.type){
				case "new vote":
					currentSession.sessionData.questions[event.qid].votes.push(event.userNames[0]);
					io.socket.in(currentSession._id).emit('update questions', currentSession.sessionData.questions);
					break;
				case "new question":
					var question = {
						description: event.description,
						votes: [event.userNames[0]],
						answers: [],
						exercise: event.exercise
					};
					currentSession.sessionData.questions.push(question);
					currentSession.sessionData.queue.push(event.station);
					currentSession.sessionData.users[event.station].currentQuestion = currentSession.sessionData.questions.length -1;
					io.socket.in(currentSession._id).emit('update questions', currentSession.sessionData.questions);
					io.socket.in(currentSession._id).emit('update queue', currentSession.sessionData.queue);
					io.socket.in(currentSession._id).emit('update users', currentSession.sessionData.users);
					break;
				case "new answer":
					var answer = {
						description: event.description,
						votes: [event.userName[0]]
					}
					var question = currentSession.sessionData.questions[event.qid];
					question.answers.push(answer);
					io.socket.in(currentSession._id).emit('update questions', currentSession.sessionData.questions);
					var user = currentSession.sessionData.users[event.station];
					if(user.currentQuestion == event.qid){
						user.currentQuestion = null;
						var queue = currentSession.sessionData.queue;
						if(queue.indexOf(event.station)!=-1){
							queue.splice(queue.indexOf(event.station),1);
						}
						io.socket.in(currentSession._id).emit('update users', currentSession.sessionData.users);
						io.socket.in(currentSession._id).emit('update queue', queue);
					}
					break;
				case "progression":
					var user = currentSession.sessionData.users[event.station];
					user.exercise +=1;
					io.socket.in(currentSession._id).emit('update users', currentSession.sessionData.users);
					break;
				case "regression":
					var user = currentSession.sessionData.users[event.station];
					user.exercise -=1;
					io.socket.in(currentSession._id).emit('update users', currentSession.sessionData.users);
					break;
			}
			sessionManager.update(currentSession._id, currentSession.sessionData, function(){});
		});
	});
	
	//Client disconnected!
	socket.on("disconnect", function(){
	});
});

//Launch app
server.listen(config.server.port);
console.log('Server running on port '+config.server.port+'...');