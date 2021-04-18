//mongoose is the tool used to make use of mongodb in an simpler way
const mongoose = require("mongoose")


//Method to connect to the database
mongoose.connect(process.env.CONNECTION_URL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false 
})

