const Listing = require("../models/listing") ;
const Review = require("../models/review") ;

module.exports.createReview = async (req , res) => {
    let listing = await Listing.findById(req.params.id) ;
    // from HTML form we are passing review obj so body.review
    let newReview = new Review(req.body.review) ;
    newReview.author = req.user._id ;

    listing.reviews.push(newReview) ;
    await listing.save() ;
    await newReview.save() ;

    // console.log("New review saved") ;
    // res.send("New review saved") ;
    req.flash("success" , "New Review Created !") ;
    res.redirect(`/listings/${listing._id}`) ;
} ;

module.exports.destroyReview = async (req , res) => {
    let {id , reviewId} = req.params ;

    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}}) ;
    await Review.findByIdAndDelete(reviewId) ;
    // if we do populate only existing reviews are showed
    // let a = await Listing.findById(id).populate("reviews") ;

    req.flash("success" , "Review Deleted !") ;
    res.redirect(`/listings/${id}`) ;
} ;