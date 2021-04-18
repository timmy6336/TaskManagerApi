//our file for setting up our express server
const express = require('express')
//we start our connection to our mongodb
require('./db/mongoose')

const app = express()
//getting the port we are listening on
const port = process.env.PORT

//setting our responses to JSON
app.use(express.json())

//accessing out user endpoint router
app.use('/users',require('./routes/user.js'))
//accessing our task endpoint router
app.use('/tasks',require('./routes/task.js'))

//starting our server on the given port
app.listen(port, () => 
{
    console.log('Server is running on port: ' + port)
})