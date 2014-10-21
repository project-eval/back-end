var User = require('./models/user')

module.exports = function (server) {

	// auth
	server.pack.register(require('hapi-auth-bearer-token'), function (err) {

	    server.auth.strategy('simple', 'bearer-access-token', {
	        allowQueryToken: true,
	        allowMultipleHeaders: true,
	        accessTokenName: 'access_token',

	        validateFunc: function (token, callback) {

	            var request = this

	            // TODO
	            // compare with token form db
	            if(token === "1234"){
	                callback(null, true, { token: token })
	            } else {
	                callback(null, false, { token: token })
	            }
	        }
	    })
	})

}