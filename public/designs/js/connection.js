var socket;

function initConnection(){
	socket = io.connect(server+':'+port);
	socket.on('connect', function() {
		sendEventToServer('new student', {type: 'new student'});
		console.log('new student when connecting');
		//socket.emit('new student', {user: user, session: session});
		//Should be called: init
		socket.on('student registered', function(sessionData){
			//Queue
			queue = sessionData.queue;
			//Questions
			questions = sessionData.questions;
			//update my queue position
			if(queue.indexOf(station) == -1){
				currentQuestion = null;
			}else{
				//Set current question and update navigation interface
				currentQuestion = queue.indexOf(station) + 1;
			}
			
			//TODO: save current user to session storage

			//Connection to the practice event
			sendEventToServer('student event', {type: 'connection'});
			//console.log('send connection event to server');
		});
		
		socket.on('update queue', function(q){
			console.log("new position in queue:"+q);
			//Queue
			queue = q;
			//update currentStation
			// if(queue.indexOf(station) == -1){
			// 	currentQuestion = null;
			// }else{
			// 	//Set current question and update navigation interface
			// 	currentQuestion = queue.indexOf(station) + 1;
			// }
		});
		socket.on('update questions', function(newQuestions){
			console.log('new questions:'+newQuestions);
			questions = newQuestions;
			//TODO: update currentQuestion
		});
		socket.on('update users', function(newUsers){
			console.log('new users:'+newUsers);
		});
	});

}

function sendEventToServer(eventName, event){
	event.station = station;
	event.users = currentUsers;
	event.exercise = currentSection;
	event.context = {subject:subject, group:group, assignment:assignment};
	event.photo = photo;
	
	socket.emit(eventName, event);
	console.log('new event sent:'+eventName);
}