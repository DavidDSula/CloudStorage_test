<template>
  <div  class="worckArea">

    <div class="area left">
        <div class="innerArea">

            <div class="c_panel">

                <div class ='img crt_fold' title="Create folder" @click='showEl'>

                    <img src="@/assets/folder-plus-solid.svg" alt="no image">

                    <form v-click-outside="hideEl" @submit.prevent="createFolder"  name="form" class="crt_fold_Form" method="POST" style="display:none">

                        <label>Name</label>
                        <input  type="text" placeholder="Enter a Name" name="name"  required/>
                        <input   type="hidden" name="data_l"  :value=" JSON.stringify(data_l) ">

                        <button class="singup"  name="name" >
                            <a>create</a>
                        </button>

                    </form>

                </div>

                <div   class ='img upl_fold'  title="Upload file">

                    <label for="uploadFile">
                        <img src="@/assets/file-upload-solid.svg" alt="no image">
                    </label>

                    <input @change='uploadFile( $event, 1 )'  type="file" id="uploadFile" ref="uploadFile" style="display:none" multiple>
                </div>

                <div   class ='img del_fold'  title="Dele file">

                    <label for="deleteFile" @click='deleFile( 1 )'>
                        <img src="@/assets/trash-alt-solid.svg" alt="no image">
                    </label>

                </div>

                <div   class ='img copy_fold'  title="Copy file" @click='showEl'>


                    <img src="@/assets/copy-solid.svg" alt="no image">


                    <form v-click-outside="hideEl" @submit.prevent="copyFile($event, 1)"  name="form" class="copy_fold_Form" method="POST" style="display:none">

                        <div class="f_to">
                             <i class='c_dest_i'>To: </i>
                             <select class='c_dest_s'>>
                                <option :value="data_r.path != ''? data_r.path: '/'">{{data_r.path != ''? data_r.path: '/'}}</option>
                             </select>
                        </div>

                        <!-- <input   type="hidden" name="data_l"  :value=" JSON.stringify(data_l) "> -->
                        <input   type="hidden" name="c_to"  :value=" JSON.stringify(data_r) ">

                        <button class="copyf Subm"  name="copy_f" >
                            <a>Copy file</a>
                        </button>

                    </form>

                </div>

                <div   class ='img move_File'  title="Move file" @click='showEl' >

                    <img src="@/assets/clone-solid.svg" alt="no image">

                    <form v-click-outside="hideEl" @submit.prevent="copyFile($event, 1, false)"  name="form" class="move_fold_Form" method="POST" style="display:none">

                        <div class="f_to">
                            <i class='c_dest_i'>To: </i>
                            <select class='c_dest_s'>>
                                <option :value="data_r.path != ''? data_r.path: '/'">{{data_r.path != ''? data_r.path: '/'}}</option>
                            </select>
                        </div>

                        <input   type="hidden" name="c_to"  :value=" JSON.stringify(data_r) ">

                        <button class="movef Subm"  name="move_f" >
                            <a>Move file</a>
                        </button>

                    </form>

                </div>


            </div>

            <div class="nav_pannel">
                <button @click='inFolder($event, 1, data_l)' title="To root folder">
                    root folder
                    <input   type="hidden" name="itemRIDS" value="0">
                </button>
                <div class='cwd_path'>
                    {{data_l.path != ''? data_l.path : '/'}}
                </div>
            </div>

            <div class="info_pannel">
                <div class='nav name'>Name</div>
                <div class='nav size'>File size</div>
                <div class='nav modified'>Last modified</div>

            </div>

            <div class="nav_return" @click='upFolder($event, 1)'>
                <img src="../assets/level-up-alt-solid.svg" alt="no image">
                <input type="hidden" name="upRIDS" :value="this.$store.state.data_l.cwd">
            </div>


            <div  v-for="item in getCWD_left" class='iterWrap'>


                <input type="checkbox"  position='1' :id="item.name" :f_id="item.id" :fType="item.is_folder" :hash="item.hash" :name="item.name" :rids="item.rids" :loc='item.location' :f_size='item.size?item.size:null' :f_ext='item.extension?item.extension:null'  class='check_file' style="display:block">

                <div v-if="item" @click='inFolder($event, 1, item)' class="worck_pannel">

                    <div class="cwd_folder" >
                        <div class ='img'>
                            <img v-bind:src="icon(item)" alt="no image">
                        </div>
                        <div class ='item'>{{ item.name }}</div>
                    </div>

                    <div class="cwdf_Size" v-if="item.size">{{ item.size / 1000 + ' KB' }}</div>
                    <div class="cwdf_Size" v-else-if="!item.size"></div>

                    <div class="cwd_created" >
                        {{ item.updated_at.split(' ')[0].trim() }}
                    </div>

                    <input type="hidden" name="itemRIDS" :value="item.rids">

                </div>

            </div>

        </div>

    </div>

    <div class="area rigth">
        <div class="innerArea">
            <div class="navbar">

                 <div class="c_panel">

                    <div class ='img crt_fold' title="Create folder" @click='showEl'>

                        <img src="@/assets/folder-plus-solid.svg" alt="no image">

                        <form v-click-outside="hideEl" @submit.prevent="createFolder"  name="form" class="crt_fold_Form" method="POST" style="display:none">

                            <label >Name</label>
                            <input  type="text" placeholder="Enter a Name" name="name"  required/>
                            <input   type="hidden" name="data_r"  :value=" JSON.stringify(data_r) ">

                            <button class="singup"  name="name" >
                                <a>create</a>
                            </button>

                        </form>

                    </div>

                    <div   class ='img upl_fold'  title="Upload file">

                        <label for="uploadFile">
                            <img src="@/assets/file-upload-solid.svg" alt="no image">
                        </label>

                        <input @change='uploadFile( $event, 2 )'  type="file" id="uploadFile" ref="uploadFile" style="display:none" multiple>
                    </div>

                    <div   class ='img del_fold'  title="Dele file">

                        <label for="deleteFile" @click='deleFile( 2 )'>
                            <img src="@/assets/trash-alt-solid.svg" alt="no image">
                        </label>

                    </div>

                    <div   class ='img copy_fold'  title="Copy file" @click='showEl'>


                        <img src="@/assets/copy-solid.svg" alt="no image">


                        <form v-click-outside="hideEl" @submit.prevent="copyFile($event, 2)"  name="form" class="copy_fold_Form" method="POST" style="display:none">

                             <div class="f_to">
                                <i class='c_dest_i'>To: </i>
                                <select class='c_dest_s'>>
                                    <option :value="data_l.path != ''? data_l.path: '/'">{{data_l.path != ''? data_l.path: '/'}}</option>
                                </select>
                            </div>

                            <!-- <input   type="hidden" name="data_l"  :value=" JSON.stringify(data_l) "> -->
                            <input   type="hidden" name="c_to"  :value=" JSON.stringify(data_l) ">

                            <button class="copyf Subm"  name="copy_f" >
                                <a>Copy file</a>
                            </button>

                        </form>

                    </div>

                    <div  class ='img move_File'  title="Move file" @click='showEl'>


                        <img src="@/assets/clone-solid.svg" alt="no image">

                        <form v-click-outside="hideEl" @submit.prevent="copyFile($event, 2, false)"  name="form" class="move_fold_Form" method="POST" style="display:none">

                            <div class="f_to">
                                <i class='c_dest_i'>To: </i>
                                <select class='c_dest_s'>>
                                    <option :value="data_l.path != ''? data_l.path : '/'">{{data_l.path != ''? data_l.path : '/'}}</option>
                                </select>
                            </div>

                            <input   type="hidden" name="c_to"  :value=" JSON.stringify(data_l) ">

                            <button class="movef Subm"  name="move_f" >
                                <a>Move file</a>
                            </button>

                        </form>


                    </div>


                </div>

                <div class="nav_pannel">
                    <button @click='inFolder($event, 2, data_r)' title="To root folder">
                        root folder
                        <input   type="hidden" name="itemRIDS" value="0">
                    </button>
                    <div class='cwd_path'>
                        {{data_r.path != ''? data_r.path : '/'}}
                    </div>
                </div>

                <div class="info_pannel">
                    <div class='nav name'>Name</div>
                    <div class='nav size'>File size</div>
                    <div class='nav modified'>Last modified</div>
                </div>

                <div class="nav_return"  @click='upFolder($event, 2)' >
                    <img src="../assets/level-up-alt-solid.svg" alt="no image">
                    <input type="hidden" name="upRIDS" :value="this.$store.state.data_l.cwd">
                </div>

                 <div  v-for="item in getCWD_right" class='iterWrap'>

                    <input type="checkbox"  position='2' :id="item.name" :f_id="item.id" :fType="item.is_folder" :hash="item.hash" :name="item.name" :rids="item.rids" :loc='item.location' :f_size='item.size?item.size:null' :f_ext='item.extension?item.extension:null'  class='check_file' style="display:block">
                    <div v-if="item" @click='inFolder($event, 2, item)' class="worck_pannel">

                        <div class="cwd_folder" >
                                <div class ='img'>
                                    <img v-bind:src="icon(item)" alt="no image">
                                </div>
                                <div class ='item'>{{ item.name }}</div>
                            </div>

                        <div class="cwdf_Size" v-if="item.size">{{ item.size / 1000 + ' KB' }}</div>
                        <div class="cwdf_Size" v-else-if="!item.size"></div>

                        <div class="cwd_created" >
                            {{ item.updated_at.split(' ')[0].trim() }}
                        </div>

                        <input  type="hidden" name="itemRIDS" :value="item.rids">
                    </div>
                </div>
            </div>

        </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapGetters } from 'vuex'

