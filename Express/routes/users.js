var express = require('express');
var router  = express.Router();
const bcrypt = require("bcryptjs");
var multer   = require('multer');


const db     = require('../DB/db_connection');

const userValidator = require( '../DB/validators/userValidator' );
var ff =  require('../Functions/fileSystem');


const badCredentials   = "The User with such data already exist";
const badCredentials_m = "The User with such data does not exist";
const success          = "The credentials is correct, the access granted.";
const registered       = " has been registered.";

const fileTable   = 'File';
const folderTable = 'Folder';
const userTable   = 'User'



var serverError = function( error, res, at_where = '' )
  {
    // .... to be improved.
    console.error( `-*-something went wrong at ${ at_where } -*-`, error );
    return res.status(500).json( { msg: { server_error: `something went wrong at ${ at_where }` } } );

  }

var userSessionHandle = ( req, res, user )=>
  {
    if ( !req.session[ 'user' ] )
      {
        req.session[ 'user' ] = {
          id_: user.id,
          email : user.email,
        };

      }
    else
      {
        res.clearCookie('t_user')
      }

  }

var comparePassword = (str , password )=>
 {
  return bcrypt.compareSync( str, password )
 }


var queryRun = function ( query, params )
  {

    return new Promise(function (resolve, reject)
      {
        db.run( query, params, function(err, row)
          {

            if (err)
              {
                reject(err); // optional: you might choose to swallow errors.
              }
            else
              {
                resolve( this )
              }
          });
      });
  };
var queryGetAll =  ( query, params )=>
  {

    return new Promise((resolve, reject) =>
      {
        db.all( query, params, (err, row) =>
          {

            if (err)
              {
                reject(err); // optional: you might choose to swallow errors.
              }
            else
              {
                resolve(row);
              }
          });
      });
  };
var queryGet =  ( query, params )=>
  {

    return new Promise((resolve, reject) =>
      {
        db.get( query, params, (err, row) =>
          {

            if (err)
              {
                reject(err); // optional: you might choose to swallow errors.
              }
            else
              {
                resolve(row)
              }
          });
      });
  };


/* Check if User exists in Session*/
router.post( '/checkUser',  multer().none(),  async function( req, res, next )
  {

    if ( req.session[ 'user' ] )
      {
        var user = req.session[ 'user' ];

        var data_l=  req.body.data_l ? req.body.data_l : { cwd:'0', path: '', parent_id: null };
        var data_r=  req.body.data_r ? req.body.data_r : { cwd:'0', path: '', parent_id: null };

        try
          {

            var form_d = await queryGetAll( 'SELECT * FROM Folder WHERE creator = ?', [user.email] );
            var file_d = await queryGetAll( 'SELECT * FROM File WHERE creator = ? ', [user.email] );

            var allData= [ ...form_d, ...file_d ];

            return res.status(200).send( { user: { email: user.email },
                                           fs  :  allData,
                                           data_l, data_r } );
          }
        catch (er)
          {
            return serverError( er, res, er );
          }

      }
    else
      return  res.status(401).send({ user: null })


  });

/* Delete User Session*/
router.post( '/logOut',  async function( req, res, next )
  {

    if ( req.session[ 'user' ] )
      {
        req.session.destroy(  );
        res.clearCookie('connect.sid', { secure: false, httpOnly: true } );

        return res.status(200).send( { user: null  } );
      }
    else
      return res.status(401).send( { user: null  } );
  });

/* Register User*/
router.post( '/register', multer().none(),  async function( req, res, next )
  {

    var userEmail    = req.body.email    ? req.body.email    : '';
    var userPassword = req.body.password ? req.body.password : '';
    var password_confirmation = req.body.password_confirmation ? req.body.password_confirmation : '';


    let validateMessage = userValidator( userEmail, userPassword, password_confirmation );
    if ( validateMessage )
      return res.status(401).json( {msg: validateMessage } );


    var usercheck = await queryGet('SELECT email, password FROM User where email=?', [userEmail]);
    if(usercheck)
          return res.status(401).send( { msg:{ errorCred: badCredentials } } );

    var hash  =  await bcrypt.hash( userPassword, 5);


    var user = await queryRun('INSERT  INTO  User ( email, password ) VALUES ( ?, ? )', [userEmail, hash] );

    if(!user.lastID)
      return res.status(401).send( { msg:'the User not registered' } );

    // -----------[ Create Session ]--------------
    userSessionHandle( req, res, { email: userEmail, id: user.lastID} );

    // -----------[ Register Default Folder in Database ]--------------
    var rids = [ 0 ];
    var rids_str =  rids.toString();

    // -----------[ Create Default User Folder ]--------------
    var userStoragePath = `${ user.lastID }`;
    var folder          = await ff.createFolder( userStoragePath );

    await queryRun('INSERT  INTO  Folder ( name, parent_id, rids, creator, location ) VALUES ( ?, ?, ?, ?, ? )', [ user.lastID, 0, rids_str, userEmail, userStoragePath ]);



    // --------- [ return Response] ---------------
    return res.status(200).json( { msg: { regSuccess: userEmail + registered },
                                   fs: [] ,
                                   user: { email: userEmail} });


  } );

// Login User -- find the user
router.post( '/login', multer().none(), async function( req, res )
  {

    var userEmail    = req.body.email    ? req.body.email    : '';
    var userPassword = req.body.password ? req.body.password : '';

    var user = await queryGet(`SELECT email, password, id FROM ${userTable} where email=?`, [userEmail]);
    if(!user)
      return res.status(401).send( { msg:{ errorCred: badCredentials_m } } );

    var passCompare = comparePassword(userPassword, user.password);
    if ( !passCompare )
      return res.status(401).send( { msg:{errorCred: badCredentials_m } });

    userSessionHandle( req, res, user );

    // ------------[ get updated File System]----------
    var form_d = await  queryGetAll(`SELECT * FROM ${folderTable} WHERE creator = ?`, [ user.email ] );
    var file_d = await  queryGetAll(`SELECT * FROM ${fileTable} WHERE creator = ?`, [ user.email ] );
    var allData= [ ...form_d, ...file_d ];


    return res.status(200).send( { msg: { loginSuccess: success},
                                      user: { email: user.email },
                                      fs:  allData
                                 } );

  });

router.post( '/delUser', multer().none(), async function( req, res )
  {
    var userEmail    = req.body.email    ? req.body.email    : '';
    var userPassword = req.body.password ? req.body.password : '';

    if ( !req.session[ 'user' ]  )
      return res.status(400).send( { msg: { message: badCredentials_m } } );

    var sesion_email = req.session[ 'user' ].email || null;


    var user = await queryGet('SELECT email, password, id FROM User where email=?', [sesion_email] );
    if(!user)
      return res.status(401).send( { msg:{ errorCred: badCredentials_m } } );

    var passCompare =  comparePassword(userPassword, user.password);
    if ( !passCompare || (user.email != userEmail ) )
      return res.status(401).send( { msg:{errorCred: badCredentials_m } });

    await ff.deleteFolder( `${user.id}` );

    await queryRun('Delete FROM Folder where creator=?', [userEmail] );

    await queryRun('Delete FROM File where creator=?', [userEmail] );

    await queryRun('Delete FROM User where email=?', [userEmail] );

    req.session[ 'user' ] = null;
    res.clearCookie('t_user');

    return res.status(200).send( { msg: { userDeleted: `User ${ userEmail } has ben deleted.` }  } );
  });







module.exports = router;
