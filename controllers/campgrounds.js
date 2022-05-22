const Campground = require('../models/campgrounds');
const expressError = require('../utils/expressError');
const { cloudinary } = require('../cloudinary');

// mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxtoken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxtoken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    console.log(geoData.body.features[0].geometry)
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; // geocoding the location
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // adding images from multer to campground
    campground.author = req.user._id // Adding current user as author 
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully created a new Campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.viewCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that Campground.');
        res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that Campground.');
        res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    if (!req.body.campground) throw new expressError('Invalid campground data.', 400);
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // Expanding req.body.campground with "...". Don't remember why. Find out.
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); // adding images to campground from multer, same as when creating campground. images and imgs are both arrays, so need to expand imgs before pushing into images.
    await campground.save()
    if (req.body.deleteImages) {
        for (let image of req.body.deleteImages) {
            await cloudinary.uploader.destroy(image);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) // can be added in the above loop
    };
    req.flash('success', 'Successfully updated the Campground!');
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    // Following 3 lines are for deleting reviews. Commented out bc using Mongoose middleware instead.
    // const camp = await Campground.findById(id)
    // await Review.deleteMany({ "_id": { $in: camp.reviews } })
    // await Campground.remove(camp)

    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }

    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully  deleted the Campground!')
    res.redirect('/campgrounds');
}