//authorization middleware verifying the user has a valid authorization token
const jwt = require('jsonwebtoken')
const User = require('../models/user')

//a method that checks if the users authorization token exists/is valid
const auth = async (req,res,next) =>
{
    try
    {
        //getting the token and removeing Bearer from the start as we are useing Bearer tokens
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //finding the user that has the given token in there list of tokens
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        //if no user was found then the token was invalid
        if(!user)
        {
            throw new Error()
        }
        //we return the token and the user that had that token so we can have easier access to that user information
        req.token = token
        req.payload = user
        next()
    }catch (err)
    {
        res.status(401).send({error: 'Authentication Token Invalid'})
    }
}

module.exports = auth