var crypto = require('crypto');

function hashPassword( password, callback ){

	// Generate a random salt
	crypto.randomBytes( 32, function( err, salt ){
		if ( err ){ callback( err ); return; }

		// Generate our password hash
		crypto.pbkdf2( password, salt, 10000, 64, function( err, key ){
			if ( err ){ callback( err ); return; }

			// Send the salt and key
			callback( null, key.toString('base64'), salt.toString('base64') );
		});
	});
}

function authenticatePassword( password, key, salt, callback ){

	// Generate our password hash
	crypto.pbkdf2( password, new Buffer( salt, 'base64' ), 10000, 64, function( err, hash ){
		if ( err ){ callback( err ); return; }

		// Send the result
		callback( null, hash.toString('base64') == key );
	});
}

function generateAuthToken( callback ){

	// Generate random bytes
	crypto.randomBytes( 16, function( err, bytes ){
		if ( err ){ callback( err ); return; }

		// Make our hash object
		var sha = crypto.createHash('sha1');
		sha.update( bytes );

		// Send the token
		callback( null, sha.digest('hex') );
	});
}

exports.hashPassword = hashPassword;
exports.authenticatePassword = authenticatePassword;
exports.generateAuthToken = generateAuthToken;