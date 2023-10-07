const { sendEmail } = require('./sendEmail');

const sendVerificationEmail = async ({ name, email, verificationToken }) => {
  const message = `<p>Your email verification token is ${verificationToken}</p>`;

  const html = `<h4>Hello, ${name}</h4> ${message}`;

  return sendEmail({
    to: email,
    subject: 'LogPro Email Confirmation Token',
    html,
  });
};

module.exports = { sendVerificationEmail };
