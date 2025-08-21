const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    age : {
        type:Number,
        required : true,
    },
    email : {
        type:String,
        required : true,
    },
    moods: [{
        mood: {
            type: String, // e.g., 'Happy', 'Sad', 'Anxious'
            required: true,
        },
        reasons: [{
            type: String, // An array to hold multiple reasons
        }],
        date: {
            type: Date,
            default: Date.now,
        },
    }]
})

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);