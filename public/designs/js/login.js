//Create class map
//TODO: mostrar los puestos ocupados
// var nRows = 5,
// 	nColumns = 5;

for (var i=0; i<nRows; i++){
	var row = $('<div class="row show-grid"></div>').appendTo('#classroom');
	for (var j=0; j<nColumns; j++){
		$('<a id="'+(i*nRows+j)+'" class="span1 non-selected" href="#"><i class="icon-hdd"></i></a>').appendTo(row)
			.click(function(){
				$('#classroom').find('.selected').addClass('non-selected');
				$('#classroom').find('.selected').removeClass('selected');
				$(this).removeClass('non-selected');
				$(this).addClass('selected');
				$('input[name=station]').attr('value',$(this).attr('id'));
			});
	}
}

var queryString = document.location.href.substr(document.location.href.lastIndexOf('?')+1);
var parameters = queryString.split("&");
var error = parameters[0].split("=")[1];
if(error){
	var errorText = "Error al tratar de hacer login.";
	switch(error){
		case '1':
			errorText = "El usuario no existe.";
			break;
		case '2':
			errorText = "Puesto elegido en uso.";
			break;
	}
	$('#errorModal').find('.modal-body p').html(errorText);
	$('#errorModal').modal('show');
}

$('a.non-selected').click(function(){
	return false;
});

$('form').on('submit', function(){
	if(!$('input[name=station]').attr('value')){
		$('#errorModal').find('.modal-body p').html('<strong>Error:</strong> Selecciona un puesto del laboratorio.');
		// $('#errorModal').modal('show');
		// $('.alert-error').addClass('in');
		// $('.alert-error .close').click(function(){
		// 	$('.alert-error').removeClass('in');
		// });
		// window.setTimeout(function () {
		//     $('.alert-error').removeClass('in');
		// }, 3000);
		// if(!$('.alert-error').length)
		// 	$('#classroom').append('<div class="alert alert-error span4 fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Error</strong> Selecciona un puesto del laboratorio.</div>');
		return false;
	}
})