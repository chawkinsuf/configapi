var user = require('../user');

function POST( request, response, data, callback ){

	// Check for an authtoken
	if ( ! data.email || ! data.password ){
		callback( new Error('No credentials provided') );
		return;
	}

	// See if the credentials are valid
	var User = new user.User( request.dbconnection );
	User.login( data.email, data.password, function( err ){
		if ( err ){ callback( new Error('Invalid credentials'), err ); return; }

		request.cookie.set( 'authtoken', User.token, response )
		callback( null, null, { authtoken: User.token } );
	});
}

exports.POST = POST;