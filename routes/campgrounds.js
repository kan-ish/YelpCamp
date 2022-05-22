const express = require('express');
const router = express.Router();

const { isLoggedIn, validateCampground, isAuthor } = require('../middlewares');
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds'); // controller

// Cloudinary, multer
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


// READ
router.get('/', catchAsync(campgrounds.index));

// CREATE new
router.get('/new', isLoggedIn, campgrounds.renderNewForm)
router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

// READ details
router.get('/:id', catchAsync(campgrounds.viewCampground))

// UPDATE edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
router.patch('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))

// DELETE
router.delete('/:id', isLoggedIn, campgrounds.deleteCampground)


module.exports = router;