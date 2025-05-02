const Listing = require("../models/listing") ;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN  ;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req , res) => {
    const allListings = await Listing.find({}) ;
    // console.log(allListings) ;

    res.render("listings/index.ejs" , {allListings}) ;
} ;

module.exports.renderNewForm = (req , res) => {
    res.render("listings/new.ejs") ;
} ;

module.exports.showListing = async (req , res) => {
    const {id} = req.params ;
    // using populate so that during render we can access the whole review objs not jst the id of review objs
    // under reviews using populate to extract each review author
    const listing = await Listing.findById(id).populate({path : "reviews" , populate : {path : "author"}}).populate("owner") ;
    console.log(listing) ;
    if(! listing){
        req.flash("error" , "Listing does not exist !") ;
        return res.redirect("/listings") ;
    }

    res.render("listings/show.ejs" , {listing}) ;
} ;

module.exports.createListing = async (req , res , next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location ,
        limit: 1
    })
    .send()

    // console.log(response.body.features[0].geometry) ;
    // res.send("Done") ;


    let url = req.file.path ;
    let filename = req.file.filename ;
    // console.log(url , ".." , filename) ;
    // if(! req.body.listing){
    //     throw new ExpressError(400 , "Send valid data for listing") ;
    // }
    
    // const {title , description , image , price , location , country} = req.body ;
    let listing = req.body.listing ;
    let newListing = new Listing(listing) ;
    newListing.owner = req.user._id ;
    newListing.image = {url , filename} ;
    newListing.geometry = response.body.features[0].geometry ;

    // if(! newListing.title){
    //     throw new ExpressError(400 , "Title is missing !!") ;
    // }

    // if(! newListing.description){
    //     throw new ExpressError(400 , "Description is missing !!") ;
    // }

    // if(! newListing.country){
    //     throw new ExpressError(400 , "Country is missing !!") ;
    // }

    let savedListing = await newListing.save() ;
    console.log(savedListing) ;

    req.flash("success" , "New Listing Created !") ;
    res.redirect("/listings") ;
} ;

module.exports.renderEditForm = async (req , res) => {
    let {id} = req.params ;
    let listing = await Listing.findById(id) ;
    console.log(listing) ;

    if(! listing){
        req.flash("error" , "Listing does not exist !") ;
        return res.redirect("/listings") ;
    }

    let originalUrl = listing.image.url ;
    originalUrl = originalUrl.replace("/upload" , "/upload/w_250") ;
    res.render("listings/edit.ejs", {listing , originalUrl}) ;
} ;

module.exports.updateListing = async(req , res) => {
    let {id} = req.params ;
    let newListing = await Listing.findByIdAndUpdate(id , {... req.body.listing}) ;

    if(typeof req.file !== "undefined"){ // if we want to change the existing image file
        let url = req.file.path ;
        let filename = req.file.filename ;
        newListing.image = {url , filename} ;
        await newListing.save() ;
    }

    req.flash("success" , "Listing Updated !") ;
    res.redirect(`/listings/${id}`) ;
} ;

module.exports.destroyListing = async (req , res) => {
    let {id} = req.params ;
    const deletedListing = await Listing.findByIdAndDelete(id) ;
    console.log(deletedListing) ;

    req.flash("success" , "Listing Deleted !") ;
    res.redirect("/listings") ;
} ;