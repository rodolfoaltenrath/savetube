<!-- App.vue -->
<script setup>
import LandingHeader from './Components/LandingHeader.vue'
import DownloadForm from './Components/DownloadForm.vue'
import TypingText from './Components/TypingText.vue'
import { i18n, t } from './i18n'
</script>

<template>
  <LandingHeader
    brand="SaveTube"
    :links="[
      {label: t('nav.home'), href:'#section_1'},
      {label: t('nav.how'), href:'#section_2'},
      {label: t('nav.terms'), href:'#termos-e-condicoes'},
    ]"
    :isAuthenticated="false"
    homeHref="/"
    loginHref="/login"
    logoutHref="/logout"
  >
    <!-- conteúdo principal dentro do novo layout -->
    <section id="section_1" class="mx-auto max-w-4xl px-4 pt-8 pb-16">
      <h1 class="text-4xl font-extrabold text-center">
        <TypingText
          :fullText="i18n.lang==='en' ? 'Explore. Get. Enjoy.' : 'Explore. Obtenha. Desfrute!'"
          :holdDelay="5000"
          :sequence="[t('hero.sequence.0'), t('hero.sequence.1'), t('hero.sequence.2')]"
          :betweenDelay="600"
          :finalHold="5000"
        />
      </h1>
      <p class="text-slate-500 dark:text-slate-300 mt-2 text-center">{{ t('hero.subtitle') }}</p>

      <div class="mt-6">
        <DownloadForm />
      </div>
    </section>

    <!-- Tutorial: 3 cards -->
    <section id="section_2" class="mx-auto max-w-5xl px-4 pb-16">
      <div class="grid md:grid-cols-3 gap-6 items-stretch">
        <div class="glass-card p-5 h-full flex flex-col border-sky-300/50 shadow-[0_0_0_1px_rgba(56,189,248,.40),_0_14px_34px_-18px_rgba(56,189,248,.35)]">
          <div class="w-full text-center">
            <h3 class="mb-1 text-white text-lg md:text-xl font-bold inline-block">{{ t('cards.1.title') }}</h3>
            <div class="terms-pipe mb-2 mx-auto"><span class="bar"></span></div>
          </div>
          <p class="text-slate-600 dark:text-slate-300">{{ t('cards.1.desc') }}</p>
          <img :src="'/static/images/img1.png'" alt="Passo 1" class="rounded-lg mt-auto w-full" />
        </div>

        <div class="glass-card p-5 h-full flex flex-col border-sky-300/50 shadow-[0_0_0_1px_rgba(56,189,248,.40),_0_14px_34px_-18px_rgba(56,189,248,.35)]">
          <div class="w-full text-center">
            <h3 class="mb-1 text-white text-lg md:text-xl font-bold inline-block"><span>{{ t('cards.2.title') }}</span></h3>
            <div class="terms-pipe mb-2 mx-auto"><span class="bar"></span></div>
          </div>
          <p class="text-slate-600 dark:text-slate-300">{{ t('cards.2.desc') }}</p>
          <img :src="'/static/images/img2.png'" alt="Passo 2" class="rounded-lg mt-auto w-full" />
        </div>

        <div class="glass-card p-5 h-full flex flex-col border-sky-300/50 shadow-[0_0_0_1px_rgba(56,189,248,.40),_0_14px_34px_-18px_rgba(56,189,248,.35)]">
          <div class="w-full text-center">
            <h3 class="mb-1 text-white text-lg md:text-xl font-bold inline-block">{{ t('cards.3.title') }}</h3>
            <div class="terms-pipe mb-2 mx-auto"><span class="bar"></span></div>
          </div>
          <p class="text-slate-600 dark:text-slate-300">{{ t('cards.3.desc') }}</p>
          <img :src="'/static/images/img3.png'" alt="Passo 3" class="rounded-lg mt-auto w-full" />
        </div>
      </div>
    </section>

    <!-- Termos e Condições de Uso -->
    <section id="termos-e-condicoes" class="mx-auto max-w-5xl px-4 pb-20">
      <div class="glass-card p-6 md:p-8 border-sky-300/50 shadow-[0_0_0_1px_rgba(56,189,248,.40),_0_14px_34px_-18px_rgba(56,189,248,.35)]">
        <div class="terms-title inline-block">
          <h2 class="text-2xl font-bold mb-2 inline-block">{{ t('terms.title') }}</h2>
          <div class="terms-pipe mt-2">
            <span class="bar"></span>
          </div>
        </div>

        <div v-if="i18n.lang==='pt'" class="space-y-4 text-slate-700 dark:text-slate-200">
          <div>
            <h3 class="font-semibold">1. Aceitação dos Termos</h3>
          </div>

          <div>
            <h3 class="font-semibold">2. Serviços Oferecidos</h3>
            <p>SaveTube fornece uma ferramenta online que permite aos usuários baixar vídeos do YouTube em formato .MP3 ou .MP4. Estes Serviços são oferecidos gratuitamente, mas estão sujeitos às leis de direitos autorais e outras regulamentações.</p>
          </div>

          <div>
            <h3 class="font-semibold">3. Conformidade com Leis de Direitos Autorais</h3>
            <p>Você concorda em utilizar o SaveTube em conformidade com todas as leis e regulamentações aplicáveis. Em particular, Você reconhece que:</p>
            <ul class="list-disc pl-5 mt-2">
              <li>O conteúdo disponível para download no YouTube é protegido por direitos autorais e outros direitos de propriedade intelectual.</li>
              <li>Você é responsável por garantir que qualquer conteúdo baixado via SaveTube seja usado apenas para fins pessoais e não comerciais.</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">4. Limitação de Uso</h3>
            <ul class="list-disc pl-5">
              <li>Você não deve utilizar SaveTube para distribuir, modificar, transmitir, reutilizar, reenviar ou utilizar o conteúdo para fins comerciais sem a devida autorização do proprietário dos direitos autorais.</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">5. Isenção de Responsabilidade</h3>
            <ul class="list-disc pl-5">
              <li>não garantimos a disponibilidade contínua e ininterrupta do nosso serviço, e não nos responsabilizamos por qualquer perda de dados ou outras falhas técnicas.</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">6. Alterações aos Termos</h3>
          </div>

          <div>
            <h3 class="font-semibold">7. Política de Privacidade</h3>
            <p>Para informações sobre como coletamos, usamos e protegemos seus dados pessoais, por favor, consulte nossa Política de Privacidade.</p>
          </div>

          <div>
            <h3 class="font-semibold">8. Contato</h3>
            <p>Se Você tiver qualquer dúvida sobre estes Termos e Condições, entre em contato conosco atravàs da página de Contato.</p>
          </div>
        </div>
        <div v-else class="space-y-4 text-slate-200">
          <div>
            <h3 class="font-semibold">1. Acceptance of Terms</h3>
            <p>Welcome to SaveTube! By using our platform, you agree to the following Terms and Conditions. Please read carefully before proceeding.</p>
          </div>

          <div>
            <h3 class="font-semibold">2. Services Provided</h3>
            <p>SaveTube provides an online tool that allows users to download YouTube videos in .MP3 or .MP4 format. These services are offered free of charge, but are subject to copyright laws and other regulations.</p>
          </div>

          <div>
            <h3 class="font-semibold">3. Copyright Compliance</h3>
            <p>You agree to use SaveTube in compliance with all applicable laws and regulations. In particular, you acknowledge that:</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Content available on YouTube is protected by copyright and other intellectual property rights.</li>
              <li>You are responsible for ensuring that any content downloaded via SaveTube is used only for personal, non-commercial purposes.</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">4. Limitation of Use</h3>
            <ul class="list-disc pl-5">
              <li>You must not use SaveTube to distribute, modify, transmit, reuse, resend, or otherwise use content for commercial purposes without the copyright owneràs authorization.</li>
              <li>Using our platform to infringe copyrights or engage in any illegal activity is strictly prohibited.</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">5. Disclaimer</h3>
            <ul class="list-disc pl-5">
              <li>SaveTube is not responsible for any copyright violation committed by users of the platform.</li>
              <li>We do not guarantee continuous and uninterrupted availability of the service, and we are not liable for any data loss or other technical failures.</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">6. Changes to the Terms</h3>
            <p>SaveTube reserves the right to modify these Terms and Conditions at any time. Any changes will be published on this page and, by continuing to use the platform, you agree to the modified Terms.</p>
          </div>

          <div>
            <h3 class="font-semibold">7. Privacy Policy</h3>
            <p>For information on how we collect, use, and protect your personal data, please refer to our Privacy Policy.</p>
          </div>

          <div>
            <h3 class="font-semibold">8. Contact</h3>
            <p>If you have any questions about these Terms and Conditions, please contact us through the Contact page.</p>
          </div>
        </div>
      </div>
    </section>

    
  </LandingHeader>
</template>

<style scoped>
.terms-pipe {
  position: relative;
  height: 2px; /* mais fina */
  border-radius: 999px;
  overflow: hidden;
}
.terms-pipe::before { display: none; }
.terms-pipe .bar {
  position: relative;
  display: block;
  height: 100%;
  width: 100%;
  border-radius: inherit;
  background: #1a4196; /* azul estático */
}


</style>

