const Listing = require("./models/listing") ;
const Review = require("./models/review") ;
const ExpressError = require("./utils/ExpressError.js") ;
const {listingSchema , reviewSchema} = require("./schema.js") ;

module.exports.isLoggedIn = (req ,res , next) => {
    // console.log(req.user) ;

    if(! req.isAuthenticated()){
        // originalUrl is storing here as
        // it should be stored only after when user is going to work with listing but user is not logged in
        // but session would be restored again after log in
        // so we would store it within locals
        req.session.redirectUrl = req.originalUrl ;
        req.flash("Error" , "You must be logged in to create listing !") ;
        return res.redirect("/login") ;
    } 

    next() ;
}

module.exports.saveRedirectUrl = (req , res , next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl ;
    }

    next() ;
} ;

module.exports.isOwner = async (req , res , next) => {
    let {id} = req.params ;
    let currListing = await Listing.findById(id) ;
    if(! currListing.owner._id.equals(req.user._id)){
        req.flash("Error" , "You are not the owner of this listing") ;
        return redirect(`/listings/${id}`) ;
    }

    next() ;
} ;

module.exports.isReviewAuthor = async (req , res , next) => {
    let {id , reviewId} = req.params ;
    let currReview = await Review.findById(reviewId) ;
    if(! currReview.author._id.equals(req.user._id)){
        req.flash("Error" , "You are not the author of this review") ;
        return res.redirect(`/listings/${id}`) ;
    }

    next() ;
} ;

module.exports.validateListing = (req , res , next) => {
    // let result = listingSchema.validate(req.body) ;
    // console.log(result) ;
    // if(result.error){
    //     throw new ExpressError(400 , result.error) ;
    // }

    let {error} = listingSchema.validate(req.body) ;
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",") ;
        throw new ExpressError(400 , errMsg) ;
    }else{
        next() ;
    }
} ;

module.exports.validateReview = (req , res , next) => {
    // let result = reviewSchema.validate(req.body) ;
    // console.log(result) ;
    let {error} = reviewSchema.validate(req.body) ; // extracting error obj from req.body obj
    console.log(error) ;
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",") ;
        console.log(errMsg) ;
        throw new ExpressError(400 , errMsg) ;
    }else{
        next() ;
    }
} ;