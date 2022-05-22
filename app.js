if (process.env.NODE_ENV !== " production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodoverride = require('method-override');
const ejsmate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const expressError = require('./utils/expressError');

// Passport authentication
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

// Routers
const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

// Security
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const MongoStore = require('connect-mongo');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.engine('ejs', ejsmate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); // Dunno what this is for. Find out.
app.use(mongoSanitize());

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp';
main() // Establish connection to Mongodb
async function main() { // Function connect to Mongodb
    await mongoose.connect(dbUrl)
        .then(() => {
            console.log("Mongo connection OPEN.")
        }).catch((err) => {
            console.log("Mongo connection ERROR.")
            console.log(err)
        })
}

const secret = process.env.SECRET || 'tempsecret';

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
});

//session for cookies and flash msgs
const sessionConfig = {
    store,
    name: 'NotExpectingThisWereYou',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))


app.use(passport.initialize());
app.use(passport.session()); // Should always come after session middleware
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware + currentUser
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // Should come after User.deserializeUser().
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use(helmet({
    // contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false, // This has changed since 2020.
}));
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dw6xfylwa/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




//Routes


app.get('/', (req, res) => {
    res.render('home')
})
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', userRoutes)


// Error handling middlewares
app.all('*', (req, res, next) => {
    next(new expressError('Error 404, Not found', 404))
})
app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Oh no, something went wrong. :('
    if (!err.status) err.status = 500;

    res.status(err.status).render('error', { err })
})


app.listen(3000, () => {
    console.log('App listening on port 3000.')
})

