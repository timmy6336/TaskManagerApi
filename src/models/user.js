//the model of our user for the database
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('./task.js')

//setting up the schema seperatly to make use of function decleration and allowing timestamps
const userSchema = new mongoose.Schema({
    //the name of our user
    name: 
    {
        //set the type of object this attrabute must be
        type: String,
        //changes the string to all lowercase
        lowercase: true,
        //sets the attrabute to be required
        required: true,
        //removes empty space from the beggining and end of the string
        trim: true
    },
    //the email of our user
    email:
    {
        type: String,
        //used to set our unique attrabute of our model
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        //set this method to put some specific requirements on this attrabute
        validate(value)
        {
            //here we are making sure it is an email, useing the validator module built in isEmail function
            if(!validator.isEmail(value))
            {
                throw new Error('Invalid Email!')
            }
        }
    },
    //the password of our user
    password:
    {
        type: String,
        required: true,
        trim: true,
        // sets a minimum length for our attrabute
        minlength: 7,
        validate(value)
        {
            //making sure that the password we are given does not contain the word password
            if(value.toLowerCase().includes('password'))
            {
                throw new Error('Invalid Password: Password cannot contain the word "password"')
            }
        }
    },
    age:
    {
        //sets the type to be any Number
        type: Number,
        //gives a default value to this attrabute if none is supplied
        default: 0,
        validate(value)
        {
            //ensures the value supplied is not negitive
            if(value < 0)
            {
                throw new Error('Age must be a positive number!')
            }
        }
    },
    //saves a list of tokens the user has, allows you to sign in and out independently on diffrent devices
    tokens:
    [{
        token:
        {
            type: String,
            required: true
        }
    }],
    //saves an image to be used as an avatar
    avatar:
    {
        type: Buffer
    }
},
//creates timestamps when the entity is created/updated
{
    timestamps: true
})

//setting up a link to the tasks this user has created, since we are not actually saving all the tasks as entries on the user we are setting up a virtual link.
userSchema.virtual('tasks', 
{
    //the model this links to
    ref: 'Task',
    //the field from this model that is referenced in the other model
    localField: '_id',
    //the field in the other model that referenced this model
    foreignField: 'userId'
})

//overrideing the toJSON method so when just printing out this object we can determin what is shown
userSchema.methods.toJSON = function()
{
    const user = this
    const userObject = user.toObject()

    //chooseing which fields to exclude from public view
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//a middleware function that generates a authorization token, we use this when a user registers or signs in
//it is used independently for each user
userSchema.methods.generateAuthToken = async function()
{
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

//a static method to find a user in the database from a given email and password, it is used 
//the same by any user so it is a static instead of a method
userSchema.statics.findByCredentials = async (email, password) =>
{
    const user = await User.findOne({ email })
    
    if(!user)
    {
        throw new Error('Unable to log in: Email and password do not match!')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch)
    {
        throw new Error('Unable to log in: Email and password do not match!')
    }
    return user
}


//Hash the plain text password before saving
userSchema.pre('save', async function (next)
{
    const user = this

    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Delete all tasks from a user when the user is deleting there account
userSchema.pre('remove', async function (next) 
{
    const user = this

    await Task.deleteMany({ userId: user._id})

    next()
})

//creating our user model
const User = mongoose.model('User', userSchema)

//exporting our user model
module.exports = User