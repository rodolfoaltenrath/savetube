import { reactive } from 'vue'

const state = reactive({
  lang: typeof localStorage !== 'undefined' ? (localStorage.getItem('lang') || 'pt') : 'pt',
})

function setLang(lang) {
  state.lang = lang
  try {
    localStorage.setItem('lang', lang)
    document.documentElement.setAttribute('lang', lang)
  } catch {}
}

const dict = {
  pt: {
    'nav.home': 'Início',
    'nav.how': 'Como usar',
    'nav.terms': 'Termos',

    'hero.sequence.0': 'Explore.',
    'hero.sequence.1': 'Obtenha.',
    'hero.sequence.2': 'Desfrute.',
    'hero.subtitle': 'A plataforma mais ágil',

    'cards.1.title': 'Cole o link do YouTube',
    'cards.1.desc': 'Copie o link do vídeo e cole no campo acima.',
    'cards.2.title': 'Clique em Procurar',
    'cards.2.desc': 'Abrirá um modal para escolher formato e qualidade.',
    'cards.3.title': 'Selecione e baixe',
    'cards.3.desc': 'Escolha MP3/MP4 e a qualidade desejada.',

    'form.placeholder': 'Cole o link do YouTube...',
    'form.search': 'Procurar',
    'form.downloading': 'Baixando...',
    'form.acceptPrefix': 'Aceito os',
    'form.termsLink': 'termos e condições',
    'form.validUrl': 'Informe uma URL válida.',

    'modal.title': 'Escolha o formato e a qualidade',
    'modal.audioTab': 'Áudio (MP3)',
    'modal.videoTab': 'Vídeo (MP4)',
    'modal.col.type': 'Tipo de arquivo',
    'modal.col.format': 'Formato',
    'modal.col.action': 'Ação',
    'modal.preview': 'Prévia do vídeo',
    'modal.footnote': 'Usaremos o melhor vídeo até a resolução escolhida + melhor áudio.',
    'action.download': 'Baixar',
    'action.close': 'Fechar',
    'terms.title': 'Termos e Condições de Uso',
    'footer.made': 'Feito com ❤️',
  },
  en: {
    'nav.home': 'Home',
    'nav.how': 'How to Use',
    'nav.terms': 'Terms',

    'hero.sequence.0': 'Explore.',
    'hero.sequence.1': 'Get.',
    'hero.sequence.2': 'Enjoy.',
    'hero.subtitle': 'The fastest platform',

    'cards.1.title': 'Paste the YouTube link',
    'cards.1.desc': 'Copy the video link and paste it above.',
    'cards.2.title': 'Click Search',
    'cards.2.desc': 'A modal opens to choose format and quality.',
    'cards.3.title': 'Select and download',
    'cards.3.desc': 'Choose MP3/MP4 and your desired quality.',

    'form.placeholder': 'Paste the YouTube link...',
    'form.search': 'Search',
    'form.downloading': 'Downloading...',
    'form.acceptPrefix': 'I accept the',
    'form.termsLink': 'terms and conditions',
    'form.validUrl': 'Enter a valid URL.',

    'modal.title': 'Choose format and quality',
    'modal.audioTab': 'Audio (MP3)',
    'modal.videoTab': 'Video (MP4)',
    'modal.col.type': 'File type',
    'modal.col.format': 'Format',
    'modal.col.action': 'Action',
    'modal.preview': 'Video preview',
    'modal.footnote': 'We will use the best video up to the chosen resolution + best audio.',
    'action.download': 'Download',
    'action.close': 'Close',
    'terms.title': 'Terms and Conditions of Use',
    'footer.made': 'Made with ❤️',
  }
}

function t(key) {
  return (dict[state.lang] && dict[state.lang][key]) || dict.pt[key] || key
}

export { state as i18n, setLang, t }

