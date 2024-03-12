const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    _id : {type:mongoose.ObjectId,required:[true,'id for the game is required']},
    itemName: {type: String, required: [true, 'name of the game is required']},
    category: {type: String, required: [true, 'category is required']},
    details: {type: String, required: [true, 'details is required'], minLength: [15, 'the details should have atleast 15 characters']},
    gameCondition: {type: String, required: [true, 'game condition is required']},
    image: {type:String, required: [true, 'image is required to display an image for the game']},
    author :  {type: Schema.Types.ObjectId, ref:'User'},
    requestedTradeItems : [{type:mongoose.ObjectId}],
    receivedTradeItems : [{type:mongoose.ObjectId}],
    status : {type:String,default:'Available'}
},
{timestamps: true}
);



module.exports = mongoose.model('Game', itemSchema);