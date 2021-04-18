const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>
{
    sgMail.send({
        to: email,
        from: 'troma@uw.edu',
        subject: 'Welcome to the app!',
        text: `welcome to the app, ${name}, please let us know about your experience and how we can help you!`
    })
}

const sendGoodbyeEmail = (email, name) =>
{
    sgMail.send({
        to: email,
        from: 'troma@uw.edu',
        subject: `Farewell ${name}!`,
        text: `We are sad to see you leave, we hope you had a pleasent experience while useing our app. Any feedback you could provide would be greatly appriciated!`
    })
}

module.exports =
{
    sendWelcomeEmail,
    sendGoodbyeEmail
}