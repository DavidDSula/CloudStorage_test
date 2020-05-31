var express = require('express');
var router  = express.Router();
const bcrypt = require("bcryptjs");
var multer   = require('multer');
var fs   = require('fs');

const dotenv= require('dotenv').config();
const db    = require('../DB/db_connection');

var ff =  require('../Functions/fileSystem');


const fileTable   = 'File';
const folderTable = 'Folder'


const storage = multer.diskStorage(
  {
    destination: (req, file, cb) =>
      {
        var data_params = JSON.parse(JSON.parse(JSON.stringify(req.body)).params);
        var dir = data_params.path? `./storage/${req.session[ 'user' ].id_}${data_params.path}/` : `./storage/${req.session[ 'user' ].id_}/`;

        var check = data_params.path? `./storage/${req.session[ 'user' ].id_}/${data_params.path}/${file.originalname}` : `./storage/${req.session[ 'user' ].id_}/${file.originalname}`;
        fs.exists(check, exist =>
          {

            if (exist)
              {
                var error =  new Error();
                    error.status = 411;
                    error.text   = 'the file  already exists';
                return cb(error, false)
              }
            return cb(null, dir)
          })
      },
    filename: (req, file, cb) =>
      {
        cb(null, `${file.originalname}` )
      }
  })
var upload = multer({ storage }).any();


var serverError = function( error, res, at_where = '' )
  {
    // .... to be improved.
    console.error( `-*-something went wrong at ${ at_where } -*-`, error );
    return res.status(500).json( { msg: { server_error: `something went wrong at ${ at_where }` } } );

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
                resolve(row)
              }
          });
      });
  };



// test query
router.get('/',   function(req, res, next)
  {

    db.all("SELECT * FROM User", function(err, rows) {
      return  res.status(200).send( { msg:{ user: rows } } );
    });

  });


router.post('/createFolder', multer().none(),  async function(req, res, next)
  {
    var reqParams   =  ('data_l' in req.body) ? JSON.parse(req.body.data_l): JSON.parse(req.body.data_r);

    var f_name      = req.body.name;
    var destination = reqParams.path? `${req.session[ 'user' ].id_}${reqParams.path}/${f_name}` : `${req.session[ 'user' ].id_}/${f_name}`;
    var parent_id   = reqParams.parent_id? reqParams.parent_id : req.session[ 'user' ].id_;
    var rids_str    = [...reqParams.cwd.split(','), parent_id].toString();
    var creator     = req.session[ 'user' ].email


    if( !await ff.fileExists(destination) )
      {
        var query = "INSERT  INTO  Folder ( name, parent_id, rids, creator, location ) VALUES ( ?, ?, ?, ?, ? )"

        var ins_folder = await queryRun(query, [ f_name, parent_id, rids_str, creator, destination ] );

        if(!ins_folder.lastID)
          return  res.status(409).send( { msg:  'Folder already exists'  } );

        // ---------[ Create folder]----------
        var folder  = await ff.createFolder( destination );

        var all_folds = await  queryGetAll('SELECT * FROM  Folder WHERE creator = ?', [ creator ] );
        var all_files = await  queryGetAll('SELECT * FROM  File WHERE creator = ?', [ creator ] );

        return res.status(200).json( { msg: { fSystem : folder },
                                              fs: [...all_folds, ...all_files] ,
                                              ...req.fields,
                                              user: { email: creator} });

      }
    else
      {
        return res.status(409).json( { msg:  'File already exists'  } );
      }
  });

router.post('/deleteFolder', multer().none(),  async function(req, res, next)
  {
    var f_name      = req.body.fname;
    var f_id        = req.body.f_id;
    var fType       = req.body.fType;
    var floc        = req.body.floc;
    var destination = req.body.floc ? `${floc}` : `${req.session[ 'user' ].id_}/${f_name}`;
    var rids_str    = req.body.frids;
    var creator     = req.session[ 'user' ].email;

    var innerids     = [...rids_str.split(','), f_id ].toString();

    if( await ff.fileExists(destination) )
      {
        var fTable = parseInt(fType)? folderTable : fileTable;


        if( !parseInt(fType) )
          {

            //  if file
            var delF_msg =  await ff.deleteFile( `${destination}` );
            await queryRun(`DELETE FROM ${fTable} WHERE id = ? And creator = ? and rids = ?`, [f_id, creator, rids_str ] );
          }
        else
          {
             //  if Folder
            var delF_msg = await ff.deleteFolder( `${destination}` );
            // -------[ Del folder ]-------
            await queryGetAll(`DELETE FROM ${fTable} WHERE id = ? And creator = ? and rids = ?`, [f_id, creator, rids_str ] );
            // -------[ Del all children folders  ]-------
            await queryGetAll(`DELETE FROM ${fTable} WHERE  creator = ? and rids LIKE ?`, [ creator, `${innerids}%` ] );
            // -------[ Del all children Files  ]-------
            await queryGetAll(`DELETE FROM ${fileTable} WHERE  creator = ? and rids LIKE ?`, [ creator, `${innerids}%` ] );
          }

        // ------------[ get updated File System]----------
        var all_folds = await  queryGetAll(`SELECT * FROM ${folderTable} WHERE creator = ?`, [ creator ] );
        var all_files = await  queryGetAll(`SELECT * FROM ${fileTable} WHERE creator = ?`, [ creator ] );

        return res.status(200).json( { msg: { fSystem : delF_msg }, fs:[...all_folds, ...all_files], user: { email: creator} });
      }
    else
      return  res.status(409).json( { msg:  'File does not exists'  } );
  });

