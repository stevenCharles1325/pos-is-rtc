require('dotenv').config();

var fs = require('fs');
var path = require('path');
var json2xls = require('json2xls');
var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();

var User = require('../models/users');
var Item = require('../models/items');
var Token = require('../models/tokens');
var MonIncome = require('../models/monthlyIncome');


const requestAccessToken = ( user ) => {
  return jwt.sign( user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' } );
};

const authentication = (req, res, next) => {
  const authHeader = req.headers['authentication'];
  const token = authHeader && authHeader.split(' ')[ 1 ];

  if( !token ) return res.sendStatus( 401 );

  jwt.verify( token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if( err ) return res.sendStatus( 401 );

    req.user = user;
    next();
  });
}

// ================ Authentication routes ==================

/* GET home page. */
router.get('/verify-me', authentication, async (req, res, next) => {
  // If a request came here then it is authorized
  return res.json({ user: req.user, message: `Welcome ${ req.user.username }`});
});


router.post('/sign-in', async (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({ username: username, password: password }, (err, doc) => {
    if( err ) return res.sendStatus( 500 );

    if( doc ){
      const user = { name: username };
      const accessToken = requestAccessToken( user );
      const refreshToken = jwt.sign( user, process.env.REFRESH_TOKEN_SECRET );

      Token.create({ code: refreshToken }, err => {
        if( err ) return res.sendStatus( 500 );

        return res.json({
          message: `Welcome ${ username }!`,
          accessToken,
          refreshToken
        });
      });
    }
    else{
      return res.status( 403 ).json({
        message: 'Incorrect password or username'
      });
    }
  });
});


router.post('/sign-up', async (req, res, next) => {
  const { username, password, masterPass } = req.body;

  User.findOne({ username: username }, (err, doc) => {
    if( err ) return res.sendStatus( 500 );

    if( doc ) return res.status( 403 ).json({ message: 'Username is already used' });

    const user = { name: username };
    const accessToken = requestAccessToken( user );
    const refreshToken = jwt.sign( user, process.env.REFRESH_TOKEN_SECRET );


    User.find({}, (err, doc) => {
      if( err ) return res.sendStatus( 500 );

      let role = 'normal';

      if( !doc.length ) role = 'admin';

      if( role === 'normal' ){
        User.find({ password: masterPass }, (err, doc) => {
          if( err ) return res.sendStatus( 500 );

          if( doc.length ){
            // create token and then the account
            Token.create({ code: refreshToken }, err => {
              if( err ) return res.sendStatus( 500 );

              User.create({ role: role, username: username, password: password }, err => {
                if( err ) return res.sendStatus( 500 );

                return res.json({
                  message: `Welcome ${ username }!`,
                  accessToken,
                  refreshToken
                });
              })
            });
          }
          else{
            return res.status( 403 ).json({
              message: 'Master password is Incorrect'
            })
          }
        });
      }
      else{
        // Create as an admin
        Token.create({ code: refreshToken }, err => {
          if( err ) return res.sendStatus( 500 );

          User.create({ role: role, username: username, password: password }, err => {
            if( err ) return res.sendStatus( 500 );

            return res.json({
              message: `Welcome ${ username }!`,
              accessToken,
              refreshToken
            });
          })
        });
      }
    });
  });
});


router.delete('/sign-out', authentication, async ( req, res ) => {
  Token.deleteOne({ code: req.body.token }, (err) => {
    if( err ) return res.sendStatus( 503 );

    return res.sendStatus( 200 );
  });
});


router.post('/auth/refresh-token', async ( req, res ) => {
  const { rtoken } = req.body;

  if( !rtoken ) return res.sendStatus( 403 );

  Token.find({ code: rtoken }, (err, token) => {
    if( err ) return res.sendStatus( 503 );

    if( !token && !token.length ) return res.sendStatus( 403 );

    jwt.verify( rtoken, process.env.REFRESH_TOKEN_SECRET, ( err, user ) => {
      if( err ) return res.sendStatus( 403 );

      const accessToken = requestAccessToken({ name: user.name });

      return res.status( 200 ).json({ 
        message: 'token has been received successfully ', 
        accessToken: accessToken
      });
    });
  });
});





// =============== Regular routes ===============

router.get('/shop-items', authentication, async ( req, res ) => {
  Item.find({}, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    return res.status( 200 ).json({ items: doc, message: 'Successfully fetched all items' });
  });
});

