var fs   = require('fs');
const { COPYFILE_EXCL } = fs.constants;
var path = require('path');



var createFolder =  async function ( pathname )
  {
    const __dirname = path.resolve();

    pathname = `../storage/${pathname}`;
    pathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
    pathname = path.resolve(__dirname, pathname );

    if ( !fs.existsSync(pathname) )
      {
        try
          {
            await fs.promises.mkdir(pathname, { recursive: true });
          }
        catch (error){ throw err }

        return 'Folder successfully created !'

      }
    else
      return 'Folder already exists'

  }
var deleteFolder =  async function ( pathname )
  {
    const __dirname = path.resolve();

    pathname = `../storage/${pathname}`;
    pathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
    pathname = path.resolve(__dirname, pathname );

    try
      {
        var res = await fs.promises.rmdir(pathname, { recursive: true });

        return 'Folder deleted!'
      }
    catch (error){ throw err }

  }
var deleteFile =   async function ( pathname )
    {
      pathname = `../storage/${pathname}`;
      pathname = path.resolve(__dirname, pathname );

      try
        {
          var res = await fs.promises.unlink(pathname);

          return 'File deleted!'
        }
      catch (error){ return err }

    }

var fileExists = async function ( pathname_o )
  {

    pathname = `../storage/${pathname_o}`;
    pathname = path.resolve(__dirname, pathname );

    // await fs.promises.access(pathname)? true: false;

    return  fs.existsSync(pathname)? true: false;
  }
var copyFile = async function ( pathname_o,  new_location  )
  {

    new_loc  = `../storage/${new_location}`;
    pathname = `../storage/${pathname_o}`;
    new_loc  = path.resolve(__dirname, new_loc );
    pathname = path.resolve(__dirname, pathname );

    try
    {
      await fs.promises.copyFile( pathname, new_loc, COPYFILE_EXCL);

      return 'The file has ben copied'
    }
    catch (error) {
      return false
    }
  }
var moveFile = async function ( pathname_o,  new_location  )
  {

    new_loc  = `../storage/${new_location}`;
    pathname = `../storage/${pathname_o}`;

    new_loc  = path.resolve(__dirname, new_loc );
    pathname = path.resolve(__dirname, pathname );

    try
    {
      await fs.promises.rename(pathname, new_loc)
      // fs.copyFileSync( pathname, new_loc, COPYFILE_EXCL);
      // fs.unlinkSync(pathname );

      return 'The file has ben moved'
    }
    catch (error) {
      console.log(error);
      return false
    }

  }


module.exports = { createFolder, deleteFile, deleteFolder,  fileExists, copyFile, moveFile }