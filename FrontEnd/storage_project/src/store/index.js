import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state:
    {
      user:[],
      msg:[],
      fs:[],
      data_l:{ cwd:'0', path: '', parent_id: null },
      data_r:{ cwd:'0', path: '', parent_id: null }
    },
  getters:
    {
      getCWD_left: (state)=>
        {
          var parent_id = null;

          if(state.fs)
            {
              var cwf = state.fs.filter( (el)=>
                {
                  if( el.rids == state.data_l.cwd && !state.data_l.parent_id )
                    parent_id = el.id
                  else if( state.data_l.parent_id )
                    parent_id = state.data_l.parent_id;


                  if( parent_id == el.parent_id )
                    return el
                });

              return cwf;
            }


        },
      getCWD_right: (state)=>
        {
          var parent_id = null;

          if(state.fs)
            {

              var cwf = state.fs.filter( (el)=>
                {
                  if( el.rids == state.data_r.cwd && !state.data_r.parent_id )
                    parent_id = el.id
                  else if( state.data_r.parent_id )
                    parent_id = state.data_r.parent_id;

                  if( parent_id == el.parent_id )
                    return el
                });

              return cwf;
            }

        }
    },
  mutations:
    {
      checkUserSession (state, payload = null )
        {
          state.user = payload;
        },
      Login (state, payload = [])
        {
          state.user = payload.user? payload.user: null ;
        },
      msg ( state, payload = [] )
        {
          state.msg  = payload ;
        },
      fs(state, payload = [])
        {
          state.fs   = payload.fs ? payload.fs: state.fs ;
        },
      goInFolder: (state, {cwd, position, id=0})=>
        {
          var data = state.fs.find( e => (e.rids == cwd && e.id == id) );

          if(position == 1 )
            {
              state.data_l.cwd = cwd;

              if( data && data.id )
                state.data_l.parent_id = data.id;
              else
                state.data_l.parent_id = 0;
            }
          if(position == 2 )
            {
              state.data_r.cwd = cwd;

              if( data && data.id )
               state.data_r.parent_id = data.id;
              else
               state.data_r.parent_id = 0;
            }

        },
      goUpFolder: (state,  {cwd, position})=>
        {

          var cwd = cwd.split(',');
          if( cwd.length > 1 )
            cwd.pop();

          var parent_id = state.fs.find( e => e.rids == cwd );

          if( position == 1 )
            {
              state.data_l.cwd = cwd.toString();
              state.data_l.parent_id = parent_id.id;

            }
          if( position == 2 )
            {
              state.data_r.cwd = cwd.toString();
              state.data_r.parent_id = parent_id.id;
            }

        },
      get_cwd_path: (state, { position })=>
        {
          var data = position == 1?  state.data_l :  state.data_r
          var rids = data.cwd.split(',');
      
          if( !data.parent_id )
            {
              var parFolder =  state.fs.find( (el) => { return ( el.parent_id == 0 && el.rids == '0' )} );

              if(parFolder)
                {
                  data.parent_id = parFolder.id;
                }
            }

          state.fs.reduce((s, el, ind)=>
            {
              if( el.rids == data.cwd &&  data.parent_id === el.id  )
                s.push( el.id.toString() )

              return s
            }, rids);


          var path = state.fs.reduce( ( s, el, index)=>
            {
              if( rids.includes( el.id.toString() ) && index!=0 &&  el.is_folder )
                {
                  s += '\/'+el.name;
                }
              return s
            }, '' );

          if( position == 1 )
            {
              state.data_l.path = path
              state.data_l.parent_id = data.parent_id
            }
          else
            {
              state.data_r.path = path
              state.data_r.parent_id = data.parent_id
            }


        }
    },
  actions:
    {
      async checkUserSession (context,  path ='/users/checkUser' )
        {

          let corsAPI = `${process.env.VUE_APP_DATA_API}${path}` ;

          var formData = new FormData();
          formData.append('data_l', JSON.stringify(context.state.data_l) );
          formData.append('data_r', JSON.stringify(context.state.data_r) );

          const myHeaders = {
                              method : 'POST',
                              headers: {
                                  // 'Content-Type': 'application/x-www-form-urlencoded',
                                  'X-Requested-With': 'XMLHttpRequest',
                              },
                              credentials: 'include',
                              body   : formData
                            };

          const response = await fetch( corsAPI, myHeaders )
          const data     = await response.json()

          if (data && 'user' in data )
            {
              context.commit('checkUserSession', data.user);
              context.commit('fs'  , data );
            }
          else
            {
              context.commit('checkUserSession' )
            }

        },
      async Login (context,  payload )
        {

          let corsAPI = `${process.env.VUE_APP_DATA_API}${payload.path}` ;
          let r_body  = payload.form;

          const myHeaders = {
                              method : 'POST',
                              headers: {
                                  // 'Content-Type': 'application/x-www-form-urlencoded',
                                  'X-Requested-With': 'XMLHttpRequest',
                              },
                              credentials: 'include',
                              body   : r_body
                            };

          const response  = await fetch( corsAPI, myHeaders );

          var data = '';

          if ( response.status >= 200 && response.status <= 299 )
            {
              data    = await response.json();

              if (data.msg && (data.msg.regSuccess || data.msg.loginSuccess ) )
                  {
                      context.commit('Login', data );
                      context.commit('msg'  , data.msg );
                      context.commit('fs'  , data )
                  }
              else if ( data.msg && data.msg.contact )
                  {
                    context.commit('msg'  , data.msg );
                  }
              else if ( data.msg && data.msg.userDeleted )
                  {
                    context.commit('Login' );
                  };
            }
          else if ( response.status === 401 )
            {
              let regErrors = await response.json();

              context.commit('msg', regErrors )
            }
        },
      async createFolder(context,  payload)
        {
          let corsAPI = `${process.env.VUE_APP_DATA_API}/createFolder` ;
          let r_body  = payload;

          const myHeaders = {
                              method : 'POST',
                              headers: {
                                  // 'Content-Type': 'application/x-www-form-urlencoded',
                                  'X-Requested-With': 'XMLHttpRequest',
                              },
                              credentials: 'include',
                              body   : r_body
                            };

          const response  = await fetch( corsAPI, myHeaders );

          var data = '';

          if ( response.status === 200 )
            {
              data    = await response.json();

              context.commit('fs'  , data );
            }
          else if ( response.status >= 401 )
            {
              let regErrors = await response.json();

              context.commit('msg', regErrors )
            }
        },
      async uploadFile(context,  payload )
        {

          let corsAPI = `${process.env.VUE_APP_DATA_API}/createFile` ;

          const myHeaders = {
                              method : 'POST',
                              headers: {
                                  // 'Content-Type': 'application/x-www-form-urlencoded',
                                  'X-Requested-With': 'XMLHttpRequest',
                              },
                              credentials: 'include',
                              body   : payload
                            };


          const response  = await fetch( corsAPI, myHeaders );


          if ( response.status === 200 )
            {
              var data    = await response.json();
              context.commit('fs'  , data );
            }

        },
      async deleteFile(context,  payload )
        {
          let corsAPI = `${process.env.VUE_APP_DATA_API}/deleteFolder` ;

          const myHeaders = {
                              method : 'POST',
                              headers: {
                                  // 'Content-Type': 'application/x-www-form-urlencoded',
                                  'X-Requested-With': 'XMLHttpRequest',
                              },
                              credentials: 'include',
                              body   : payload
                            };


          const response  = await fetch( corsAPI, myHeaders );


          if ( response.status === 200 )
            {
              var data    = await response.json();
              context.commit('fs'  , data );
            }
        },
      async copyFile(context,  payload)
        {
          let corsAPI = `${process.env.VUE_APP_DATA_API}/${payload.path}` ;

          const myHeaders = {
                              method : 'POST',
                              headers: {
                                  // 'Content-Type': 'application/x-www-form-urlencoded',
                                  'X-Requested-With': 'XMLHttpRequest',
                              },
                              credentials: 'include',
                              body   : payload.body
                            };


          const response  = await fetch( corsAPI, myHeaders );


          if ( response.status === 200 )
            {
              var data    = await response.json();
              context.commit('fs'  , data );
            }
          else if ( response.status >= 401 )
            {
              let servError = await response.json();

              context.commit('msg', servError )
            }
        }
    },

  modules: {
  }
})
