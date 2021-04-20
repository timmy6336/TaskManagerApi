const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = 
{
    _id: userOneId,
    name: 'John',
    email: 'John@email.com',
    password: 'HowDareYou69420',
    tokens: [{
        token: jwt.sign({ _id: userOneId },process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = 
{
    _id: userTwoId,
    name: 'Nancy',
    email: 'Nancy@email.com',
    password: 'HowDareYouagain69420',
    tokens: [{
        token: jwt.sign({ _id: userOneId },process.env.JWT_SECRET)
    }]
}

const taskOne = 
{
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    userId: userOne._id
}

const taskTwo = 
{
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    completed: true,
    userId: userOne._id
}

const taskThree = 
{
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task',
    completed: true,
    userId: userTwo._id
}

const setupDatabase = async () =>
{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOne,
    userOneId,
    setupDatabase,
    taskOne,
    taskTwo,
    userTwo
}
