//Store the names of the sections
var sectionNames = [];
//Current section
var currentSection = 0;
//Queue
var queue = [];
//Questions
var questions = [];
//Current users
//var currentUsers = [];

//Parsing assignment data
$('iframe[name=assignment]').load(function() {
	
	//Collect sections in the assignment to create the nav menu
	var sections = $('iframe[name=assignment]').contents().find('section').not("#refs").not("#bash");
	sections.each(function(index){
		$('.nav-list').append('<li id="nav-'+index+'" onclick="navigate('+index+')"><a href="../student/'+assignment+'/index.html#'+$(this).attr("id")+'" target="assignment">'+$(this).find("h2").text()+'</a></li>');
		sectionNames.push($(this).find('h2').text());
	});
	
	initNavigation();
	initConnection();

	//Spy scroll data to update nav element
	// $("iframe[name=assignment]").contents().find("body").attr("data-spy", "scroll").attr("data-target", ".nav-list");

});

//Add new question
$('#newQuestion').click(function(){
	if(!$(this).hasClass('disabled')){
		$('#questionModal .modal-header h3').text('Nueva pregunta sobre '+sectionNames[currentSection]);
		$('#helpModal').modal('hide');
		$('#questionModal').modal('show');
	}
});

//Focus textareas on question modal shown
$('#questionModal').on('shown', function () {
  $('#questionText').focus();
})

//Help modal load questions
$('#helpModal').on('show', function () {
  if(currentQuestion == null){
  	//$('#question').html('Nueva Pregunta');
  	$('#newQuestion').removeClass('disabled');
  }else{
  	//$('#question').html('Nueva Pregunta');
  	$('#newQuestion').addClass('disabled');
  }
  loadQuestions();
})

//Focus textareas on answer modal shown
$('#answerModal').on('shown', function () {
  $('#answerText').focus();
})

//Add a new question
$('#question').click(function(){
	//Send event to the server and wait to show the modal
	sendEventToServer('student event', {type: 'new question', description: $('#questionText').val()});
	//Reset textarea
	$('#questionText').val('');
	$('#questionModal').modal('hide');
	//TODO: wait for server reply
	//$('#helpModal').modal('show');
});

//Add a new question
$('#answer').click(function(){
	//Send event to the server and wait to show the modal
	sendEventToServer('student event', {type: 'new answer', description: $('#answerText').val(), qid:$('#questionToAnswer').attr('data-qid')});
	//Reset textarea
	$('#answerText').val('');
	$('#answerModal').modal('hide');
	//TODO: wait for server reply
	//$('#helpModal').modal('show');
});

//Confirm progress
$('#progress').click(function(){
	$('#nav-'+currentSection).removeClass('active');
	//update active section
	if(sectionNames.length > currentSection+1){

		//show next section
		var sections = $('iframe[name=assignment]').contents().find('section').not("#refs").not("#bash");
		sections.each(function(index){
			if(index == currentSection+1){
				$(this).show();
			}
		});
		$('iframe[name=assignment]').attr('src', $('#nav-'+(currentSection+1)+' a').attr('href'));
		//$('#nav-'+(currentSection+1)+' a').click();
		//console.log($('#nav-'+(currentSection+1)+' a').attr('href'));
		$('#nav-'+(currentSection+1)).addClass('active');
		if(sectionNames.length > currentSection+2){
			//show next link
			$('#nav-'+(currentSection+2)).removeClass('disabled');
		}
	}
	//Send event to server to indicate progress
	sendEventToServer('student event', {type: 'progression'});
	currentSection++;
	$('#progressModal').modal('hide');
});

//Confirm finished the assignment
$('#finish').click(function(){
	//Send event to server to indicate finish
	sendEventToServer('student event', {type: 'finish'});
	$('#finishModal').modal('hide');
});

//Navigate to a new section
function navigate(index){
	if(index == currentSection+1){
		//show progress modal
		$('#progressModal').modal('show');
	}else if(index+1 == sectionNames.length && currentSection+1 == sectionNames.length){
		$('#finishModal').modal('show');
	}
}

