
// var request = require('request')
// module.exports = function (language, code) {

// 	request.post({url:'http://localhost:9001/run', form: {l: language, c: code} }, 
// 		function (error, response, body) {
// 			if(error) console.log('coderunner error', error)
// 			if (!error && response.statusCode == 200) {
// 				return body
// 			}
// 	})
// }
// 
// 

// TEMP CODE RUNNER (only works with js)

var SandBox = require('sandbox')
var sandbox = new SandBox()

module.exports = function (language, code, cb) {

	if(!language || !code) {
		cb('missing language or code params', null)
	}

	else if(language === 'javascript') {
		sandbox.run(code, cb.bind(null, null))
	}

	else {
		cb('language is not supported!', null)
	}

}