const express = require('express')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const sharp = require('sharp')
const User = require('../models/user.js')
const { findById } = require('../models/user.js')
//exporting our auth middleware for authenticating the logged in user
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')

//we use multer to files to our database
const upload = multer(
    {
        //limits the file size of the uploaded document
        limits:
        {
            fileSize: 1000000
        },
        //filters the supplied files to only upload the types we want
        fileFilter(req, file, cb)
        {
            //we check the end of the supplied file to ensure it is one of the approved files
            //in this case we allow .jpg, .jpeg, .png
            if(!file.originalname.match(/\.(jpg||jpeg||png)$/))
            {
                //the error we choose if an invalid file type is uploaded
                return cb(new Error('File must be an Image'))
            }
            //the first param is the error we would supply but since its a success it is undefined, the second param is wheather it was a success
            cb(undefined, true)
        }
    }
)
//creating a router for our user endpoints
const router = new express.Router

//the user endpoint for registering a new user, it expects all the information in the request body
router.post('/register', async (req, res) =>
{
    //create a user from the request body
    const user = new User(req.body)

    try
    {
        //save the user
        await user.save()
        //send a welcome email to our new user
        sendWelcomeEmail(user.email, user.name)
        //generate an authorization token as since they just registered we sign them in automatically
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch (err)
    {
        res.status(400).send('Error: ' + err)
    }
})

//a user endpoint to sign in a user
router.post('/signin', async (req, res) =>
{
    try
    {
        //use the find by credentials middleware to check if the user/password combination exists
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //generate an authenicaton token for the now signed in user
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(err)
    {
        res.status(400).send()
    }
}) 

//a user endpoint to signout a user, makes sure there is a user signed in
router.post('/logout', auth, async (req, res) =>
{
    try
    {
        //if a user was signed in that means the currently saved token was in there model so we just remove it to log them out from this specific device
        req.payload.tokens = req.payload.tokens.filter((token) =>
        {
            return token.token != req.token
        })
        await req.payload.save()

        res.send()
    }catch (err)
    {
        res.status(500).send()
    }
})

//a user endpoint to log out a user from all logged in devices, we ensure the user is logged in in the first place.
router.post('/logoutAll', auth, async (req, res) =>
{
    try
    {
        //we remove all of the users authorization tokens so they are no longer logged in anywhere
        req.payload.tokens = []
        await req.payload.save()

        res.send()
    }catch (err)
    {
        res.status(500).send()
    }
})

//a user endpoint to get the information of the currently logged in user
router.get('/me', auth , async (req, res) =>
{
    res.send(req.payload)
})

//a user endpoint for editing information of the currently signed in user
router.patch('/me', auth, async (req, res) =>
{
    const updates = Object.keys(req.body)
    //the attrabutes we allow to be updated
    const allowedUpdates= ['name','email','password','age']
    //ensureing only approved updates are being requested
    const isValidOperation = updates.every( (key) => allowedUpdates.includes(key))

    if(!isValidOperation)
    {
        return res.status(400).send({error: 'Invalid update attempt'})
    }
    try
    {
        const user = req.payload
        //applying each requested update
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.status(200).send(user)
    }catch (err) 
    {
        res.status(400).send(err)
    }
})

//a user endpoint for deleting an account, ensures it delets the account of the logged in user.
router.delete(('/me'), auth, async (req, res) =>
{
    try
    {
        //a mongoose built in method for removing a entry from a model
        await req.payload.remove()
        //sends a goodbye email to the user deleting there account
        sendGoodbyeEmail(req.payload.email, req.payload.name)
        res.status(200).send(req.payload)
    }catch (err) 
    {
        res.status(500).send()
    }
})

//a user endpoint for adding a users avatar
router.post('/me/avatar', auth , upload.single('avatar'), async (req,res) =>
{
    //editing the supplied image to be a specified type and size
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.payload.avatar = buffer
    await req.payload.save()
    res.send()
}, (err, req, res, next) =>
{
    res.status(400).send({ error: err.message })
})

//a user endpoint for removing a user avatar
router.delete('/me/avatar', auth , async (req,res) =>
{
    req.payload.avatar = undefined
    await req.payload.save()
    res.send()
})

//a user endpoint for getting the avatar of a user
router.get('/:id/avatar', async (req,res) =>
{
    try
    {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)
        {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(err)
    {
        res.status(404).send()
    }
})

module.exports = router