router.post('/createFile', upload, async function(req, res, next)
  {
    const file    = req.files[0];
    const params_ = JSON.parse(JSON.parse(JSON.stringify(req.body)).params);

    var extension   = file.mimetype;
    var origName    = file.originalname;
    var f_size      = file.size;
    var parent_id   = params_.parent_id? params_.parent_id : req.session[ 'user' ].id_;
    var rids_str    = ( params_.cwd )?[...params_.cwd.split(','), parent_id].toString(): '0' ;
    var creator     = req.session[ 'user' ].email;
    var location    = params_.path? `${req.session[ 'user' ].id_}${params_.path}/${origName}` : `${req.session[ 'user' ].id_}/${origName}`;

    var hash  =  await bcrypt.hash( origName+rids_str, 3);

    // return res.status(200).json( { fs: hash });


    var q_params = [ origName, hash, f_size, parent_id, creator, rids_str, extension, location ];

    try
      {
        await queryRun( `INSERT OR IGNORE INTO  ${fileTable} ( name, hash, size, parent_id, creator, rids, extension, location ) VALUES (?,?,?,?,?,?,?,?)`, q_params );

        var form_d = await  queryGetAll(`SELECT * FROM ${folderTable} WHERE creator = ?`, [ creator ] );
        var file_d = await  queryGetAll(`SELECT * FROM ${fileTable} WHERE creator = ?`, [ creator ] );

        var allData= [ ...form_d, ...file_d ];

        return res.status(200).json( { fs: allData });
      }
    catch (er)
      {
        return serverError( er, res, er );
      }

  });
// ----------[copy or move file ]--------
router.post('/copyFile', multer().none(),  async function(req, res, next)
  {
    var dest_o      =  JSON.parse(JSON.parse(JSON.stringify(req.body)).dest);

    var copy_or_move= req.body.copy_or_move === 'true'? true : false; // true or false

    var f_name      = req.body.fname;
    var fType       = req.body.fType;
    var floc        = req.body.floc;
    var c_path      = req.body.floc ? `${floc}` : `${req.session[ 'user' ].id_}/${f_name}`;

    var f_id         = req.body.f_id;
    var f_ext        = req.body.f_ext;
    var new_par_id   = dest_o.parent_id;
    var new_rids     = dest_o.cwd;
    var f_size       = req.body.f_size;
    var to_path      = dest_o.path != '' ? `${req.session[ 'user' ].id_}${dest_o.path}` : `${req.session[ 'user' ].id_}`;
    var new_location = dest_o.path != '' ? `${req.session[ 'user' ].id_}${dest_o.path}/${f_name}` : `${req.session[ 'user' ].id_}/${f_name}`;
    var creator      = req.session[ 'user' ].email;

    var new_hash  =  await bcrypt.hash( f_id + f_name + new_rids , 3);

    // return res.status(409).json( { msg:new_location });

    if(parseInt(fType))
      return res.status(409).json( { msg:'cannot copy folders yet' });

    if( await ff.fileExists(new_location) )
      return res.status(409).json( { msg:'file alredy exists' });


    if( await ff.fileExists(c_path) && await ff.fileExists(to_path) )
      {
          // --------------[ copy or move file in file system ]---------------
          if(copy_or_move)
            {
              var c_fs_resp = await ff.copyFile(c_path, new_location)

              if(!c_fs_resp)
                return res.status(409).json( { msg: 'The file has not been copied. Some server error happened' });
            }
          else
            {
              var c_fs_resp = await ff.moveFile(c_path, new_location);

              if(!c_fs_resp)
                return res.status(409).json( { msg: 'The file has not been moved. Some server error happened' });
            }



        try
          {
            // ----------[ Update File Table ]-----------
            if(copy_or_move)
              {
                var q_params = [ f_name, new_hash, f_size, new_par_id, creator, new_rids, f_ext, new_location ];
                await queryRun( `INSERT OR IGNORE INTO  ${fileTable} ( name, hash, size, parent_id, creator, rids, extension, location ) VALUES (?,?,?,?,?,?,?,?)`, q_params );
              }
            else
              {
                var q_params = [ new_hash, new_par_id,  new_rids, new_location, f_id ];
                await queryRun( `UPDATE ${fileTable} SET hash=?, parent_id=?, rids=?, location=? WHERE id=? `, q_params );
              }


            // ------------[ get updated File System]----------
            var form_d = await  queryGetAll(`SELECT * FROM ${folderTable} WHERE creator = ?`, [ creator ] );
            var file_d = await  queryGetAll(`SELECT * FROM ${fileTable} WHERE creator = ?`, [ creator ] );
            var allData= [ ...form_d, ...file_d ];

            return res.status(200).json( { msg: c_fs_resp, fs: allData });
          }
        catch (error)
          {
            console.log(error);
            return  res.status(409).json( { msg:  'some server error occurred'  } );
          }

      }



    return res.status(409).json( { msg:'Directory does not exist' });
  });

// ---[ Create Tables ]---
router.get('/create',  async function(req, res, next)
  {

    var createUserTable        = require('../DB/models/user.model');
    var {createFileSystemTables} = require('../DB/models/file.model');

    var exec = [ createUserTable(), createFileSystemTables() ];

    return  res.status(200).send( { msg:  exec  } );

  });




module.exports = router;
