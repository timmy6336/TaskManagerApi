const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId,userOne,setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

// afterEach(() =>
// {

// })

test('Should sign up a new user', async () =>
{
    const response = await request(app).post('/users/register').send({
        name: 'Timmy',
        email: 'Timmy@email.com',
        password: 'Mylock777'
    }).expect(201)

    //assert that the user was added
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user:{
            name: 'timmy',
            email: 'timmy@email.com',
        },
        token: user.tokens[0].token
    })
})

test('Log in an existing user: Success', async () =>
{
    const response = await request(app).post('/users/signin').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Log in an existing user: Failure', async () =>
{
    await request(app).post('/users/signin').send({
        email: 'userOne.email',
        password: userOne.password
    }).expect(400)
})

test('Get profile for user: success', async () =>
{
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

})

test('Get profile for user: failure', async () =>
{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Delete a user account: success', async () =>
{
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Delete a user account: failure', async () =>
{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Uploading an image: success', async () =>
{
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Updating a user: Success', async () =>
{
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send( 
    {
        name: 'NotTimmy'
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('nottimmy')
})

test('Updating a user: Failure', async () =>
{
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send( 
    {
        location: 'NotTimmy@notEmail.com'
    })
    .expect(400)
})