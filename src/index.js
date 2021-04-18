const express = require('express')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

app.use(express.json())

app.use('/users',require('./routes/user.js'))
app.use('/tasks',require('./routes/task.js'))

app.listen(port, () => 
{
    console.log('Server is running on port: ' + port)
})