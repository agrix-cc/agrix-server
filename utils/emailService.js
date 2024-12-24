const nodemailer = require('nodemailer');
const getEmailTemplate = require('./emailTemplate');

const sendEmail = async (to, subject, uname, v_code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dulanganadhamsara@gmail.com',
        pass: 'zedeagbwqasjotpx',
      },
    });

    const mailOptions = {
      from: 'dulanganadhamsara@gmail.com',
      to,
      subject,
      html: getEmailTemplate(uname,v_code),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, response: info.response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
