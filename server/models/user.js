var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

/**
 * @schema
 */
var UserSchema = mongoose.Schema({

    email:      String,
    username:   String,
    password:   String,
    createdOn:  {type: Date, default: Date.now},
    status:     {type: Number, default: 1},

    points:     {type: Number, default: 0},

    breadsticks : [{
        id: String, 
        hasCompleted: {type: Boolean, default: false}
    }]

})

/**
 * @method
 */
UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null)
}

/**
 * @method
 */
UserSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

/**
 * @model
 */
var User = mongoose.model('User', UserSchema)


module.exports = User