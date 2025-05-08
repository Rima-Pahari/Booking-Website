// (node:6580) [DEP0044] DeprecationWarning: The `util.isArray` API is deprecated. Please use `Array.isArray()` instead.
// (Use `node --trace-deprecation ...` to show where the warning was created)
// warning was showing
if(process.env.NODE_ENV != "production"){
    require("dotenv").config() ;
}
// console.log(process.env.SECRET) ;

const express = require("express") ;
const app = express() ;
const mongoose = require("mongoose") ;
const path = require("path") ;
const methodOverride = require("method-override") ;
const ejsMate = require("ejs-mate") ;
const ExpressError = require("./utils/ExpressError.js") ;
const session = require("express-session") ;
const MongoStore = require("connect-mongo") ;
const flash = require("connect-flash") ;
const passport = require("passport") ;
const LocalStrategy = require("passport-local") ;
const User = require("./models/user.js") ;

app.set("view engine" , "ejs") ;
app.set("views" , path.join(__dirname , "views")) ;
app.use(express.urlencoded({extended : true})) ;
app.use(methodOverride("_method")) ;
app.engine("ejs" , ejsMate) ;
app.use(express.static(path.join(__dirname , "/public"))) ;


const dbUrl = process.env.ATLASDB_URL ;

const store = MongoStore.create({
    mongoUrl : dbUrl ,
    crypto : {
        secret : process.env.SECRET
    } ,
    touchAfter : 24 * 60 * 60
}) ;

store.on("error" , () => {
    console.log("Error in mongo session store" , err);
}) ;

const sessionOptions = {
    store ,
    secret : process.env.SECRET ,
    resave : false ,
    saveUninitialized : true ,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge : 7 * 24 * 60 * 60 * 1000 ,
        httpOnly : true
    }
} ;

app.use(session(sessionOptions)) ;
app.use(flash()) ;

app.listen(8080 , () => {
    console.log("Server is listening to port 8080") ;
}) ;

// app.get("/" , (req , res) => {
//     res.send("Hi , I am root") ;
// }) ;

async function main(){
     mongoose.connect(dbUrl) ;
}

main()
.then(() => {
    console.log("Connected to DB") ;
})
.catch((err) => {
    console.log(err) ;
}) ;

// app.get("/test/listing" , async (req , res) => {
//     let sampleListing = new Listing({
//         title : "My New Villa" ,
//         description : "By the beach" ,
//         price : 1200 ,
//         location : "Calangute , Goa" ,
//         country : "India"
//     }) ;

//     await sampleListing.save() ;

//     console.log("Sample was saved !!") ;
//     res.send("Successful testing !!") ;
// }) ;

// these 2 middle should be set before using req.user
app.use(passport.initialize()) ;
// this controls the value of req.userso it should be used before using req.user
app.use(passport.session()) ;

app.use((req , res , next) => {
    res.locals.success = req.flash("success") ;
    res.locals.error = req.flash("error") ;
    res.locals.currUser = req.user ;
    // console.log(req.user) ; // used to show login signup & logout options
    // console.log(res.locals.success) ;
    next() ;
}) ;


passport.use(new LocalStrategy(User.authenticate())) ;

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const listingRouter = require("./routes/listing.js") ;
const reviewRouter = require("./routes/review.js") ;
const userRouter = require("./routes/user.js") ;

app.use("/listings" , listingRouter) ;
app.use("/listings/:id/reviews" ,reviewRouter) ;
app.use("/" , userRouter) ;

app.get("/registeruser" , async (req , res) => {
    let fakeUser = new User({
        email : "abc@gmail.com" ,
        username : "abc"
    }) ;

    let result = await User.register(fakeUser , "123") ;
    res.send(result) ;
}) ;

app.use((req , res , next) => {
    next(new ExpressError(404 , "Page Not Found !!")) ;
}) ;

// app.all("*", (req, res, next) => {
//     try {
//         throw new ExpressError(404, "Page Not Found !!");
//     } catch (err) {
//         next(err);
//     }
// });


app.use((err , req , res , next) => {
    let {statusCode = 500 , message = "Something went wrong"} = err ;
    res.status(statusCode).render("listings/error.ejs" , {message , statusCode}) ;
    // res.status(statusCode).send(message) ;
}) ;

// app.use((req , res , next) => {
//     res.status(404).send("Page not found !!") ;
// }) ;

// app.get('/', (req,res)=>{
//     res.send("HELLO");
// })