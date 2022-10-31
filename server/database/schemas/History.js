const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user_id:{
        type: mongoose.SchemaTypes.ObjectID,
        required:true
    },
    streams:{
        type: [{
            song:{
                type:mongoose.SchemaTypes.ObjectID,
                required:true
            },
            times_streamed:{
                type: Number,
                default:0,
                required: true
            }
        }],
        required:true
    }
});

module.exports = mongoose.model('History', historySchema)