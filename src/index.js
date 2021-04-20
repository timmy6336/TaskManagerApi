const app = require('./app')
const port = process.env.PORT

//starting our server on the given port
app.listen(port, () => 
{
    console.log('Server is running on port: ' + port)
})