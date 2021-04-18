//setting up our task model for our database, this is where mongoose shines as it allows us to set these up for easy use in the database
const mongoose = require("mongoose")
const validator = require('validator')

//we set up a schema first to allow for adding functions/timestamps
const taskSchema = new mongoose.Schema({
    //a description of the task
    description:
    {
        type: String,
        required: true,
        trim: true
    },
    //the status of the task
    completed:
    {
        type: Boolean,
        default: false
    },
    //the id of the user that created it
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //the model that this links too
        ref: 'User'
    }
},
//useing the second param of a schema to allow timestamps to be created
{
    timestamps: true
})

//creating the modle for our database useing the schema we created
const Tasks = mongoose.model('Task',taskSchema)

//exporting our task model, allows us simple functions on it for adding and manipulating data in the databaseS
module.exports = Tasks