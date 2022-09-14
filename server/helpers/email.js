const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function createMessage(emailData) {
    return {
        to: emailData.recipientAddress,
        from: process.env.FROM_EMAIL,
        subject: emailData.subject,
        text: emailData.text
    };
}

async function sendMessage(emailParams) {
    try {
      await sgMail.send(createMessage(emailParams));
      return  { message: `Transcript email sent to: ${emailParams.recipientAddress}`};
    } catch (error) {
      console.error(`Error sending transcript email to: ${emailParams.recipientAddress}`, error);
      if (error.response) {
        console.error(error.response.body)
      }
      return {message};
    }
  }

module.exports = {
    sendMessage
}