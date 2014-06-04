var auth = require('./auth');

function User( connection ){
	this.id    = 0;
	this.email = null;
	this.key   = null;
	this.salt  = null;
	this.token = null;
	this._connection = connection;
}

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

		self.id    = rows[0].id;
		self.email = rows[0].email;
		self.key   = rows[0].key;
		self.salt  = rows[0].salt;
		self.token = rows[0].token;

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

	var params = [ { email: this.email, key: this.key, salt: this.salt, token: this.token }, { id: this.id } ];
	this._connection.query("UPDATE users SET ? WHERE ?", params, function( err, response ){
		if ( err ){ callback( err ); return; }
		callback( null );
	});
};

User.prototype.toString = function(){
	return JSON.stringify({ id: this.id, email: this.email, key: this.key, salt: this.salt, token: this.token });
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