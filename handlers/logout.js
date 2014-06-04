var user = require('../user');

function GET( request, response, data, callback ){

	// Check for an authtoken
	if ( ! data.authtoken ){
		callback( new Error('No authtoken') );
		return;
	}

	// See if the token is valid
	var User = new user.User( request.dbconnection );
	User.getByToken( data.authtoken, function( err ){
		if ( err ){ callback( new Error('Invalid authtoken'), err ); return; }

		// Continue with the logout
		User.logout(function(){
			if ( err ){ callback( new Error('Logout failed'), err ); return; }

			request.cookie.set( 'authtoken', '', response )
			callback( null, null, {} );
		});
	});
}

exports.GET = GET;