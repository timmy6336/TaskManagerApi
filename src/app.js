//our file for setting up our express server
const express = require('express')
//we start our connection to our mongodb
require('./db/mongoose')

const app = express()

//setting our responses to JSON
app.use(express.json())

//accessing out user endpoint router
app.use('/users',require('./routes/user.js'))
//accessing our task endpoint router
app.use('/tasks',require('./routes/task.js'))

module.exports = app