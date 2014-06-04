var auth = require('./auth');

function User( connection, data ){
	this._init( data );
	this._connection = connection;
}

User.prototype._init = function( data ){
	if ( ! data ){
		this.id    = 0;
		this.email = null;
		this.key   = null;
		this.salt  = null;
		this.token = null;
	} else {
		this.id    = data.id;
		this.email = data.email;
		this.key   = data.key;
		this.salt  = data.salt;
		this.token = data.token;
	}
};

User.prototype._getByField = function( field, value, callback ){
	var self = this,
		params = {};

	params[ field ] = value;
	this._connection.query("SELECT * FROM users WHERE ? LIMIT 1", params, function( err, rows, fields ){
		if ( err ){ callback( err ); return; }

		if ( rows.length === 0 ){
			callback( new Error('No user found for '+field+': '+value) );
			return;
		}

		self._init( rows[0] );
		callback( null );
	});
};

User.prototype.getById = function( id, callback ){
	this._getByField( 'id', id, callback );
};

User.prototype.getByEmail = function( email, callback ){
	this._getByField( 'email', email, callback );
};

User.prototype.getByToken = function( token, callback ){
	this._getByField( 'token', token, callback );
};

User.prototype.update = function( callback ){
	if ( this.id === 0 ){
		callback( new Error('No user loaded') );
		return;
	}

	var params = [ this.toJson(), { id: this.id } ];
	this._connection.query("UPDATE users SET ? WHERE ?", params, function( err, response ){
		if ( err ){ callback( err ); return; }
		callback( null );
	});
};

User.prototype.toString = function(){
	return JSON.stringify( this.toJson() );
};

User.prototype.toJson = function(){
	return { email: this.email, key: this.key, salt: this.salt, token: this.token };
};

User.prototype.logout = function( callback ){
	this.token = null;
	this.update( function( err ){
		if ( err ){ callback( err ); return; }
		callback( null );
	});
};

User.prototype.login = function( email, password, callback ){
	var self = this;

	self.getByEmail( email, function( err ){
		if ( err ){ callback( err ); return; }

		auth.authenticatePassword( password, self.key, self.salt, function( err, result ){
			if ( err ){ callback( err ); return; }

			if ( result === false ){
				callback( new Error('Invalid login credentials') );
				return;
			}

			auth.generateAuthToken( function( err, token ){
				if ( err ){ callback( err ); return; }

				self.token = token;
				self.update( function( err ){
					if ( err ){ callback( err ); return; }
					callback( null );
				});
			});
		});
	});
};

exports.User = User;