import Vue from 'vue'
import VueCompositionApi, { reactive, ref } from '@vue/composition-api'
import { shallowMount } from '@vue/test-utils'
import App from '../App.vue'
import { AppTextLayer, AppSettings, AppSettingsArgs } from '../../types'

beforeAll(() => {
  Vue.config.productionTip = false
  Vue.use(VueCompositionApi)
})

const noop = () => {}

const createTextLayers = (value: AppTextLayer[] = []) => {
  return ref<AppTextLayer[]>(value)
}

const createSettings = ({
  baseFontSize = 16,
  scaleFactor = 8,
  lineHeightUnit = 4,
  autoNormalizes = false,
}: AppSettingsArgs = {}) => {
  return reactive<AppSettings>({
    baseFontSize,
    scaleFactor,
    lineHeightUnit,
    autoNormalizes,
  })
}

it('renders correctly', async () => {
  const textLayers = createTextLayers()
  const settings = createSettings()
  const wrapper = shallowMount(App, {
    propsData: {
      textLayers,
      settings,
      sendTextLayers: noop,
    },
  })
  expect(wrapper.element).toMatchSnapshot()
})

describe('text layers', () => {
  it('should have a value for input', () => {
    const textLayers = createTextLayers([
      {
        id: '',
        fontSize: {
          value: 16,
        },
        lineHeight: {
          value: 24,
          default: false,
        },
      },
      {
        id: '',
        fontSize: {
          value: 16,
        },
        lineHeight: {
          value: 24,
          default: false,
        },
      },
    ])
    const settings = createSettings()
    const wrapper = shallowMount(App, {
      propsData: {
        textLayers,
        settings,
        sendTextLayers: noop,
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should have a placeholder for input', () => {
    const textLayers = createTextLayers([
      {
        id: '',
        fontSize: {
          value: 16,
        },
        lineHeight: {
          value: 24,
          default: false,
        },
      },
      {
        id: '',
        fontSize: {
          value: 20,
        },
        lineHeight: {
          value: 24,
          default: false,
        },
      },
    ])
    const settings = createSettings()
    const wrapper = shallowMount(App, {
      propsData: {
        textLayers,
        settings,
        sendTextLayers: noop,
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
