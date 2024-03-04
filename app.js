const path = require('path')
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const {requireAuth , checkUser} = require('./middleware/authMiddleware')
//middleware functions.

const app = express();

// middleware
app.use(express.static(path.join(__dirname , 'public')));
app.use(express.json());
app.use(cookieParser());
//middleware, parses cookie to object which we can use.


// view engine
app.set('view engine', 'ejs');
app.set("views" , path.join(__dirname,"/views"));

// database connection
// const dbURI = 'mongodb+srv://shaun:test1234@cluster0.del96.mongodb.net/node-auth';
const dbURI = process.env.MONGOURL
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('*' , checkUser)//applied to every get request. If a user is logged in, 'user' object injected. res.local.user
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth , (req, res) => res.render('smoothies'));
app.use(authRoutes);
//setting up router at root