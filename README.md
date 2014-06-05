configapi
=========

A demo node.js REST API server

This is a pretty good start to a working REST API server written in node.js. There are definitely some things that would need to be done to get this closer to production ready.

- Use https instead of http
- The authtoken should probably have its own table with other parameters, like an expire time
- Error handling should be modified to use domains because as of now an exception will halt the entire server
- Ability to create new users and update passwords
- The namespaces for the data models could be better
- Could probably make a base object and/or module for the models
- Application configuration should be added for things like:
  - The mysql connection options
  - The ip address to listen on


### CLI
The server can be started by executing server.js in node:
`nodejs server.js [port]`

### Route handlers
The routing works by adding scripts to the handlers directory. Each script name will correspond to a route that is valid for the api. For instance, `handlers/login.js` makes `http://localhost/login` a valid route. Inside each handler script should be function definitions that specify actions to be taken depending on what http method is used for the request. For instance, `function GET` inside `handlers/login.js` makes a get request valid for `http://localhost/login`. The fucntions must be exported as node.js modules, `exports.GET = GET`.

The handler functions take the request and response objects from the node.js http server as the first two parameters. The third parameter is any post data that was sent with the request, processed into a json object. The last parameter is a callback function. The callback function takes error objects as the first two parameters. The first error object will be the message sent to the user with a 500 response code. The second error object will be the message that is logged for the request. The third parameter is a json object that will be sent to the user with a 200 reponse code.

The second parameter in the url is passed to the handler in the data object with the name `urlparam`. This is always set in the data object, so note that no post value can be passed as `urlparam`. The regular expression that parses the url only allows word characters in the url. This means that the route and url parameter can only contain `[A-Za-z0-9_]`.

### Authentication
When the user is authenticated, the token will be returned in the response and a cookie will also be set for convience. I know what you are going to say. *A cookie in a REST API? How dare you! The state should be transmitted with every request, not stored in a cookie.* But think about how cookies work for a minute. The authentication token will be stored in a cookie on the client that is sent to the server in the header of every request. That sounds like transmitting the state with every request to me. Either way, you have the option to use the cookie or not, since the token is also returned in the reposne body after logging in.

The default password in the demo sql is: `test`.

- `POST /login` : Login to the system
  - `email` : The user's email address
  - `password` : The user's password
- `GET /logout` : Logout of the system

### Searching
This application is designed to list and manage a set of configurations. The standard REST operations apply.

- `GET /config/name` : List the configuration with the specified name
- `GET /config` : List all the configurations stored in the system
  - `order` : The field used to sort the list (name, hostname, port, username)
  - `direction` : The direction of the sort (asc, desc)
  - `limit` : The number of results to return (defaults to 10)
  - `page` : The page of results based on the limit, starting at 1 (defaults to 1)
- `POST /config` : Insert a new configuration
  - All fields must be supplied (name, hostname, port, username)
- `PUT /config/name` : Update the configuration with the specified name
  - At least one field must be set (name, hostname, port, username)
- `DELETE /config/name` : Delete the configuration with the specified name