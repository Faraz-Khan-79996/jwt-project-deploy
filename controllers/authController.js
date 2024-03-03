const User = require("../models/User");
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {  
  console.log(err.message, err.code);
  // console.log(err);
  let errors = { email: '', password: '' };

    //The below 2 errors is for login, rest are for signup
    // incorrect email
    if (err.message === 'incorrect email') {
      errors.email = 'That email is not registered';
    }
    // incorrect password
    if (err.message === 'incorrect password') {
      errors.password = 'That password is incorrect';
    }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }
  return errors;
}

//Token generator
// create json web token
const maxAge = 3 * 24 * 60 * 60;//3 days in seconds
const createToken = (id) => {
  // (string_to_make , secret_string , {options})
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: maxAge//seconds
  });
};


// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

//create a User in database.
//create a token based on '_id'.
//put token in cookie and send as response
module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id)//create token after signup
    res.cookie('jwt' , token , {httpOnly:true , maxAge:maxAge*1000})//create cookie
    // {any name }
    res.status(201).json({user:user._id});//send _id as response.
  }
  catch(err) {
    //This handle error function will return a small usable object containing
    //error information. error object is thrown when user cannot be created.
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
  //Notice, we're sending different status as well
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({errors});
  }
}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  //delete the cookie, simply make the value empty.
  //maxAge is 1 ,millisecond. therefore it immediately expires.

  res.redirect('/');//redirect to home page
}