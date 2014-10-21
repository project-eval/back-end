var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var UserSchema = mongoose.Schema({
    username  : String,
    password  : String,
    createdOn : Date,

    // TODO
    breadsticks : [String]
})

UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null)
}

UserSchema.methods.generateHash = function (password) {
    return bcrypt.compareSync(password, this.password)
}

var User = mongoose.model('User', UserSchema)

module.exports = User