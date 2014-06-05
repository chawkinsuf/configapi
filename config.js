/**
 * Constructor
 * @param {mysql}  connection An open connection to the database
 * @param {object} data       Data to initilize the class with
 */
function Config( connection, data ){
	this._init( data );
	this._connection = connection;
}

/**
 * Initialze the data members in the class
 * @param  {object} data If provided, initialized the class with the data
 */
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

/**
 * Executes a select query for a single row of data
 * @param  {string}   field    The name of the field we are using to select
 * @param  {string}   value    The value we are looking for
 * @param  {Function} callback function( err )
 * @return {void}              No data is returned in the callback
 */
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

/**
 * Gets a row of data based on the id
 * @param  {string}   id       The id of the row
 * @param  {Function} callback function( err )
 * @return {void}              No data is returned in the callback
 */
Config.prototype.getById = function( id, callback ){
	this._getByField( 'id', id, callback );
};

/**
 * Gets a row of data based on the name
 * @param  {string}   name     The name of the row
 * @param  {Function} callback function( err )
 * @return {void}              No data is returned in the callback
 */
Config.prototype.getByName = function( name, callback ){
	this._getByField( 'name', name, callback );
};

/**
 * Updates the database with the data in the members of the class
 * @param  {Function} callback function( err )
 * @return {void}              No data is returned in the callback
 */
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

/**
 * Inserts a new row into the database with the data in the members of the class
 * @param  {Function} callback function( err )
 * @return {void}              No data is returned in the callback
 */
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

/**
 * Deletes the row from the database with the id of the data member in the class
 * @param  {Function} callback function( err )
 * @return {void}              No data is returned in the callback
 */
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

/**
 * Returns the data in string form (excluding the id)
 * @return {string}
 */
Config.prototype.toString = function(){
	return JSON.stringify( this.toJson() );
};

/**
 * Returns the data in a json object (excluding the id)
 * @return {object}
 */
Config.prototype.toJson = function(){
	return { name: this.name, hostname: this.hostname, port: this.port, username: this.username };
};

/**
 * Selects an array of rows from the database
 * @param  {mysql}    connection An open connection to the database
 * @param  {array}    order      The first element is the field and the second in the direction
 * @param  {array}    limits     The first element is the start and the second in the limit
 * @param  {Function} callback   function( err, result )
 * @return {array[Config]}       The result of the query
 */
function getAll( connection, order, limits, callback ){

	// Start the query getting all out data
	var params = [],
		sql = "SELECT * FROM configs";

	// Add an order by clause if we have one
	if ( Array.isArray(order) ){
		sql += " ORDER BY ?? "+order[1];
		params.push( order[0] );
	}

	// Add a limit clause if we have one
	if ( Array.isArray(limits) ){
		sql += " LIMIT "+limits[0]+","+limits[1];
	}

	// Execute the query
	connection.query(sql, params, function( err, rows, fields ){
		if ( err ){ callback( err ); return; }

		// Create a new class instance with each row
		var result = [];
		rows.forEach(function( row ){
			result.push( new Config( connection, row ) );
		});
		callback( null, result );
	});
}

/**
 * A utility function to convert an array of Config objects to and array of json objects
 * @param  {array} result The array of Config object
 * @return {array}        An array of json objects
 */
function arrayToJson( result ){
	var jsonResult = [];
	result.forEach(function( config ){
		jsonResult.push( config.toJson() );
	});
	return jsonResult;
}

/**
 * A utility function to validate the parameters for a limit clause
 * @param  {string} value
 * @return {integer}
 */
function checkLimitValue( value ){
	value = parseInt( value, 10 );
	return ( ! isNaN( value ) && value > 0 ) ? value : false;
}

/**
 * A utility function to validate the field parameter for an order by clause
 * @param  {string} field
 * @return {boolean}
 */
function checkSortField( field ){

	// Don't let toLowerCase throw an exception
	if ( typeof field !== 'string' ){
		return false;
	}

	// Validate the value
	field = field.toLowerCase();
	return ( field == 'name' || field == 'hostname' || field == 'port' || field == 'username' );
}

/**
 * A utility function to validate the direction parameter for an order by clause
 * @param  {string} direction
 * @return {boolean}
 */
function checkSortDirection( direction ){

	// Don't let toLowerCase throw an exception
	if ( typeof direction !== 'string' ){
		return false;
	}

	// Validate the value
	direction = direction.toLowerCase();
	return ( direction == 'asc' || direction == 'desc' );
}

exports.Config = Config;
exports.getAll = getAll;
exports.arrayToJson = arrayToJson;
exports.checkLimitValue = checkLimitValue;
exports.checkSortField = checkSortField;
exports.checkSortDirection = checkSortDirection;