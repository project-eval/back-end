
var request = require('request')

module.exports = function (language, code) {

	request.post({url:'http://localhost:9001/run', form: {l: language, c: code} }, 
		function (error, response, body) {
			if(error) console.log('coderunner error', error)
			if (!error && response.statusCode == 200) {
				return body
			}
	})
}