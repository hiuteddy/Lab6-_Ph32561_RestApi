const mongoose = require('mongoose');
const Scheme = mongoose.Schema;
const Fruits = new Scheme({
    name:{type:String},
    quantity:{type:String},
    price:{type:String},
    status:{type:String},
    image:{type:Array},
    description:{type:String},
    id_distributor:{type: Scheme.Types.ObjectId,ref:'distributor'},
},{
    timestamps:true
})
module.exports = mongoose.model('fruits',Fruits)

