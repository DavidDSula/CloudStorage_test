const bd     = require("../db_connection");



var User_scm =  [
  'CREATE TABLE IF NOT EXISTS "User" ( "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "email" text(60) NOT NULL UNIQUE, "password" text(255) NOT NULL, "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP )',
];

var createUserTable = ()=> {
  for ( query of User_scm)
    {

      bd.run( query, (er)=>{
        if( er )
          {
            return er;
          }

      } );
    }

  return 'function createUserTable executed successfully';

}



module.exports  = createUserTable;