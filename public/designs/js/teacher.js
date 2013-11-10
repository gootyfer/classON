var Example1 = new (function() {
    var $stopwatch, // Stopwatch element on the page
        incrementTime = 70, // Timer speed in milliseconds
        currentTime = 0, // Current time in hundredths of a second
        updateTimer = function() {
            $stopwatch.html(formatTime(currentTime));
            currentTime += incrementTime / 10;
        },
        init = function() {
            $stopwatch = $('#stopwatch');
            Example1.Timer = $.timer(updateTimer, incrementTime, true);
        };
    this.resetStopwatch = function() {
        currentTime = 0;
        this.Timer.stop().once();
    };
    $(init);
});

// Common functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {str = '0' + str;}
    return str;
}
function formatTime(time) {
    var min = parseInt(time / 6000),
        sec = parseInt(time / 100) - (min * 60),
        hundredths = pad(time - (sec * 100) - (min * 6000), 2);
    return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
}

$(function(){
    Example1.Timer.toggle();
    Example1.resetStopwatch();
    window.setTimeout(function(){
        //Que se conecte un alumno
        var new_students = ["igrojas", "rcrespo"];
        $("#newStudent img").each(function(index){
            $(this).attr("src", "../photos/"+new_students[index]+".png");
        });
        $("#newStudent .status")
            .removeClass("free")
            .addClass("working")
            .html("trabajando");
            
        //Que a los 5 segundos alguien progrese
        window.setTimeout(function(){
            $("#newStudent .bar")
            .css('width','20%');
            //Que a los 5 segundos alguien pase a estado de esperando 
            window.setTimeout(function(){
                $("#newStudent .status")
                .removeClass("working")
                .addClass("waiting")
                .html("esperando");
            }, 5000);
        }, 5000);
        //TODO: indicar el que lleva más tiempo esperando? como?
    }, 5000);
});

$("#helpModal").on('shown', function(){
    Example1.Timer.toggle();
});

$("#helpModal").on('hidden', function(){
    Example1.resetStopwatch();
});
