const { sendEmail } = require('./sendEmail');

const sendResetPasswordEmail = async ({ name, email, passwordToken }) => {
  const message = `<p>Your password reset token is ${passwordToken}</p>`;

  const html = `<h4>Hello, ${name}</h4> ${message}`;

  return sendEmail({
    to: email,
    subject: `${process.env.APP_NAME.split(' ').join(
      '-'
    )} Reset Password Token`,
    html,
  });
};

module.exports = { sendResetPasswordEmail };
