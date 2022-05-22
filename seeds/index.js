const mongoose = require('mongoose');
const Campground = require('../models/campgrounds')
const cities = require('./seeds')
const { places, descriptors } = require('./seedhelpers')

main() // Establish connection to Mongodb
async function main() { // Function connect to Mongodb
    await mongoose.connect('mongodb://localhost:27017/yelp')
        .then(() => {
            console.log("Mongo connection OPEN!")
        }).catch((err) => {
            console.log("Mongo connection ERROR!")
            console.log(err)
        })
}

// function to access random element in array.
const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 200; i++) {

        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        // Creating new campgroound.
        const camp = new Campground({
            author: '6283f63ec33a896c84644bb3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dw6xfylwa/image/upload/v1652889052/YelpCamp/cmwyptgldgjpyvyd0ggb.jpg',
                    filename: 'YelpCamp/cmwyptgldgjpyvyd0ggb',
                },
                {
                    url: 'https://res.cloudinary.com/dw6xfylwa/image/upload/v1652889053/YelpCamp/a8uvyopmb2hegu1gch3u.jpg',
                    filename: 'YelpCamp/a8uvyopmb2hegu1gch3u',
                },
                {
                    url: 'https://res.cloudinary.com/dw6xfylwa/image/upload/v1652889053/YelpCamp/x3suxovgcwc5yzsss4ed.jpg',
                    filename: 'YelpCamp/x3suxovgcwc5yzsss4ed',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt necessitatibus molestias natus quidem. Quod iure sequi neque tempore nesciunt delectus dicta optio facilis hic voluptas, fugit aspernatur illo quaerat quos.',
            price
        })

        // Saving campground to db.
        await camp.save();
    }
}

// db seeded. Closing db.
seedDB().then(() => {
    mongoose.connection.close();
});
