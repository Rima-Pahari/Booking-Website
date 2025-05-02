const express = require("express") ;
const router = express.Router({mergeParams : true}) ;

const wrapAsync = require("../utils/wrapAsync.js") ;
const Review = require("../models/review.js") ;
const Listing = require("../models/listing.js") ;
const {isReviewAuthor , validateReview , isLoggedIn} = require("../middleware.js") ;
const reviewController = require("../controllers/review.js") ;

// POST Review Route
router.post("/" , isLoggedIn , validateReview , wrapAsync(reviewController.createReview)) ;

// DELETE Review Route
router.delete("/:reviewId" , isLoggedIn , isReviewAuthor , wrapAsync(reviewController.destroyReview)) ;

module.exports = router ;