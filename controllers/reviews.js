const Campground = require('../models/campgrounds');
const Review = require('../models/reviews');


module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);

    review.save();
    campground.save();

    req.flash('success', 'Successfully created a new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewID } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewID } })
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Successfully  deleted the review!')
    res.redirect(`/campgrounds/${id}`)
}