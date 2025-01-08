const nodemailer = require('nodemailer');
const {getEmailTemplate, newMessageTemplate} = require('./emailTemplate');

const EMAIL_SERVICE = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_SERVICE,
        pass: EMAIL_PASSWORD,
    },
});

const sendEmail = async (to, subject, uname, v_code) => {
    try {
        const mailOptions = {
            from: EMAIL_SERVICE,
            to,
            subject,
            html: getEmailTemplate(uname, v_code),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return {success: true, response: info.response};
    } catch (error) {
        console.error('Error sending email:', error);
        return {success: false, error};
    }
};

const notify = async (receiver, subject, message) => {
    try {
        const mailOptions = {
            from: EMAIL_SERVICE,
            to: receiver,
            subject,
            html: newMessageTemplate(message.receiver, message.sender, message.message),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return {success: true, response: info.response};
    } catch (error) {
        console.error('Error sending email:', error);
        return {success: false, error};
    }
};

module.exports = {sendEmail, notify};
