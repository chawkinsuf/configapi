var util = require('util'),
	url = require('url');

function logMessage( text, request ){
	util.log( request.connection.remoteAddress + ' - [' + request.method + '] ' + url.parse( request.url ).pathname + ' - ' + text );
}

function errorResponse( code, err, errInternal, request, response ){
	logMessage( errInternal || err, request );
	response.writeHead( code, {'Content-Type': 'text/plain'} );
	response.write( err.toString() );
	response.end();
}

function jsonResponse( json, request, response ){
	logMessage( '200', request );
	response.writeHead( 200, {'Content-Type': 'application/json'} );
	response.write( JSON.stringify(json) );
	response.end();
}

exports.logMessage = logMessage;
exports.errorResponse = errorResponse;
exports.jsonResponse = jsonResponse;