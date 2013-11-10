var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

SessionManager = function(host, port) {
  this.db= new Db('classon2', new Server(host, port), {auto_reconnect: true, safe: false});
  this.db.open(function(){});
};

SessionManager.prototype.getCollection= function(callback) {
	  this.db.collection('sessions', function(error, sessions_collection) {
	    if( error ) callback(error);
	    else callback(null, sessions_collection);
	  });
	};

	SessionManager.prototype.findAll = function(callback) {
	    this.getCollection(function(error, sessions_collection) {
	      if( error ) callback(error);
	      else {
	        sessions_collection.find().toArray(function(error, results) {
	          if( error ) callback(error);
	          else callback(null, results);
	        });
	      }
	    });
	};


	SessionManager.prototype.findById = function(id, callback) {
	    this.getCollection(function(error, sessions_collection) {
	      if( error ) callback(error);
	      else {
	        sessions_collection.findOne({
	        	_id: sessions_collection.db.bson_serializer.ObjectID.createFromHexString(id)
	        }, function(error, result) {
	          if( error ) callback(error);
	          else callback(null, result);
	        });
	      }
	    });
	};

	//Search given subject, group and assignment number in the groupObj
	SessionManager.prototype.findOrCreate = function(sessionDef, callback) {
		var that = this;
	    this.getCollection(function(error, sessions_collection) {
	      if( error ) callback(error);
	      else {
	      	sessions_collection.find(sessionDef).sort({"timestamp":-1}).limit(1).toArray(function(error, results) {
	        	//console.log('findLastActivity: resp');
	          if( error ) callback(error);
	          else{
	          	if(results.length>0){
	          		callback(null, results[0]);
	          	}else{
	          		var new_session = {
						sessionData:{
							users: [],
							queue: [],
							questions: []
						},
						subject:sessionDef.subject, 
						group:sessionDef.group, 
						assignment:sessionDef.assignment
					};
	          		that.save(new_session, function(error, saved_session){
	          			if( error ) callback(error);
	          			else callback(null, saved_session[0]);
	          		});
	          	}
	          }
	        });
	      }
	    });
	};

	SessionManager.prototype.save = function(sessions, callback) {
	    this.getCollection(function(error, sessions_collection) {
	      if( error ) callback(error);
	      else {
	        if( typeof(sessions.length)==="undefined")
	          sessions = [sessions];

	        for( var i =0;i< sessions.length;i++ ) {
	          var session = sessions[i];
	          session.timestamp = new Date();
	        }

	        sessions_collection.insert(sessions, function() {
	          callback(null, sessions);
	        });
	      }
	    });
	};

	SessionManager.prototype.update = function(id, sessionData, callback) {
	    this.getCollection(function(error, sessions_collection) {
	      if( error ) callback(error);
	      else {
	        sessions_collection.update(
	        	{_id: id}, 
	        	{"$set": {"sessionData": sessionData}}, 
	        	function(error, updated_session) {
	        		if(error) callback(error);
	        		else callback(null, updated_session);
	          		//this.client.close();
	        });
	      }
	    });
	};

	exports.SessionManager = SessionManager;