const express = require('express');
const router = express.Router({ mergeParams: true });

const Review = require('../models/reviews');
const Campground = require('../models/campgrounds');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middlewares');
const reviews = require('../controllers/reviews')


const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');


// Reviews Create
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))


// Reviews Delete
router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;