//Init navigation system
function initNavigation(){
	var sections = $('iframe[name=assignment]').contents().find('section').not("#refs").not("#bash");
	sections.each(function(index){
		//console.log('section:'+index);
		if(index==currentSection){
			$('#nav-'+index).addClass('active');
			//console.log('current:'+index);
		}
		if(index>currentSection){
			//console.log('others:'+index);
			if(index != (currentSection+1)){
				$('#nav-'+index).addClass('disabled');
			}
			$(this).hide();
		}
	});
}

//Load questions from the questions list
function loadQuestions(){
	$('#helpModal .modal-header h3').text('Preguntas');
	$('#helpModal .modal-body').html('<ul class="media-list"></ul>');
	questions.forEach(function(question, index){
		//Load content for each question
		$('#helpModal .modal-body ul').append('<li class="media question" id="question'+index+'"><img class="media-object pull-left" src="../photos/'+question.author.photo+'" width="64px"><div class="media-body"><span class="badge">'+question.votes.length+' votos</span><a id="voteButton'+index+'" href="#" class="btn'+((question.votes.indexOf(currentUsers[0])==-1)?"":" disabled")+'"><i class="icon-thumbs-up"></i>Vota</a><span class="badge badge-info pull-right">apartado '+question.exercise+'</span><p>'+question.desc+'</p><div class="btn-group pull-right"><a id="answersButton'+index+'" class="btn'+(question.answers.length==0?' disabled':'')+'" href="#" onclick="toggleAnswers('+index+')" data-toggle="button">Respuestas ('+question.answers.length+')</a><a class="btn" href="#" id="answerButton'+index+'">Responder</a></div></div></li>');

		//Vote question
		$('#voteButton'+index).click(function(){
			//Send event to the server
			sendEventToServer('student event', {type: 'question vote', qid: index});
			$(this).addClass('disabled');
			$(this).prev().html((question.votes.length+1)+' votos');
		});

		//Load question in the answer modal onclick
		$('#answerButton'+index).click(function(){
			$('#answerModal .modal-header h3').text('Respuesta a la pregunta sobre '+sectionNames[currentSection]);
			$('#questionToAnswer').remove();
			$('#answerModal .modal-body').prepend('<div id="questionToAnswer" class="media" data-qid="'+index+'"><img class="media-object pull-left" src="../photos/'+question.author.photo+'" width="64px"><div class="media-body"><span class="badge">'+question.votes.length+' votes</span><p>'+question.desc+'</p></div></div>');
			$('#helpModal').modal('hide');
			$('#answerModal').modal('show');
		});
	});
}

//Load/remove answers for a question identified by qid
function toggleAnswers(qid){
	//check button class to determinate state
	if ($('#answersButton'+qid).hasClass('active')){ //hide answers
		$('#question'+qid+' .media-body ul').remove();
	}else{ //show answers
		$('#question'+qid+' .media-body').append('<ul class="media-list"><br><br></ul>');
		questions[qid].answers.forEach(function(answer, index){
			$('#question'+qid+' .media-body .media-list').append('<li class="media"><img class="media-object pull-left" src="../photos/'+answer.author.photo+'" width="64px"><div class="media-body"><span class="badge">'+answer.votes.length+' votos</span><a id="voteAnswerButton'+index+'" href="#" class="btn'+((answer.votes.indexOf(currentUsers[0])==-1)?"":" disabled")+'"><i class="icon-thumbs-up"></i>Vota</a><p>'+answer.desc+'</p></div></li>');
			//Vote question
			$('#voteAnswerButton'+index).click(function(){
				//Send event to the server
				sendEventToServer('student event', {type: 'answer vote', qid: qid, aid: index});
				$(this).addClass('disabled');
				$(this).prev().html((answer.votes.length+1)+' votos');
			});
		});
	}
}

//TODO: initial data
//TODO: refresh data when updated info form server