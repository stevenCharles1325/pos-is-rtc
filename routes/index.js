require('dotenv').config;

var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();


const authentication = (req, res, next) => {
  const authHeader = req.headers['authentication'];
  const token = authHeader && authHeader.split(' ')[ 1 ];

  if( !token ) return res.sendStatus( 401 );

  jwt.verify( token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if( err ) return res.sendStatus( 401 );

    req.user = user;
    next();
  })
}


/* GET home page. */
router.get('/verify-me', authentication, async (req, res, next) => {
  // If a request came here then it is authorized
  return res.sendStatus( 200 );
});


router.get('/sign-in', authentication, async (req, res, next) => {
  
})

module.exports = router;
