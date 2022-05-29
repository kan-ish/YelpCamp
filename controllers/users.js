const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const Token = require('../models/token');
const ejs = require('ejs');
const path = require('path');


// Register
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        // registeredUser.isActive;

        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
        
        const url = `https://fathomless-anchorage-62415.herokuapp.com/verify/${user._id}/${token.token}`

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

        ejs.renderFile(path.join(__dirname, '..', 'views/emailVerify.ejs'), { url }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                const mainOptions = {
                    from: '"YelpCamp" <yelpyourcamp@gmail.com>',
                    to: email,
                    subject: 'Hello, world',
                    html: data
                };
                // console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`email sent to ${username} on ${email}. ` + info.response);
                    }
                });
            }
            
            });

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('warning', `Welcome to YelpCamp! Please verify your email by clicking the verification link we sent on ${email}.`);
            res.redirect(`/campgrounds`); // http://localhost:3000/campgrounds // https://fathomless-anchorage-62415.herokuapp.com/campgrounds
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
    const redirectUrl = req.session.returnTo || 'https://fathomless-anchorage-62415.herokuapp.com/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/');
}

// verify email
module.exports.verifyEmail = async (req, res, next) => {   
    try {
    const { id, token } = req.params
    const user = await User.findOneAndUpdate({ _id: id }, {isActive: true});
    await Token.findByIdAndRemove(token._id);
    } catch (error) {
    res.status(400).send("An error occured");
    }

    req.flash('success', 'Email successfully verified!');
    res.redirect(`https://fathomless-anchorage-62415.herokuapp.com/campgrounds`)
}