var user = require('../user'),
	config = require('../config');

function checkAuthentication( data, connection, callback ){

	// Check for an authtoken
	if ( ! data.authtoken ){
		callback( new Error('Not authenticated') );
		return;
	}

	// See if the token is valid
	var User = new user.User( connection );
	User.getByToken( data.authtoken, function( err ){
		if ( err ){ callback( new Error('Not authenticated'), err ); return; }
		callback( null, null, User );
	});
}

function GET( request, response, data, callback ){

	checkAuthentication( data, request.dbconnection, function( err, errInternal, User ){
		if ( err ){ callback( err, errInternal ); return; }

		// See if we have a url parameter
		if ( data.urlparam ){
			Config = new config.Config( request.dbconnection );

			// Look for a configuration object
			Config.getByName( data.urlparam, function( err ){
				if ( err ){ callback( new Error('Configuration not found'), err ); return; }
				callback( null, null, Config.toJson() );
			});
			return;
		}

		// Check for search parameters and validate the values
		var order = [ 'id', 'asc' ];
		if ( config.checkSortField( data.order ) ){
			order = [ data.order, config.checkSortDirection( data.direction ) ? data.direction : 'asc' ];
		}

		// Check for limit parameters and make sure we have integers
		var limits = [ 0, 10 ];
		data.limit = config.checkLimitValue( data.limit );
		if ( data.limit ){
			data.page = config.checkLimitValue( data.page );
			data.page = data.page ? data.page : 1;
			limits = [ (data.page - 1)*data.limit, data.limit ];
		}

		// Exedcute the select query
		config.getAll( request.dbconnection, order, limits, function( err, result ){
			if ( err ){ callback( new Error('Request failed'), err ); return; }

			// Convert the array of objects to json
			var jsonResult = config.arrayToJson( result );
			callback( null, null, { configurations: jsonResult } );
		});
	});
}

function POST( request, response, data, callback ){
	checkAuthentication( data, request.dbconnection, function( err, errInternal, User ){
		if ( err ){ callback( err, errInternal ); return; }

		// See if we have a url parameter
		if ( data.urlparam ){
			callback( new Error('Not implemented') );
			return;
		}

		// All data is required
		if ( ! data.name || ! data.hostname || ! data.port || ! data.username ){
			callback( new Error('Data missing') );
			return;
		}

		// Validate the name
		if ( ! /^\w+$/.test( data.name ) ){
			callback( new Error('Invalid name') );
			return;
		}

		// Validate the port
		if ( ! /^\d+$/.test( data.port ) ){
			callback( new Error('Invalid port') );
			return;
		}

		// Make sure there is no id in the data
		delete data.id;

		// Insert the data
		Config = new config.Config( request.dbconnection, data );
		Config.insert( function( err ){
			if ( err ){ callback( new Error('Could not insert'), err ); return; }
			callback( null, null, Config.toJson() );
		});
	});
}

function PUT( request, response, data, callback ){
	checkAuthentication( data, request.dbconnection, function( err, errInternal, User ){
		if ( err ){ callback( err, errInternal ); return; }

		// See if we have a url parameter
		if ( data.urlparam ){
			Config = new config.Config( request.dbconnection );

			// Look for a configuration object
			Config.getByName( data.urlparam, function( err ){
				if ( err ){ callback( new Error('Configuration not found'), err ); return; }

				// We must have something to update
				if ( ! ( data.name || data.hostname || data.port || data.username ) ){
					callback( new Error('Nothing to update') );
					return;
				}

				// Validate the name
				if ( data.name && ! /^\w+$/.test( data.name ) ){
					callback( new Error('Invalid name') );
					return;
				}

				// Validate the port
				if ( data.port && ! /^\d+$/.test( data.port ) ){
					callback( new Error('Invalid port') );
					return;
				}

				// Set the new values
				Config.name     = data.name     || Config.name;
				Config.hostname = data.hostname || Config.hostname;
				Config.port     = data.port     || Config.port;
				Config.username = data.username || Config.username;

				// Update the object
				Config.update( function( err ){
					if ( err ){ callback( new Error('Could not update'), err ); return; }
					callback( null, null, Config.toJson() );
				});
			});
			return;
		}

		callback( new Error('Not implemented') );
	});
}

function DELETE( request, response, data, callback ){
	checkAuthentication( data, request.dbconnection, function( err, errInternal, User ){
		if ( err ){ callback( err, errInternal ); return; }

		// See if we have a url parameter
		if ( data.urlparam ){
			Config = new config.Config( request.dbconnection );

			// Look for a configuration object
			Config.getByName( data.urlparam, function( err ){
				if ( err ){ callback( new Error('Configuration not found'), err ); return; }

				// Delete the object
				Config.delete( function( err ){
					if ( err ){ callback( new Error('Could not delete'), err ); return; }
					callback( null, null, {} );
				});
			});
			return;
		}

		callback( new Error('Not implemented') );
	});
}

exports.GET    = GET;
exports.POST   = POST;
exports.PUT    = PUT;
exports.DELETE = DELETE;