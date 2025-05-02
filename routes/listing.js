const express = require("express") ;
const router = express.Router() ;

const wrapAsync = require("../utils/wrapAsync.js") ;
const Listing = require("../models/listing.js") ;
const {isLoggedIn , isOwner} = require("../middleware.js") ;
const {validateListing} = require("../middleware.js") ;
const ListingController = require("../controllers/listing.js") ;
const multer = require("multer") ;
const {storage} = require("../cloudConfig.js") ;
// const upload = multer({dest : "uploads/"}) ;
const upload = multer({storage}) ;

router.route("/")
.get(wrapAsync(ListingController.index)) // Index Route
.post(isLoggedIn , upload.single("listing[image]") , validateListing , wrapAsync(ListingController.createListing)) ; // Create Route
// .post(upload.single("listing[image]") , (req , res) => {
//     // res.send(req.body) ;
//     res.send(req.file) ;
// }) ;

// new route should be placed above of :id route
// else new would be treated as id
// New Route
router.get("/new" , isLoggedIn , ListingController.renderNewForm) ;

router.route("/:id")
.get(wrapAsync(ListingController.showListing)) // Show Route
.put(isLoggedIn , isOwner , upload.single("listing[image]") , validateListing , wrapAsync(ListingController.updateListing)) // Update Route
.delete(isLoggedIn , isOwner , wrapAsync(ListingController.destroyListing)) ; // Delete Route

// Edit Route
router.get("/:id/edit" , isLoggedIn , isOwner , wrapAsync(ListingController.renderEditForm)) ;

module.exports = router ;