router.post('/add-shop-item', authentication, async ( req, res ) => {
  const { item } = req.body;

  Item.find({ name: item.name }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( doc && doc.length ){
      return res.status( 403 ).json({ message: 'Item already exists' });
    }
    else{
      Item.create({ ...item }, (err, doc) => {
        if( err ) return res.sendStatus( 503 );

        return res.status( 200 ).json({ item: doc, message: 'Successfully added an items' });
      });
    }
  });
});

router.put('/update-shop-item', authentication, async ( req, res ) => {
  const { 
    _id, 
    name, 
    quantity,
    srp,
    imei,
    dateDelivered,
    dateReleased
  } = req.body;

  Item.findByIdAndUpdate( _id, { name, quantity, srp, dateDelivered, dateReleased }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    Item.find({}, (err, doc) => {
      if( err ) return res.sendStatus( 503 );

      return res.json({ items: doc, message: `Updated ${name} succcessfully!` });
    });
  });
});


router.delete('/delete-shop-item/:id', authentication, async ( req, res ) => {
  const { id } = req.params;

  Item.deleteOne({ _id: id }, err => {
    if( err ) return res.sendStatus( 503 );

    return res.json({
      message: `Successfully deleted an item!`
    }); 
  });
});


router.put('/buy-shop-item/:id', authentication, async ( req, res ) => {
  const { id } = req.params;

  const date = new Date();
  const month = date.toString().split(' ')[ 1 ];
  const year = date.toString().split(' ')[ 3 ];

  Item.findById( id, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( !doc ) return res.sendStatus( 403 );

    doc.quantity--;

    doc.save( err => {
      if( err ) return res.sendStatus( 503 );

      MonIncome.findOne({ year: year }, ( err, doc ) => {
        if( err ) return res.sendStatus( 503 );

        if( doc ){
          doc[ month.toLowerCase() ] += 1;

          doc.save( err => {
            if( err ) return res.sendStatus( 503 );

            return res.sendStatus( 200 );
          });
        }
        else{
          res.end();
        }
      });
    });
  });
});



// =========== Exporting database's data into excel spreedsheet ===========
router.get('/export-record', async (req, res, next) => {
  const path_to_xls = path.join(__dirname, '../client/public/xls');

  const currentDate = new Date();
  const renderDate = date => {
    if( !date ) return '';

    if( !(date instanceof Date) ){
      date = new Date( date );
    }

    const _parsedDate = new Date( date );
    const _date = _parsedDate.getDate();
    const _month = _parsedDate.getMonth() + 1;
    const _year = _parsedDate.getFullYear();

    return `${_year}-${_month}-${_date}`;
  }

  const fileName = `record_${ renderDate( currentDate ) }.xlsx`;

  fs.readdir( path_to_xls, (err, files) => {
    if( err ) return res.sendStatus( 503 );

     
    if( files.length ){
      files.forEach(file => {
        fs.unlink(path.join(path_to_xls, file), (err) => {
          if (err) return res.status( 503 ).json({ message: 'Server error' });
        });  
      });
    }

    Item.find({}, (err, doc) => {
      if( err ) return res.status( 503 ).json({ message: err });

      const json = doc.map( elem => ({
        name: elem.name,
        quantity: elem.quantity,
        srp: elem.srp,
        imei: elem.imei, // IMEI
        dateDelivered: renderDate( elem.dateDelivered ),
        dateReleased: renderDate( elem.dateReleased )
      }));

      const xls = json2xls(json);

      fs.writeFile(path_to_xls + `/${fileName}`, xls, 'binary', ( err ) => {
        if( err ) return res.status( 404 ).json({ message: err });

        return res.status( 200 ).json({ 
          message: 'Downloading the file...', 
          path: `/xls/${fileName}` ,
          name: fileName
        });     
      });
    });
  });
});



// ================ Monthly sales report ==================
router.get('/monthly-income-report', authentication, async( req, res, next ) => { 
  const date = new Date();
  const year = date.getFullYear();

  MonIncome.findOne({ year: year }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( doc ){
        return res.json( doc );
    }
    else{
      MonIncome.create({ year: year }, (err, doc) => {
        if( err ) return res.sendStatus( 503 );

        return res.json( doc );
      });
    }
  });
});



module.exports = router;
