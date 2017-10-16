var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'email.apbi@gmail.com',
    pass: '3M4Il_apB1'
  }
});

var mailOptions = {
  from: 'herdi.16@gmail.com',
  to: 'herdi.itt@gmail.com;haikalandrean09@gmail.com;fkhr.razi@gmail.com;rioeduardo92@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'Spam Email - test APBI'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});