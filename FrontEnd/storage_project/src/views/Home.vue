<template>
  <div class="home">

    <LoginForm v-if="(!user )"></LoginForm>
    <div v-if="( user && user.email)" class="body_logged">
      <nav id="nav" class='container-fluid'>

        <div class="nPanel col-xs-12 col-sm-12 col-md-7 col-lg-7">
        </div>


        <div class="col-xs-2 col-sm-2 col-md-1 col-lg-1">
          <button @click.prevent="logOut" class="logOut" type="submit" name="logout" >Logout</button>
        </div>

      </nav>
      <WorckingArea/>
      <FooterActions/>
    </div>

  </div>
</template>

<script>
// @ is an alias to /src
import LoginForm     from '@/components/LoginForm.vue';
import WorckingArea  from '@/components/WorckingArea.vue';
import FooterActions from '@/components/Footer.vue'

export default {
  name: 'Home',
  components: {
    LoginForm: LoginForm,
    WorckingArea,
    FooterActions
  },

  data()
    {
      return this.$store.state
    },
  created()
    {
      this.$store.dispatch('checkUserSession');
    },
  methods:
    {
      logOut(){
        this.$store.dispatch('checkUserSession', '/users/logOut' )
      }
    }

}
</script>
