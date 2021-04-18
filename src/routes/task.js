const express = require('express')
const { findByIdAndUpdate, findById } = require('../models/task.js')
const Tasks = require('../models/task.js')
require('../models/user.js')
const auth = require('../middleware/auth')

const router = new express.Router

router.post('/', auth, async (req, res) =>
{
    const task = new Tasks({
        ...req.body,
        userId: req.payload._id
    })
    
    try
    {
        await task.save()
        res.status(201).send(task)
    }catch (err)
    {
        res.status(400).send('Error: ' + err)
    }
})

router.get('/', auth, async (req, res) =>
{
    var match = {}
    const sort = {}
    if(req.query.completed)
    {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy)
    {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try
    {
        await req.payload.populate({
            path: 'tasks',
            match,
            options:
            {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip) * parseInt(req.query.limit),
                sort
            }
        }).execPopulate()
        res.send(req.payload.tasks)
    }catch (err)
    {
        res.status(500).send()
    }
})

router.get('/:id', auth, async (req, res) =>
{
    const _id = req.params.id

    try
    {
        const task = await Tasks.findOne({
            _id,
            userId: req.payload._id
        })
        if(!task)
        {
            return res.status(404).send()
        }
        res.status(200).send(task)
    }catch (err)
    {
        res.status(500).send()
    }
})

router.patch('/:id', auth, async (req, res) =>
{
    const updates = Object.keys(req.body)
    const allowedUpdates= ['description','completed']
    const isValidOperation = updates.every( (key) => allowedUpdates.includes(key))

    if(!isValidOperation)
    {
        return res.status(400).send({error: 'Invalid update attempt'})
    }
    try
    {
        //Doing it this way to make use of middleware
        const task = await Tasks.findOne(
            {
                _id: req.params.id,
                userId: req.payload._id
            }
        )

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        
        if(!task)
        {
            return res.status(404).send({error: 'Invalid Task ID'})
        }
        res.status(200).send(task)
    }catch (err)
    {
        res.status(400).send(err)
    }
})

router.delete(('/:id'), auth, async (req, res) =>
{
    try
    {
        const task = await Tasks.findOneAndDelete( 
        {
            _id: req.params.id,
            userId: req.payload._id
        })
        if(!task)
        {
            return res.status(404).send()
        }
        res.status(200).send(task)
    }catch (err) 
    {
        res.status(500).send()
    }
})
module.exports = router