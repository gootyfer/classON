//Load session id
var scripts = document.getElementsByTagName('script');
var index = scripts.length - 1;
var myScript = scripts[index];
var src = myScript.src;
var session = src.substr(src.indexOf('=')+1);

function loadjscssfile(filename, filetype){
 if (filetype=="js"){ //if filename is a external JavaScript file
  var fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", filename)
 }
 else if (filetype=="css"){ //if filename is an external CSS file
  var fileref=document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", filename)
 }
 if (typeof fileref!="undefined")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}

loadjscssfile("../css/classon.css", "css");
loadjscssfile("../css/jquery-ui.css", "css");
loadjscssfile("../js/jquery.blockUI.js", "js");
loadjscssfile("../js/socket.io.min.js", "js");
loadjscssfile("../js/classon.js?session="+session, "js");