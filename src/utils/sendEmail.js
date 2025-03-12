const sgMail = require('@sendgrid/mail');
require('dotenv').config(); 

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_PASSWORD); 

/**
 * Send an email using SendGrid.
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER, 
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
