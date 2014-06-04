var querystring = require('querystring');

// Override the querystring decode function
querystring.decode = decodeURIComponent;

// Define our cookie class
function Cookie(){
	this._read = false;
	this._write = {};
}

Cookie.prototype.set = function( name, value, response ){
	var self = this,
		cookies = [];

	// Store the current cookie key pair
	this._write[ name ] = encodeURIComponent( value );

	// Loop over each key pair (tradeoff, do we allow duplicate names or loop through each time one is added?)
	Object.keys( this._write ).forEach(function( name ){
		cookies.push( name+'='+self._write[ name ] );
	});

	// Set the header using all the cookies
	response.setHeader( 'Set-Cookie', cookies );
};

Cookie.prototype.get = function( name, request ){

	// Only parse the header once
	if ( this._read === false ){
		this._read = querystring.parse( request.headers.cookie || '', '; ' );
	}

	// Return the cookie value or null if it doesn't exist
	return this._read[ name ] || null;
};

exports.Cookie = Cookie;