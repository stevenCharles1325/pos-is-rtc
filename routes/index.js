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
var ItemList = require('../models/itemList');
var TransactionList = require('../models/transactionHistory');


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
  User.findOne({ role: 'sysadmin' }, (err, doc) => {
    if( err ) return res.sendStatus( 500 );

    if( !doc ){
      const sysadmin = {
        role: 'sysadmin',
        username: 'sysadmin',
        password: 'sysadmin',
      };

      User.create({ ...sysadmin }, err => {
        if( err ) return res.sendStatus( 500 );
      });
    }
  });

  return res.json({ user: req.user, message: `Welcome ${ req.user.username }`});
});


router.post('/sign-in', async (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({ username: username, password: password }, (err, doc) => {
    if( err ) return res.sendStatus( 500 );

    if( doc ){
      if( doc.status === 'deactivated' ){
        return res.status( 401 ).json({ message: 'This user is deactivated' });
      }
      else{
        const user = { name: username, role: doc.role };
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

    const user = { name: username, role: doc.role };
    const accessToken = requestAccessToken( user );
    const refreshToken = jwt.sign( user, process.env.REFRESH_TOKEN_SECRET );


    User.find({}, (err, doc) => {
      if( err ) return res.sendStatus( 500 );

      let role = 'normal';

      if( !doc.length ) role = 'admin';

      if( role === 'normal' ){
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
router.delete('/item-list-delete', authentication, async( req, res ) => {
  ItemList.delete({}, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( doc ) return res.json( doc );
  });
});


router.get('/item-list', authentication, async( req, res ) => {
  ItemList.find({}, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( doc ) return res.json( doc );
  });
});


router.get('/shop-items', authentication, async ( req, res ) => {
  Item.find({}, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    return res.json({ items: doc, message: 'Successfully fetched all items' });
  });
});


router.post('/add-shop-item', authentication, async ( req, res ) => {
  const { item } = req.body;

  // Item.create({ ...item }, (err, doc) => {
  //   if( err ) return res.sendStatus( 503 );

  //   return res.status( 200 ).json({ item: doc, message: 'Successfully added an items' });
  // });

  Item.find({ name: item.name.toLowerCase() }, (err, doc) => {
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
    dateDelivered,
    dateReleased
  } = req.body;

  if( !_id ) return res.status( 403 ).json({ message: 'Error occured, please try again!' });

  Item.findOne({ name: name.toLowerCase() }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( doc && doc._id.toString() !== _id ){
      return res.status( 403 ).json({ message: 'Item already exists' });
    }
    else{
      Item.updateOne({ _id: _id }, { name, quantity, srp, dateDelivered, dateReleased }, err => {
        if( err ) return res.sendStatus( 503 );

        return res.json({ message: `Updated ${name} succcessfully!` });
      });
      // Item.findByIdAndUpdate( _id, { name, quantity, srp, dateDelivered, dateReleased }, (err, doc) => {
      //   if( err ) return res.sendStatus( 503 );


      //   Item.find({}, (err, doc) => {
      //     if( err ) return res.sendStatus( 503 );

      //     return res.json({ items: doc, message: `Updated ${name} succcessfully!` });
      //   });
      // });
    }
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

router.put('/user-status/id/:id', async( req, res ) => {
    User.findOne({ _id: req.params.id }, (err, doc) => {
      if( err ) return res.sendStatus( 503 );

      if( doc ){
        doc.status = doc.status === 'activated' ? 'deactivated' : 'activated';

        doc.save( err => {
          if( err ) return res.sendStatus( 503 );

          res.sendStatus( 200 );
        });
      }
      else{
        return res.sendStatus( 404 );
      }
    });
});

router.put('/buy-shop-item/:id/sold-by/:username', authentication, async ( req, res ) => {
  const { id } = req.params;

  const date = new Date();
  const month = date.toString().split(' ')[ 1 ];
  const year = date.toString().split(' ')[ 3 ];

  Item.findById( id, async (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( !doc ) return res.sendStatus( 403 );

    doc.quantity--;

    try{
       MonIncome.findOne({ year: year }, ( err, data ) => {
        if( err ) return res.sendStatus( 503 );

        if( data ){
          console.log( data[ month.toLowerCase() ]);
          data[ month.toLowerCase() ] += 1;

          data.save( err => {
            if( err ) return res.sendStatus( 503 );

            const dateToday = new Date().toString();
            TransactionList.create({ 
              soldBy: req.params.username, 
              itemName: doc.name,
              srp: doc.srp,
              date: dateToday,
              year: dateToday.split(' ')[ 3 ],
              month: dateToday.split(' ')[ 1 ]
            }, err => {
                if( err ) return res.sendStatus( 503 );

                doc.save( err => {
                  if( err ) return res.sendStatus( 503 );

                  return res.sendStatus( 200 );
                });          
            })
          });
        }
        else{
          res.end();
        }
      });
    }
    catch( err ){
      throw err;
      return res.sendStatus( 503 );
    }
  });
});


router.get('/transaction-history', async ( req, res, next ) => {
  TransactionList.find({}, ( err, doc ) => {
    if( err ) return res.sendStatus( 503 );

    if( doc ){
      return res.json( doc );
    }
  });
});


// =========== Exporting database's data into excel spreedsheet ===========
router.get('/export-record', async (req, res, next) => {
  const path_to_xls = path.join(__dirname, '../client/public/xls');

  const currentDate = new Date();

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

    // heyy
    TransactionList.find({}, (err, doc) => {
      if( err ) return res.status( 503 ).json({ message: err });

      const json = doc.map( elem => ({
        soldBy: elem.soldBy,
        itemName: elem.itemName,
        srp: elem.srp,
        date: renderDate( elem.date ),
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
router.get('/graph-data', authentication, async( req, res, next ) => { 
  const date = new Date();
  const year = date.getFullYear();

  const adminCount = await User.find().where({ role: 'admin' }).count();
  const employeeCount = await User.find().where({ role: 'normal' }).count();

  MonIncome.findOne({ year: year }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( doc ){
        return res.json({ report: doc, adminCount, employeeCount });
    }
    else{
      MonIncome.create({ year: year }, (err, doc) => {
        if( err ) return res.sendStatus( 503 );

        return res.json({ report: doc, adminCount, employeeCount });
      });
    }
  });

});


router.get('/get-nonadmin-users', async( req, res ) => {
  User.find({ role: 'normal' }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );
    
    return res.json( doc );    
  });
});


router.get('/get-users', async( req, res ) => {
  User.find({}, (err, doc) => {
    if( err ) return res.sendStatus( 503 );
    
    return res.json( doc );    
  });
});

router.put('/update-user/:id', async( req, res ) => {
  User.findOneAndUpdate({ _id: req.params.id }, { ...req.body }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );


    return res.json({ message: 'Updated user successfully' });
  });
});


router.delete('/delete-user/:id', async( req, res ) => {
  User.deleteOne({ _id: req.params.id }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    return res.json({ message: 'Deleted user successfully' });
  });
});

router.post('/add-user', async( req, res ) => {
  User.findOne({ username: req.body.usename }, (err, doc) => {
    if( err ) return res.sendStatus( 503 );

    if( doc ){
      return res
        .status( 406 )
        .json({
          message: 'User already exists'
        });
    }
    else{
      User.create({ ...req.body }, (err, doc) => {
        if( err ) return res.sendStatus( 503 );

        return res.json({ message: 'Added user successfully' });
      });
    }
  });
});


router.get('/download/record-type/:recordType', async ( req, res ) => {
  const { recordType } = req.params;
  const isRecordTypeEmpty = !!recordType;

  if( !isRecordTypeEmpty ){
    return res.sendStatus( 404 );
  }
  else{
    const createFile = (name, recordType) => {
      const path_to_xls = path.join(__dirname, '../client/public/xls');
      const currentDate = new Date();

      const fileName = `${name}_${ renderDate( currentDate ) }.xlsx`;

      fs.readdir( path_to_xls, (err, files) => {
        if( err ) return res.sendStatus( 503 );

         
        if( files.length ){
          files.forEach(file => {
            fs.unlink(path.join(path_to_xls, file), (err) => {
              if (err) return res.status( 503 ).json({ message: 'Server error' });
            });  
          });
        }

        if( recordType === 'daily' ){
          TransactionList.find({}, (err, doc) => {
            if( err ) return res.status( 503 ).json({ message: err });

            const json = doc.map( elem => ({
              soldBy: elem.soldBy,
              itemName: elem.itemName,
              srp: elem.srp,
              date: renderDate( elem.date ),
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
        }
        else{
          MonIncome.find({}, (err, doc) => {
            if( err ) return res.status( 503 ).json({ message: err });

            const json = doc.map( elem => ({
              Year: elem.year,
              Jannuary: elem.jan,
              February: elem.feb,
              March: elem.mar,
              April: elem.apr,
              May: elem.may,
              June: elem.jun,
              July: elem.jul,
              August: elem.aug,
              September: elem.sep,
              October: elem.oct,
              November: elem.nov,
              December: elem.dec
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
        }
      });
    }

    createFile( recordType, recordType );
  }
});


router.put('/change-password/user/:name', authentication, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { name } = req.params;


  User.findOne({ username: name }, ( err, user ) => {
    if( err ) return res.sendStatus( 503 );

    if( user ){
      if( user.password === currentPassword ){
        user.password = newPassword;

        user.save( err => {
          if( err ) return res.sendStatus( 503 );

          return res.sendStatus( 200 );
        });
      }
      else{
        return res.sendStatus( 403 );
      }
    }
    else{
      return res.sendStatus( 404 );
    }
  }); 
});


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


module.exports = router;
