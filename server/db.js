var mongoose = require('mongoose')
mongoose.connect('mongodb://dev:mahalo@ds047030.mongolab.com:47030/olive-garden')
var db = mongoose.connection

console.log('connecting to DB...')

db.on('error', function (err) {
	throw err
})
db.once('open', function () {
    console.log('connected to DB.')
})

module.exports = db