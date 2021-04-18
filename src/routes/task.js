const express = require('express')
//exporting just the findByIdAndUpdate and FindById from the task models
const { findByIdAndUpdate, findById } = require('../models/task.js')
const Tasks = require('../models/task.js')
require('../models/user.js')
const auth = require('../middleware/auth')

//creating a router for the task endpoints
const router = new express.Router


//an endpoint for adding a new task for a user, uses auth to make sure there is a signed in user.
//expects the info for the task in the body of the request
router.post('/', auth, async (req, res) =>
{
    const task = new Tasks({
        //uses this format to directly copy everything in the body of the req to the body of the new task
        ...req.body,
        //gets the id of the logged in user
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

//an enpoint to get all tasks from a logged in user
//has filter capabilites
router.get('/', auth, async (req, res) =>
{
    var match = {}
    const sort = {}
    //if a completed variable is supplied we set it up to only get the ones with that status
    if(req.query.completed)
    {
        match.completed = req.query.completed === 'true'
    }
    //if a sort by option is supplied we sort the results by the givin param, ascending or descending
    if(req.query.sortBy)
    {
        const parts = req.query.sortBy.split('_')
        //if it was set to desc we sort by descending otherwise its sorted by ascending
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try
    {
        //getting all the tasks from a logged in user useing the params given to filer the data
        //we can do this with the populate().execPopulate() because we linked the models
        await req.payload.populate({
            path: 'tasks',
            match,
            options:
            {
                //if a limit variable is given we pageanate the response by that limit
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

//getting a task by its id, makes sure that task belongs to the logged in user
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

//updates a given task by id, makes sure the task belongs to the logged in user
router.patch('/:id', auth, async (req, res) =>
{
    const updates = Object.keys(req.body)
    //checking if the requested updates are for those we say can be updated
    //the list of allowed updates
    const allowedUpdates= ['description','completed']
    //checking the given updates
    const isValidOperation = updates.every( (key) => allowedUpdates.includes(key))

    //making sure it is valid
    if(!isValidOperation)
    {
        return res.status(400).send({error: 'Invalid update attempt'})
    }
    try
    {
        //Doing it this way to make use of middleware
        //findOne finds an entry by the givien information, built in mongoose method on any user
        const task = await Tasks.findOne(
            {
                _id: req.params.id,
                userId: req.payload._id
            }
        )

        //applying each of the supplied updates 
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

//delete a task by a supplied id, makes sure the task belongs to the logged in user
router.delete(('/:id'), auth, async (req, res) =>
{
    try
    {
        //findOneAndDelete method is used to delete a entry by its id, it is a built in moongose method for any model
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

//exports our user router
module.exports = router