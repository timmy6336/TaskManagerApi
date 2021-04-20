const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOneId,userOne,setupDatabase,taskOne,taskTwo,userTwo} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Create a new task: Success', async () =>
{
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'Test Task'
    })
    .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    expect(task.completed).toBe(false)
})

test('Retrive tasks for a user: Success', async () =>
{
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
})

test('Delete task: Failure', async () =>
{
    request(app)
    .delete(`/tasks/&{taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})