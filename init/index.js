const mongoose = require("mongoose") ;
const initData = require("./data.js") ;
const Listing = require("../models/listing.js") ;

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust" ;
async function main(){
    mongoose.connect(MONGO_URL) ;
}

main()
.then(() => {
    console.log("Connected to DB") ;
})
.catch((err) => {
    console.log(err) ;
}) ;

const initDB = async () => {
    await Listing.deleteMany({}) ;
    // console.log(initData) ;
    // console.log(initData.data) ;
    initData.data = initData.data.map((obj) => ({...obj , owner : "68127ac56ee7f80143940a59"})) ;
    await Listing.insertMany(initData.data) ;
    
    console.log("Data was initialised") ;
} ;

initDB() ;