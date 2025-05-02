const User = require("../models/user") ;

module.exports.renderSignupForm = (req , res) => {
    res.render("users/signup.ejs") ;
} ;

module.exports.signup = async (req , res) => {
    // we used wrapAsync but still we are using try catch
    // as wrap async redirect err to a diff page
    // but we want to see the err as flash at this same page & we did that at catch
    try{
        const {username , password , email} = req.body ;
        const newUser = new User({username , email}) ;
        const registeredUser = await User.register(newUser , password) ;
        console.log(registeredUser) ;

        req.login(registeredUser , (err) => { // for automatic login after signup
            if(err){
                return next(err) ;
            }

            req.flash("success" , "Welcome to WanderLust !") ;
            res.redirect("/listings") ;
        }) ;
    }catch(err){
        req.flash("error" , err.message) ;
        // console.log(err) ;
        res.redirect("/signup") ;
    }
} ;

module.exports.renderLoginForm = (req , res) => {
    res.render("users/login.ejs") ;
} ;

module.exports.login = async (req , res) => {
    req.flash("success" , "Welcome back to WanderLust !") ;
    // 1 st option needed for user who is trying to work with listing first
    // 2 nd option needed for user who is trying to log in first
    let redirectUrl = res.locals.redirectUrl || "/listings" ;
    res.redirect(redirectUrl) ;
} ;

module.exports.logout = (req , res , next) => {
    req.logout((err) => {
        if(err){
            return next(err) ;
        }
        req.flash("success" , "You are logged out !") ;
        res.redirect("/listings") ;
    }) ;
} ;