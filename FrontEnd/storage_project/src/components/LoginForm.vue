<template>
  <div  class="loginWrapper">

      <form v-on:submit.prevent="login_s" ref="loginF" class="loginForm" method="POST" >
          <!-- <a class="closeMe">&times;</a> -->
          <div class="imgContainer">

          </div>

          <label for="uname">Email</label>
          <input id="uname" type="text" placeholder="admin@gmail.com" name="email" />


          <br/>

          <label for="pass">Password</label>
          <input id="pass" type="password" placeholder="88888888" name="password" />

          <br/>
          <button class="singin" type="submit" name="singin" >Login</button>
          <button class="singup"  name="singup" >
              <a href="">Sing-Up</a>
          </button>
          <br/>

      </form>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',

  methods:
    {
       login_s(){
          let formEl   = this.$refs.loginF;
          var path     =  "/users/login";
          var formD    = new FormData( formEl );

          var resp  = this.$store.dispatch('Login', { path, form: formD });

      }

    }

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
