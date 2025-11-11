<!-- App.vue -->
<script setup>
import LandingHeader from './components/LandingHeader.vue'
</script>

<template>
  <LandingHeader
    brand="SaveTube"
    :links="[
      {label:'Início', href:'#section_1'},
      {label:'Como usar', href:'/como_usar'},
      {label:'Termos', href:'/termos-e-condicoes'},
      {label:'Contato', href:'/contato'},
    ]"
    :isAuthenticated="false"
    homeHref="/"
    loginHref="/login"
    logoutHref="/logout"
  >
    <!-- Conteúdo da sua página abaixo do header -->
    <section id="section_1" class="max-w-5xl mx-auto px-4 py-16 text-center">
      <h1 class="text-4xl font-extrabold">Explore. Obtenha. Desfrute!</h1>
      <p class="text-slate-500 dark:text-slate-300 mt-2">a plataforma mais ágil</p>
    </section>
  </LandingHeader>
</template>
<!-- App.vue -->
<script setup>
import LandingHeader from './Components/LandingHeader.vue'
import DownloadForm from './Components/DownloadForm.vue'
</script>

<template>
  <LandingHeader
    brand="SaveTube"
    :links="[
      {label:'Início', href:'#section_1'},
      {label:'Como usar', href:'/como_usar'},
      {label:'Termos', href:'/termos-e-condicoes'},
      {label:'Contato', href:'/contato'},
    ]"
    :isAuthenticated="false"
    homeHref="/"
    loginHref="/login"
    logoutHref="/logout"
  >
    <!-- Conteúdo principal dentro do novo layout -->
    <section id="section_1" class="mx-auto max-w-4xl px-4 pt-8 pb-16">
      <h1 class="text-4xl font-extrabold text-center">Explore. Obtenha. Desfrute!</h1>
      <p class="text-slate-500 dark:text-slate-300 mt-2 text-center">A plataforma mais ágil</p>

      <div class="mt-6">
        <DownloadForm />
      </div>
    </section>
  </LandingHeader>
</template>

<style scoped>
</style>
