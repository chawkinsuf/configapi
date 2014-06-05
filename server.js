var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	querystring = require('querystring'),
	mysql = require('mysql'),
	cookie = require('./cookie'),
	serverutil = require('./serverutil'),
	port = parseInt( process.argv[2] || 8080, 10 );


// Get the handlers for each route
var routes = {},
	files = fs.readdirSync('handlers');

// Load the route handlers
files.forEach(function( file ){
	var route = path.basename( file, '.js' );
	routes[ route ] = require( './handlers/'+route );
});

function serverBody( request, response ){

	var uri = url.parse( request.url, true ),
		postData = '';

	// Parse the pathname into our route
	var found = uri.pathname.match( /^\/(\w+)(?:\/?$|\/(\w+)\/?)/ );
	if ( ! found ){
		serverutil.errorResponse( 404, new Error('Path not found'), null, request, response );
		return;
	}

	// Set our route vars since we have a valid path
	var route = found[1],
		urlparam = found[2];

	// Custom handling to server our test page
	if ( route == 'test' ){
		fs.readFile( 'test.html', 'binary', function( err, file ){
			if( err ){
				response.writeHead( 500, {'Content-Type': 'text/plain'} );
				response.write( err );
				response.end();
				return;
			}

			response.writeHead( 200, {'Content-Type': 'text/html'} );
			response.write( file, 'binary' );
			response.end();
		});
		return;
	}

	// See if we have a valid route
	if ( ! routes[ route ] || ! routes[ route ][ request.method ] ){
		serverutil.errorResponse( 404, new Error('Path not found'), null, request, response );
		return;
	}

	// Open the database connection and store it in the request object
	request.dbconnection = mysql.createConnection({
		host     : 'localhost',
		database : 'configapi',
		user     : 'configapi',
		password : 'configapi'
	});
	request.dbconnection.connect();

	// Look for an auth cookie and store the cookie object in the request
	request.cookie = new cookie.Cookie();
	var authtoken = request.cookie.get( 'authtoken', request );

	// Allow cross site scripting for testing
	response.setHeader( 'Access-Control-Allow-Origin', '*' );

	// Setup request even listers
	request.setEncoding('utf8');
	request.addListener('data', function( postDataChunk ){
		postData += postDataChunk;
	});
	request.addListener('end', function(){
		var data = {};

		// Use get data for a get request
		if ( request.method == 'GET' ){
			data = uri.query;
		}

		// Otherwise use the post data
		else {
			data = querystring.parse( postData );
		}

		// Use authtoken from the cookie if we don't have one in the post
		if ( ! data.authtoken ){
			data.authtoken = authtoken;
		}

		// Add our url parameter to the data
		data.urlparam = urlparam;

		// Process the route
		routes[ route ][ request.method ]( request, response, data, function( err, errInternal, json ){

			// Close the database connection
			request.dbconnection.destroy();

			// Process an error
			if ( err ){
				serverutil.errorResponse( 500, err, errInternal, request, response );
				return;
			}

			// Otherwise send the json response
			serverutil.jsonResponse( json, request, response );
		});
	});
}

if ( port <= 0 || isNaN( port ) ){
	console.log( 'Invalid port: '+port );
	return;
}

http.createServer( serverBody ).listen( port );
console.log('Ctrl + C to terminate\nServer listening on localhost:' + port);