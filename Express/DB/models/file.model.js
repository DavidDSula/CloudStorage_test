const bd  = require("../db_connection");



const File_scm =  [
  'CREATE TABLE IF NOT EXISTS "File" ( "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" text(60) NOT NULL, hash text(255) NOT NULL UNIQUE, size NUMERIC NOT NULL, parent_id INTEGER NOT NULL, creator  text(60) NOT NULL, location  text(255) DEFAULT "", extension  text(60) DEFAULT "", rids text DEFAULT "0", is_folder integer DEFAULT 0, "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP )',
  'CREATE TRIGGER tg_updated_at_file AFTER UPDATE ON "File" BEGIN  UPDATE File SET updated_at = current_timestamp WHERE id = old.id; END;'
];

const Folder_scm =  [
  // 'CREATE TABLE IF NOT EXISTS "Folder" ( "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" text(60) NOT NULL, parent_id INTEGER  NOT NULL, creator TEXT NOT NULL, is_folder integer DEFAULT 1, last_index int DEFAULT 0, status integer DEFAULT 1,  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP )',
  'CREATE TABLE IF NOT EXISTS "Folder" ( "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, name text(60) NOT NULL, parent_id INTEGER DEFAULT 0, rids text DEFAULT "0", creator TEXT NOT NULL, location  text(255) DEFAULT "", is_folder integer DEFAULT 1,  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP )',
  'CREATE TRIGGER tg_updated_at_folder AFTER UPDATE ON "Folder" BEGIN  UPDATE Folder SET updated_at = current_timestamp WHERE id = old.id; END;'
];

createFileSystemTables = ()=>{
  for ( query of [ ...Folder_scm, ...File_scm ] )
    {
      bd.run( query, (er)=>{
        if( er )
          {
            return er
          }

      } );
    }

  return 'function createFileSystemTables executed successfully';

}

module.exports = {createFileSystemTables};