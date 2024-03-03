const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  }
});

//next() is required to continue because these are middleware,
//also known as pre and post hooks

// read more on doc

// fire a function before doc saved to db(pre)
//We don't receive 'doc' because this is before saving to database.
//use normal function, not arrow function because we want to use 'this'.
//this in this case refers to the instance of 'User' which is about to be saved.
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password , salt);
  //hashing the password of the instance User before saving

  next();
});


// static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};


const User = mongoose.model('user', userSchema);

module.exports = User;