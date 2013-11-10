var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

AssignmentManager = function(host, port) {
  this.db= new Db('classon2', new Server(host, port), {auto_reconnect: true, safe: false});
  this.db.open(function(){});
};

AssignmentManager.prototype.getCollection= function(callback) {
	  this.db.collection('assignments', function(error, assignments_collection) {
	    if( error ) callback(error);
	    else callback(null, assignments_collection);
	  });
	};

	AssignmentManager.prototype.findAll = function(callback) {
	    this.getCollection(function(error, assignments_collection) {
	      if( error ) callback(error);
	      else {
	        assignments_collection.find().toArray(function(error, results) {
	          if( error ) callback(error);
	          else callback(null, results);
	        });
	      }
	    });
	};

	AssignmentManager.prototype.findLast = function(query, callback) {
	    this.getCollection(function(error, assignments_collection) {
	      if( error ) callback(error);
	      else {
	        assignments_collection.find(query).sort({"timestamp":-1}).limit(1).toArray(function(error, results) {
	          if( error ) callback(error);
	          else callback(null, results);
	          //this.client.close();
	        });
	      }
	    });
	};

	AssignmentManager.prototype.findById = function(id, callback) {
	    this.getCollection(function(error, assignments_collection) {
	      if( error ) callback(error);
	      else {
	        assignments_collection.findOne({_id: assignments_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
	          if( error ) callback(error);
	          else callback(null, result);
	        });
	      }
	    });
	};

	AssignmentManager.prototype.save = function(assignments, callback) {
	    this.getCollection(function(error, assignments_collection) {
	      if( error ) callback(error);
	      else {
	        if( typeof(assignments.length)=="undefined")
	          assignments = [assignments];

	        for( var i =0;i< assignments.length;i++ ) {
	          var assignment = assignments[i];
	          assignment.timestamp = new Date();
	        }

	        assignments_collection.insert(assignments, function() {
	          callback(null, assignments);
	        });
	      }
	    });
	};

	exports.AssignmentManager = AssignmentManager;