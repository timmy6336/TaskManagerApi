//We are useing sendGrid in order to send emails from the application
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


//a method to send a welcome email to a new user
const sendWelcomeEmail = (email, name) =>
{
    sgMail.send({
        to: email,
        from: 'troma@uw.edu',
        subject: 'Welcome to the app!',
        text: `welcome to the app, ${name}, please let us know about your experience and how we can help you!`
    })
}

//a method to send a goodbye email to a user deleting there profile
const sendGoodbyeEmail = (email, name) =>
{
    sgMail.send({
        to: email,
        from: 'troma@uw.edu',
        subject: `Farewell ${name}!`,
        text: `We are sad to see you leave, we hope you had a pleasent experience while useing our app. Any feedback you could provide would be greatly appriciated!`
    })
}

//exporting the emailing functions
module.exports =
{
    sendWelcomeEmail,
    sendGoodbyeEmail
}