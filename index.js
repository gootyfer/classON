//Nodejs modules
var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
  
//Socket IO: silent log
io.set('log level', 1);

//Use express config to serve static content
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.set('view engine', 'ejs');
	app.set('view options', {layout: false});
});

//File and path modules
var path = require('path');
var fs = require('fs');

//Load configuration
var config = require('./config.json');
//var rooms = require('./rooms.json');

//Use own modules
var EventManager = require('./models/eventmanager').EventManager;
var UserManager = require('./models/usermanager').UserManager;
var SessionManager = require('./models/sessionmanager').SessionManager;
//Database connections
var eventManager = new EventManager(config.database.url, config.database.port);
var userManager = new UserManager(config.database.url, config.database.port);
var sessionManager = new SessionManager(config.database.url, config.database.port);

//TODO: use dynamic data for classroom templates, subject, assingment and group
app.get('/login', function(req, res){
	res.render('login.ejs', {nRows : 6, nColumns : 5, subject: 'amm', assignment:'p11'});
});

app.get('/', function(req, res){
	res.redirect('/login');
});

app.get('/go', function(req, res){
	var session = {};
	session.userNames = [];
	if(req.query['nia1']) session.userNames.push(req.query['nia1']);
	if(req.query['nia2']) session.userNames.push(req.query['nia2']);
	session.station = req.query['station'];
	session.subject = req.query['subject'];
	session.assignment = req.query['assignment'];
	newStudent(session, res);
});

/*
Student login
	1. check user in the database
	2. find/create current session
	3. if user not in session, save to the session
*/
function newStudent(session, res){
	//Check info of the first student, suppose the second is in the same group
	userManager.findByUsername(session.userNames, function(error, userInfoArray){
		if(error){
			console.log('student registered: error emitted');
			res.redirect('/login?error=99');
			return;
		}
		if(userInfoArray.length==0){
			console.log('student not found: error emitted');
			res.redirect('/login?error=1');
			return;
		}
		//Take first user group
		session.group = userInfoArray[0].group;
		var sessionParams = {
			subject:session.subject, 
			group:session.group, 
			assignment:session.assignment
		};
		sessionManager.findOrCreate(sessionParams, function(error, currentSession){
			if(error){
				console.log('error occured when findOrCreate session');
				res.redirect('/login?error=99');
				return;
			}
			//console.log(currentSession);
			var users = currentSession.sessionData.users;
			var station = session.station;
			var user = users[station];
			//Check station not in use
			if(user){//current station occupied
				//console.log('check the same:');
				//console.log(users[station].username);
				//console.log(session.userNames);
				 if(user.username[0] != session.userNames[0]){//station occupied by others
					console.log('station not free: error emitted');
					res.redirect('/login?error=2');
					return;
				}
			}else{//Current station free
				//Check if students registered in a previous station
				for(var i=0;i<users.length;i++){
					// if(users[i])
					// 	console.log('Check *'+users[i].username[0]+'* and *'+session.userNames[0]+'*');
					if(users[i] && users[i].username[0] == session.userNames[0]){
						//Users were in 
						//Save progress
						user = { 
							username: session.userNames,
							exercise: users[i].exercise,
							currentQuestion: users[i].currentQuestion,
							station: station
						};
						//Remove duplicates
						users[station] = user;
						users[i] = null;
						//Save
						sessionManager.update(currentSession._id, currentSession.sessionData, function(){
							console.log('students '+session.userNames.join(',')+' changed position on session');
						});
						break;
					}
				}
			}
			
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
			session.userInfo = userInfoArray;
			session.server = config.server;
			session.currentQuestion = user.currentQuestion;
			//console.log('session');
			//console.log(session);
			res.render('index.ejs', session);
		});
	});

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
			if(!error && currentSession){
				socket.join(currentSession._id);
				socket.emit('init', currentSession.sessionData);
				console.log('new teacher: at session '+session.subject+' '+session.group+' '+session.assignment);
			}
		});
	});

	//New student event (STUDENT)
	/*
		1. find/create current session
		2. broadcast data
	*/
	socket.on('new student', function(sessionParams){
		sessionManager.findOrCreate(sessionParams.context, function(error, currentSession){
			var users = currentSession.sessionData.users;
			//Add user to room
			socket.join(currentSession._id);

			//Answer back: registration OK
			socket.emit('student registered', {
				queue: currentSession.sessionData.queue, 
				questions: currentSession.sessionData.questions,
				currentUserInfo: users[sessionParams.station]
			});

			//Broadcast updated users
			io.sockets.in(currentSession._id).emit('update users', users);
		});
	});

	//Init help event (TEACHER)
	socket.on('init help', function(event){
		//TODO: log student question being solved
		eventManager.save(event, function(error, events){
			console.log('teacher init help '+JSON.stringify(events[0]));
		});
	});

	//End help event (TEACHER)
	socket.on('end help', function(event){
		//TODO: log student question being solved
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
			//io.sockets.in(currentSession._id).emit('update users', currentSession.sessionData.users);
			io.sockets.in(currentSession._id).emit('update queue', queue);

			sessionManager.update(currentSession._id, currentSession.sessionData, function(){});
		});
	});

	//Learning event (STUDENT)
	socket.on('student event', function(event){
		eventManager.save(event, function(error, events){
			console.log('new event:'+JSON.stringify(event));
		});

		sessionManager.findOrCreate(event.context, function(error, currentSession){
			switch(event.type){
				case "question vote":
					currentSession.sessionData.questions[event.qid].votes.push(event.users[0]);
					io.sockets.in(currentSession._id).emit('update questions', currentSession.sessionData.questions);
					break;
				case "answer vote":
					currentSession.sessionData.questions[event.qid].answers[event.aid].votes.push(event.users[0]);
					io.sockets.in(currentSession._id).emit('update questions', currentSession.sessionData.questions);
					break;
				case "new question":
					var question = {
						author: {photo: event.photo},
						desc: event.description,
						votes: [event.users[0]],
						answers: [],
						exercise: event.exercise
					};
					currentSession.sessionData.questions.push(question);
					currentSession.sessionData.queue.push(event.station);
					console.log('station:'+event.station+' and users array:'+currentSession.sessionData.users);
					currentSession.sessionData.users[event.station].currentQuestion = currentSession.sessionData.questions.length -1;
					io.sockets.in(currentSession._id).emit('update questions', currentSession.sessionData.questions);
					io.sockets.in(currentSession._id).emit('update queue', currentSession.sessionData.queue);
					io.sockets.in(currentSession._id).emit('update users', currentSession.sessionData.users);
					break;
				case "new answer":
					var answer = {
						author: {photo: event.photo},
						desc: event.description,
						votes: [event.users[0]]
					}
					var question = currentSession.sessionData.questions[event.qid];
					question.answers.push(answer);
					io.sockets.in(currentSession._id).emit('update questions', currentSession.sessionData.questions);
					var user = currentSession.sessionData.users[event.station];
					//If the same user answers his own current question, means it's solved!
					if(user.currentQuestion == event.qid){
						user.currentQuestion = null;
						var queue = currentSession.sessionData.queue;
						if(queue.indexOf(event.station)!=-1){
							queue.splice(queue.indexOf(event.station),1);
						}
						io.sockets.in(currentSession._id).emit('update users', currentSession.sessionData.users);
						io.sockets.in(currentSession._id).emit('update queue', queue);
					}
					break;
				case "progression":
					var user = currentSession.sessionData.users[event.station];
					user.exercise +=1;
					io.sockets.in(currentSession._id).emit('update users', currentSession.sessionData.users);
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
