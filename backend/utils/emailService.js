const nodemailer = require("nodemailer");

// Step 1 : create transporter
// transporter = email sending service
const transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASSWORD
    }
});

// step 2 - create sendemail function

const sendEmail = async(options) => {
    // options = {to , subject , text}

    const mailOptions = {
        from : `My App <${process.env.EMAIL_FROM}>`,  //sender
        to: options.to,                                // receiver
        subject : options.subject,                      //sunbect line
        html : options.html,                            // email body(html)
    };

    // Step 3 - send email
    await transporter.sendMail(mailOptions)

}

module.exports = sendEmail;