export default
{
  name: 'worckArea',
  data()
    {
        return { img:{
            folder: 'folder-solid.svg',
            file  : 'file-solid.svg',
            image : 'file-image-solid.svg',
            media : 'play-solid.svg'
            }
        }
    },

  created()
    {
        this.get_path(1);
        this.get_path(2);
    },
  updated()
    {
        this.get_path(1);
        this.get_path(2);
    },
  watch:
    {

        data_l(){this.getCWD_left;},
        data_r(){this.getCWD_right;},
        fs(){this.getCWD_left;},
        fs(){this.getCWD_right;},
    },
  methods:
    {
        icon(el)
            {

                if( 'extension' in el)
                    {
                        if ( /(JPEG|JPG|PNG|TIFF|PSD|PDF|RAW|AI|EPS)/i.test(el.extension) )
                            return require(`@/assets/${this.img.image}`);
                        else if( /(wav|mp3|mov|mpg|mp4|avi|mpeg4|mkv)/i.test(el.extension) )
                            return require(`@/assets/${this.img.media}`);
                        else
                            return require(`@/assets/${this.img.file}`);
                    }
                else
                    return require(`@/assets/${this.img.folder}`);

            },
        inFolder(ev, position, item)
            {
                var itemRIDS = ev.currentTarget.children.itemRIDS.value;

                if(!('extension' in item))
                    this.$store.commit('goInFolder', {cwd: itemRIDS, position, id:item.id });
            },
        upFolder(ev, position)
            {
                var upRIDS = ev.currentTarget.children.upRIDS.value;

                var dir = this.$store.commit('goUpFolder', { cwd:upRIDS, position});
            },
        deleFile( position )
            {
                var data = document.querySelectorAll( `.iterWrap input[position='${position}']:checked` );

                if(!data)
                    return null;

                data.forEach( function ( el )
                    {
                        var fname = el.getAttribute("name");
                        var floc  = el.getAttribute("loc");
                        var frids = el.getAttribute("rids");
                        var f_id  = el.getAttribute("f_id");
                        var fType =  el.getAttribute("fType");

                         var formData = new FormData( );
                             formData.append('fname', fname);
                             formData.append('floc', floc);
                             formData.append('frids', frids);
                             formData.append('f_id', f_id);
                             formData.append('fType', fType);


                        this.$store.dispatch('deleteFile', formData);
                    }, this );

            },
        get_path( position )
            {
                this.$store.commit('get_cwd_path', {position});
            },
        createFolder(ev)
            {

                var formD = new FormData( ev.currentTarget );
                this.$store.dispatch('createFolder', formD );

                ev.currentTarget.style.display = 'none';
            },
        uploadFile(ev, position)
            {
                var uploadData = ev.target


                var req_params = position==1 ? JSON.stringify(this.data_l) : JSON.stringify(this.data_r);

                for (let i = 0; i < uploadData.files.length; i++)
                    {
                        let file =  uploadData.files[i]
                        if (file.size > 12850000)
                            {
                                alert(`File size is too big: ${file.name}`);
                                continue;
                            }

                        var formData = new FormData( );
                            formData.append('params', req_params);
                            formData.append('files[]', file);


                        this.$store.dispatch('uploadFile', formData );
                    }

            },
        copyFile(ev, position, m=true)
            {
                var c_to_params = position==1 ? JSON.stringify(this.data_r) : JSON.stringify(this.data_l);

                var data = document.querySelectorAll( `.iterWrap input[position='${position}']:checked` );


                if(!data)
                    return null;

                data.forEach( function ( el )
                    {
                        var fname = el.getAttribute("name");
                        var floc  = el.getAttribute("loc");
                        var frids = el.getAttribute("rids");
                        var f_id  = el.getAttribute("f_id");
                        var fType = el.getAttribute("fType");
                        var f_size= el.getAttribute("f_size");
                        var f_ext= el.getAttribute("f_ext");

                         var formData = new FormData( );
                             formData.append('fname', fname);
                             formData.append('floc', floc);
                             formData.append('frids', frids);
                             formData.append('f_id', f_id);
                             formData.append('fType', fType);
                             formData.append('f_size' , f_size);
                             formData.append('f_ext' , f_ext);
                             formData.append('copy_or_move' , m);
                             formData.append('dest' , c_to_params);


                        this.$store.dispatch('copyFile', {body:formData, path:'copyFile'});
                    }, this );
            },
        showEl(ev)
            {
                ev.currentTarget.children.form.style.display = 'block'
            },
        hideEl(ev, el)
            {
                if(!el.parentElement.contains(ev.target))
                    el.style.display = 'none'
            },
    },
  computed:
    {
        ...mapState({
            fs: state => state.fs,
            data_l:state => state.data_l,
            data_r:state => state.data_r
            }),
        ...mapGetters([
            'getCWD_left',
            'getCWD_right',
        ]),


    },
  directives:
    {
        'click-outside':
            {
                bind (el, binding, vnode)
                    {

                        el.clickOutsideEvent = function (event)
                            {
                                // here I check that click was outside the el and his childrens
                                if (!(el == event.target || el.contains(event.target)))
                                    {
                                        // and if it did, call method provided in attribute value
                                        var kay = binding.expression
                                        vnode.context[kay](event, el);
                                    }
                            };
                        document.body.addEventListener('click', el.clickOutsideEvent)
                    },
                unbind (el)
                    {
                        document.body.removeEventListener('click', el.clickOutsideEvent)
                    }
            }

    }

}

</script>

