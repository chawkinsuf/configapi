function Config( connection, data ){
	this._init( data );
	this._connection = connection;
}

Config.prototype._init = function( data ){
	if ( ! data ){
		this.id       = 0;
		this.name     = null;
		this.hostname = null;
		this.port     = null;
		this.username = null;
	} else {
		this.id       = data.id;
		this.name     = data.name;
		this.hostname = data.hostname;
		this.port     = data.port;
		this.username = data.username;
	}
};

Config.prototype._getByField = function( field, value, callback ){
	var self = this,
		params = {};

	params[ field ] = value;
	this._connection.query("SELECT * FROM configs WHERE ? LIMIT 1", params, function( err, rows, fields ){
		if ( err ){ callback( err ); return; }

		if ( rows.length === 0 ){
			callback( new Error('No config found for '+field+': '+value) );
			return;
		}

		self._init( rows[0] );
		callback( null );
	});
};

Config.prototype.getById = function( id, callback ){
	this._getByField( 'id', id, callback );
};

Config.prototype.getByName = function( name, callback ){
	this._getByField( 'name', name, callback );
};

Config.prototype.update = function( callback ){
	if ( this.id === 0 ){
		callback( new Error('No config loaded') );
		return;
	}

	var params = [ this.toJson(), { id: this.id } ];
	this._connection.query("UPDATE configs SET ? WHERE ?", params, function( err, response ){
		if ( err ){ callback( err ); return; }
		callback( null );
	});
};

Config.prototype.insert = function( callback ){
	if ( this.id !== 0 ){
		callback( new Error('Config already exists with id: '+this.id) );
		return;
	}

	var params = [ this.toJson() ];
	this._connection.query("INSERT INTO configs SET ?", params, function( err, response ){
		if ( err ){ callback( err ); return; }
		callback( null );
	});
};

Config.prototype.delete = function( callback ){
	var self = this;

	if ( this.id === 0 ){
		callback( new Error('No config loaded') );
		return;
	}

	var params = { id: this.id };
	this._connection.query("DELETE FROM configs WHERE ?", params, function( err, response ){
		if ( err ){ callback( err ); return; }
		self._init();
		callback( null );
	});
};

Config.prototype.toString = function(){
	return JSON.stringify( this.toJson() );
};

Config.prototype.toJson = function(){
	return { name: this.name, hostname: this.hostname, port: this.port, username: this.username };
};

function getAll( connection, order, limits, callback ){

	var sql = "SELECT * FROM configs";

	if ( Array.isArray(order) ){
		sql += " ORDER BY "+order[0]+" "+order[1];
	}

	if ( Array.isArray(limits) ){
		sql += " LIMIT "+limits[0]+","+limits[1];
	}

	connection.query(sql, function( err, rows, fields ){
		if ( err ){ callback( err ); return; }

		var result = [];
		rows.forEach(function( row ){
			result.push( new Config( connection, row ) );
		});
		callback( null, result );
	});
}

function arrayToJson( result ){
	var jsonResult = [];
	result.forEach(function( config ){
		jsonResult.push( config.toJson() );
	});
	return jsonResult;
}

exports.Config = Config;
exports.getAll = getAll;
exports.arrayToJson = arrayToJson;