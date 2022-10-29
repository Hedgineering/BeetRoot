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
    required:true}
    ,
    votes: {
    type:Number,
    required:true }

})

module.exports=mongoose.model("Comment",commentSchema)

/*
Comment = {
    comment_id: 098709870987,
    posted_by: 234523452345,
    replied_by: [098709870987, 098709870988],
    message: "This song is cool",
    flagged: false,
    replies: 2,
    votes: 1 
}
*/