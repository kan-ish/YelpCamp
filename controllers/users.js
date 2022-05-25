const User = require('../models/user');
const nodemailer = require('nodemailer');


// Register
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        
        // send email
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: process.env.MAIL_ID, // "from" email address
              pass: process.env.PASS, // "from" email password
            }
          });
          // Construct email
          const mailBody = `<div style="width:80%; text-align:center">
          <h1>Welcome to YelpCamp!</h1>
          <img style="width:100%" src="https://images.unsplash.com/photo-1559521783-1d1599583485?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80">
          <h3>Jump right in and explore our many campgrounds. <br>
          Feel free to share some of your own and comment on others!</h3>
          <h3><a href="https://fathomless-anchorage-62415.herokuapp.com/campgrounds">Browse Campgrounds</a></h3>
          </div>`
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: '"YelpCamp" <yelpyourcamp@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Welcome to Yelpcamp", // Subject line
            html: mailBody, // html body
          });
        //   console.log(`email sent to ${username} on ${email}`)

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp! You are now logged in.');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', `${e.message}. Please try again.`);
        res.redirect('/register')
    }
}

// Login
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}
module.exports.login = (req, res) => { // Actual login code in users router file
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/');
}
