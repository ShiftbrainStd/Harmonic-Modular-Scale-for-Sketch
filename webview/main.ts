import Vue from 'vue'
import VueCompositionApi, { reactive, ref, watch } from '@vue/composition-api'
import { AppTextLayer, AppSettings, AppSettingsArgs } from '../types'
import App from './App.vue'

document.addEventListener('contextmenu', (event) => {
  event.preventDefault()
})

Vue.config.productionTip = false

Vue.use(VueCompositionApi)

declare global {
  interface Window {
    onSelectTextLayers: (newTextLayers: AppTextLayer[]) => void
    onChangeSettings: (newSettings: AppSettingsArgs) => void
  }
}

const textLayers = ref<AppTextLayer[]>([])

window.onSelectTextLayers = (newTextLayers) => {
  textLayers.value = newTextLayers
}

const settings = reactive<AppSettings>({
  baseFontSize: 16,
  scaleFactor: 8,
  lineHeightUnit: 4,
  autoNormalizes: false,
})

watch(
  () => settings.baseFontSize,
  (baseFontSize) => {
    window.postMessage('set-settings', { baseFontSize } as any)
  },
  { lazy: true },
)

watch(
  () => settings.scaleFactor,
  (scaleFactor) => {
    window.postMessage('set-settings', { scaleFactor } as any)
  },
  { lazy: true },
)

watch(
  () => settings.lineHeightUnit,
  (lineHeightUnit) => {
    window.postMessage('set-settings', { lineHeightUnit } as any)
  },
  { lazy: true },
)

watch(
  () => settings.autoNormalizes,
  (autoNormalizes) => {
    window.postMessage('set-settings', { autoNormalizes } as any)
  },
  { lazy: true },
)

window.onChangeSettings = (newSettings) => {
  if (newSettings.baseFontSize != null) {
    settings.baseFontSize = newSettings.baseFontSize
  }

  if (newSettings.scaleFactor != null) {
    settings.scaleFactor = newSettings.scaleFactor
  }

  if (newSettings.lineHeightUnit != null) {
    settings.lineHeightUnit = newSettings.lineHeightUnit
  }

  if (newSettings.autoNormalizes != null) {
    settings.autoNormalizes = newSettings.autoNormalizes
  }
}

const sendTextLayers = (newTextLayers: AppTextLayer[]) => {
  window.postMessage('change-text-layers', newTextLayers as any)
}

new Vue({
  render: (h) => {
    return h(App, {
      props: {
        textLayers,
        settings,
        sendTextLayers,
      },
    })
  },
}).$mount('#app')
