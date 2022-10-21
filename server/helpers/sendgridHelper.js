const sgMail = require("@sendgrid/mail");

class SendGridFactory {
    sgMailInstance;
    constructor() {
      if (SendGridFactory._instance) {
        return SendGridFactory._instance
      }
      SendGridFactory._instance = this;
  
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sgMailInstance = sgMail;
    }
  }
  
const sendgrid = new SendGridFactory();

module.exports = {
    sendgrid
};