const express = require('express')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const sharp = require('sharp')
const User = require('../models/user.js')
const { findById } = require('../models/user.js')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')
const upload = multer(
    {
        limits:
        {
            fileSize: 1000000
        },
        fileFilter(req, file, cb)
        {
            if(!file.originalname.match(/\.(jpg||jpeg||png)$/))
            {
                return cb(new Error('File must be an Image'))
            }
            cb(undefined, true)
        }
    }
)
const router = new express.Router

router.post('/register', async (req, res) =>
{
    const user = new User(req.body)

    try
    {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch (err)
    {
        res.status(400).send('Error: ' + err)
    }
})


router.post('/signin', async (req, res) =>
{
    try
    {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user,token})
    }catch(err)
    {
        res.status(400).send()
    }
}) 

router.post('/logout', auth, async (req, res) =>
{
    try
    {
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

router.post('/logoutAll', auth, async (req, res) =>
{
    try
    {
        req.payload.tokens = []
        await req.payload.save()

        res.send()
    }catch (err)
    {
        res.status(500).send()
    }
})

router.get('/me', auth , async (req, res) =>
{
    res.send(req.payload)
})

router.patch('/me', auth, async (req, res) =>
{
    const updates = Object.keys(req.body)
    const allowedUpdates= ['name','email','password','age']
    const isValidOperation = updates.every( (key) => allowedUpdates.includes(key))

    if(!isValidOperation)
    {
        return res.status(400).send({error: 'Invalid update attempt'})
    }
    try
    {
        const user = req.payload
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.status(200).send(user)
    }catch (err) 
    {
        res.status(400).send(err)
    }
})

router.delete(('/me'), auth, async (req, res) =>
{
    try
    {
        await req.payload.remove()
        sendGoodbyeEmail(req.payload.email, req.payload.name)
        res.status(200).send(req.payload)
    }catch (err) 
    {
        res.status(500).send()
    }
})

router.post('/me/avatar', auth , upload.single('avatar'), async (req,res) =>
{
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.payload.avatar = buffer
    await req.payload.save()
    res.send()
}, (err, req, res, next) =>
{
    res.status(400).send({ error: err.message })
})

router.delete('/me/avatar', auth , async (req,res) =>
{
    req.payload.avatar = undefined
    await req.payload.save()
    res.send()
})

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