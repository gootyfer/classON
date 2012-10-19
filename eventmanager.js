var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

EventManager = function(host, port) {
  this.db= new Db('classon', new Server(host, port, {auto_reconnect: true, safe:false}, {}));
  this.db.open(function(){});
};

EventManager.prototype.getCollection= function(callback) {
	  this.db.collection('events', function(error, events_collection) {
	    if( error ) callback(error);
	    else callback(null, events_collection);
	  });
	};

	EventManager.prototype.findAll = function(callback) {
	    this.getCollection(function(error, events_collection) {
	      if( error ) callback(error);
	      else {
	        events_collection.find().toArray(function(error, results) {
	          if( error ) callback(error);
	          else callback(null, results);
	        });
	      }
	    });
	};


	EventManager.prototype.findById = function(id, callback) {
	    this.getCollection(function(error, events_collection) {
	      if( error ) callback(error);
	      else {
	        events_collection.findOne({_id: events_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
	          if( error ) callback(error);
	          else callback(null, result);
	        });
	      }
	    });
	};

	EventManager.prototype.save = function(events, callback) {
	    this.getCollection(function(error, events_collection) {
	      if( error ) callback(error);
	      else {
	        if( typeof(events.length)==="undefined")
	          events = [events];

	        for( var i =0;i< events.length;i++ ) {
	          var event = events[i];
	          event.timestamp = new Date();
	        }

	        events_collection.insert(events, function() {
	          callback(null, events);
	        });
	      }
	    });
	};

	exports.EventManager = EventManager;