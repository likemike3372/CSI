var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");
var middleware=require("../middleware");
var NodeGeocoder = require('node-geocoder');
 var moment=require("moment");
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//show form to create new campground
router.get("/new",middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});


//INDEX Route
router.get("/", function(req, res){
        //Get all campgrounds from DB
       Campground.find({}).sort({"price": -1}).exec(function(err, campgrounds){
            if(err){
                console.log(err);
            }
            else{   
                        res.render("campgrounds/index",{campgrounds:campgrounds});
                        
            }
        });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var price=req.body.price;
  var created=req.body.date;
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image,price:price, description: desc, author:author, location: location, lat: lat, lng: lng,created:created};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampGround){
        if(err){
            console.log(err);
        }else{
               // console.log(foundCampGround);
                
                //render show template with that campground
                res.render("campgrounds/show", {campground:foundCampGround});
        }
    });
    });
    
//EDIT Campground Route
router.get("/:id/edit", middleware.checkcampownership, function(req, res){
    
      Campground.findById(req.params.id, function(err, foundCampGround){
         res.render("campgrounds/edit",{campground:foundCampGround});

              //foundCampGround.author.id is an object while author._id is a string
           
      });
    });
    
    
    //otherwise, redirect
    //if not, redirect
   
    

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkcampownership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});
    
//Destroy Campground
router.delete("/:id", middleware.checkcampownership,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } 
       else{
           res.redirect("/campgrounds");
       }
    });
});
    
router.get("/maps",function(req, res) {
    Campground.find({}).sort({"price": -1}).exec(function(err, campgrounds){
        if(err){
            
            
            console.log(err)}
        
        else{   var xxx=[];
                for(var i=0;i<campgrounds.length();i++){
                    
                
                if(campgrounds[i].created.toDateString()===campgrounds[i].created1.toDateString()){
                    xxx.push({name: campgrounds[i].name, lat:campgrounds[i].lat,lng:campgrounds[i].lng})
                }};
                res.render("campgrounds/maps",{campgrounds:xxx});
    
};})
 })

module.exports=router;