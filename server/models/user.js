var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var UserSchema = mongoose.Schema({

    email: String,
    username: String,
    password: String,
    createdOn: Date,

    points: Number,

    // TODO
    breadsticks : [{id: String, hasCompleted: Boolean}]
})

UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null)
}

UserSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

var User = mongoose.model('User', UserSchema)

module.exports = User