const jwt = require('jsonwebtoken');
const User = require('../models/User')

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  //taking out the token. Made possible by cookie parser

  // check json web token exists & is verified
  if (token) {
    //jwt.verify(token , secret , func(error , decodedToken))
    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
    //change the URL in the browser.
    //redirects to the given URL.
    //relative to the domain of the server
  }
};

// check current user
const checkUser = (req, res, next) => {
  //This middleware is to inject the data if they are logged in.


  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        //we're giving it null instead of not creating user in local at all because,
        // we will be accessing the 'user' inside of the views, so if 'user' does not exist, 
        // it will throw error as we're accessing a variable which is not there in the first place

        next();
      } else {
        //user is an object fetched from database from 
        //id received from decoding token and accesing from payload
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;//user object is now available to views
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};


module.exports = { requireAuth, checkUser };