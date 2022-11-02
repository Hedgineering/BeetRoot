const mongoose=require("mongoose")

const commentSchema=new mongoose.Schema({
    posted_by: {
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
    },
    replied_by: {
        type:[mongoose.SchemaTypes.ObjectId],
        required:true
    },
    message:{
        type:String,
        required:true
    },
    flagged:{
        type:Boolean,
        required:true
    } ,
    replies: {
        type:Number,
        required:true
    },
    votes: {
        type:Number,
        required:true 
    }
})

module.exports=mongoose.model("Comment",commentSchema)
