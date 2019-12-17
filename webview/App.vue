<template>
  <div class="app-grid">
    <div class="value">
      <label>
        <input type="checkbox" v-model="settings.autoNormalizes" /> Normalize
        automatically
      </label>
    </div>

    <div class="full" :hidden="!hasTextLayers">
      <hr />
    </div>

    <div class="key" :hidden="!hasTextLayers">Font size degree:</div>

    <div class="value" :hidden="!hasTextLayers">
      <div style="display: flex; align-items: center;">
        <input
          type="range"
          :value="roundDecimal(fontSizeDegree)"
          :max="maxFontSizeDegree"
          :min="minFontSizeDegree"
          list="fontSizeDegree-marks"
          style="flex-grow: 1"
          aria-label="Font size degree"
          @input="fontSizeDegree = Number($event.target.value)"
        />

        <datalist id="fontSizeDegree-marks">
          <option
            :value="minFontSizeDegree"
            :label="minFontSizeDegree"
          ></option>
          <option value="0" label="0"></option>
          <option
            :value="maxFontSizeDegree"
            :label="maxFontSizeDegree"
          ></option>
        </datalist>

        <FontSizeDegreeInput
          :sourceValue="fontSizeDegree"
          :max="maxFontSizeDegree"
          :min="minFontSizeDegree"
          :placeholder="fontSizeDegreePlaceHolder"
          autofocus
          style="flex-shrink: 0; margin-left: 8px"
          aria-label="Font size degree"
          :changeSource="(value) => (fontSizeDegree = value)"
          :autoNormalizes="settings.autoNormalizes"
        />
      </div>
    </div>

    <div
      class="value"
      :hidden="!hasTextLayers"
      style="margin-top: 4px"
      :style="includesDifferentFontSize && 'visibility: hidden'"
    >
      <div class="text-formula">
        {{ roundDecimal(computedFontSize) }}px =
        {{ settings.scaleFactor }}
        / (
        {{ settings.scaleFactor }}
        {{ fontSizeDegree < 0 ? '+' : '-' }}
        <mark>{{ Math.abs(roundDecimal(fontSizeDegree)) }}</mark>
        ) *
        {{ settings.baseFontSize }}px
      </div>
    </div>

    <div class="key" :hidden="!hasTextLayers">Line height degree:</div>

    <div class="value" :hidden="!hasTextLayers">
      <div style="display: flex; align-items: center;">
        <input
          type="range"
          :value="lineHeightDegree"
          :max="maxLineHeightDegree"
          min="0"
          style="flex-grow: 1"
          @input="lineHeightDegree = Number($event.target.value)"
        />
        <span style="width: 70px;margin-left:16px">{{ lineHeightDegree }}</span>
      </div>
    </div>

    <div
      class="value"
      :hidden="!hasTextLayers"
      style="margin-top: 4px"
      :style="includesDifferentTextStyle && 'visibility: hidden'"
    >
      <div class="text-formula">
        {{ roundDecimal(computedLineHeight) }}px = ( ceil(
        {{ roundDecimal(computedFontSize) }}px / {{ settings.lineHeightUnit }}px
        ) +
        <mark>{{ roundDecimal(lineHeightDegree) }}</mark>
        ) *
        {{ settings.lineHeightUnit }}px
      </div>
    </div>

    <div class="full">
      <hr />
    </div>

    <div class="key">Scale factor:</div>

    <div class="value">
      <NumberInput
        :sourceValue="settings.scaleFactor"
        :max="16"
        :min="4"
        aria-label="Scale factor"
        :changeSource="(value) => (settings.scaleFactor = value)"
      />
    </div>

    <div class="key">Base font size:</div>

    <div class="value">
      <NumberInput
        :sourceValue="settings.baseFontSize"
        :max="24"
        :min="12"
        :changeSource="(value) => (settings.baseFontSize = value)"
        aria-label="Base font size"
      />
      <!--  -->
      px
    </div>

    <div class="key">Line height unit:</div>

    <div class="value">
      <NumberInput
        :sourceValue="settings.lineHeightUnit"
        :max="8"
        :min="2"
        step="2"
        :changeSource="(value) => (settings.lineHeightUnit = value)"
        aria-label="Line height unit"
      />
      <!--  -->
      px
    </div>
  </div>
</template>

<script lang="ts">
import { computed, watch, createComponent, Ref } from '@vue/composition-api'
import isEqual from 'lodash/isEqual'
import { AppTextLayer, AppSettings } from '../types'
import { clamp, roundDecimal, roundBy } from './number'
import NumberInput from './NumberInput.vue'
import FontSizeDegreeInput from './FontSizeDegreeInput.vue'

const calculateFontSize = (
  baseFontSize: number,
  scaleFactor: number,
  fontSizeDegree: number,
) => {
  const ratio = scaleFactor / (scaleFactor - fontSizeDegree)
  return ratio * baseFontSize
}

const calculateFontSizeDegree = (
  baseFontSize: number,
  scaleFactor: number,
  fontSize: number,
) => {
  const ratio = fontSize / baseFontSize
  return scaleFactor - scaleFactor / ratio
}

const normalizeTextLayers = ({
  textLayers,
  baseFontSize,
  scaleFactor,
  maxFontSizeDegree,
  minFontSizeDegree,
  lineHeightUnit,
}: {
  textLayers: AppTextLayer[]
  baseFontSize: number
  scaleFactor: number
  maxFontSizeDegree: number
  minFontSizeDegree: number
  lineHeightUnit: number
}) => {
  return textLayers.map((textLayer) => {
    const fontSizeDegree = calculateFontSizeDegree(
      baseFontSize,
      scaleFactor,
      textLayer.fontSize.value,
    )
    const normalizedFontSizeDegree = clamp(
      Math.round(fontSizeDegree),
      maxFontSizeDegree,
      minFontSizeDegree,
    )
    const fontSize = {
      value: calculateFontSize(
        baseFontSize,
        scaleFactor,
        normalizedFontSizeDegree,
      ),
    }
    const lineHeight = {
      // todo: clamp
      value: roundBy(textLayer.lineHeight.value, lineHeightUnit),
      default: false,
    }

    return {
      ...textLayer,
      fontSize,
      lineHeight,
    }
  })
}

const minFontSize = 10

export default createComponent({
  props: {
    textLayers: {
      type: Object,
      required: true,
    },
    settings: {
      type: Object,
      required: true,
    },
    sendTextLayers: {
      type: Function,
      required: true,
    },
  },
  components: {
    NumberInput,
    FontSizeDegreeInput,
  },
  setup(props: {
    textLayers: Ref<AppTextLayer[]>
    settings: AppSettings
    sendTextLayers: (textLayers: AppTextLayer[]) => void
  }) {
    const hasTextLayers = computed(() => {
      return Boolean(props.textLayers.value.length)
    })

    const headTextLayer = computed(() => {
      return props.textLayers.value[0]
    })

    const includesDifferentFontSize = computed(() => {
      return props.textLayers.value.slice(1).some((textLayer) => {
        return !isEqual(textLayer.fontSize, headTextLayer.value.fontSize)
      })
    })

    const fontSizeDegree = computed({
      get: () => {
        if (!hasTextLayers.value) {
          return
        }

        if (includesDifferentFontSize.value) {
          return
        }

        return calculateFontSizeDegree(
          props.settings.baseFontSize,
          props.settings.scaleFactor,
          headTextLayer.value.fontSize.value,
        )
      },
      set: (newFontSizeDegree) => {
        if (typeof newFontSizeDegree !== 'number') {
          return
        }

        const computedFontSize = calculateFontSize(
          props.settings.baseFontSize,
          props.settings.scaleFactor,
          newFontSizeDegree,
        )
        const newTextLayers = props.textLayers.value.map((textLayer) => {
          return {
            ...textLayer,
            fontSize: {
              value: computedFontSize,
            },
          }
        })

        props.textLayers.value = newTextLayers
        props.sendTextLayers(newTextLayers)
      },
    })

    const maxFontSizeDegree = computed(() => {
      return props.settings.scaleFactor - 1
    })

    const minFontSizeDegree = computed(() => {
      let fontSizeDegree = 0
      while (
        calculateFontSize(
          props.settings.baseFontSize,
          props.settings.scaleFactor,
          --fontSizeDegree,
        ) > minFontSize
      ) {}
      return fontSizeDegree + 1
    })

    const fontSizeDegreePlaceHolder = computed(() => {
      if (!hasTextLayers.value) {
        return
      }

      if (includesDifferentFontSize.value) {
        return
      }

      return 'Multi'
    })

    const computedFontSize = computed(() => {
      if (includesDifferentFontSize.value) {
        return
      }

      return calculateFontSize(
        props.settings.baseFontSize,
        props.settings.scaleFactor,
        fontSizeDegree.value as number,
      )
    })

    const includesDifferentTextStyle = computed(() => {
      return props.textLayers.value.slice(1).some((textLayer) => {
        return !isEqual(textLayer, headTextLayer)
      })
    })

    const baseLineHeightMultiply = computed(() => {
      if (!hasTextLayers.value) {
        return
      }

      if (includesDifferentTextStyle.value) {
        return
      }

      return Math.ceil(
        (computedFontSize.value as number) / props.settings.lineHeightUnit,
      )
    })

    const lineHeightDegree = computed({
      get: () => {
        if (!hasTextLayers.value) {
          return
        }

        if (includesDifferentTextStyle.value) {
          return
        }

        const multiply =
          headTextLayer.value.lineHeight.value / props.settings.lineHeightUnit
        return multiply - (baseLineHeightMultiply.value as number)
      },
      set: (newLineHeightDegree) => {
        if (typeof newLineHeightDegree !== 'number') {
          return
        }

        const multiply =
          newLineHeightDegree + (baseLineHeightMultiply.value as number)
        const computedLineHeight = multiply * props.settings.lineHeightUnit
        const newTextLayers = props.textLayers.value.map((textLayer) => {
          return {
            ...textLayer,
            lineHeight: {
              value: computedLineHeight,
              default: false,
            },
          }
        })

        props.textLayers.value = newTextLayers
        props.sendTextLayers(newTextLayers)
      },
    })

    const maxLineHeightDegree = computed(() => {
      if (!hasTextLayers.value) {
        return
      }

      if (includesDifferentTextStyle.value) {
        return
      }

      const maxRelativeLineHeight = 2
      const multiply = Math.ceil(
        ((computedFontSize.value as number) * maxRelativeLineHeight) /
          props.settings.lineHeightUnit,
      )
      return multiply - (baseLineHeightMultiply.value as number)
    })

    const computedLineHeight = computed(() => {
      if (!hasTextLayers.value) {
        return
      }

      if (includesDifferentTextStyle.value) {
        return
      }

      return (
        ((lineHeightDegree.value as number) +
          (baseLineHeightMultiply.value as number)) *
        props.settings.lineHeightUnit
      )
    })

    const normalizeTextLayersIfNeeded = () => {
      if (!props.settings.autoNormalizes) {
        return
      }

      const newTextLayers = normalizeTextLayers({
        textLayers: props.textLayers.value,
        baseFontSize: props.settings.baseFontSize,
        scaleFactor: props.settings.scaleFactor,
        maxFontSizeDegree: maxFontSizeDegree.value,
        minFontSizeDegree: minFontSizeDegree.value,
        lineHeightUnit: props.settings.lineHeightUnit,
      })

      if (isEqual(props.textLayers.value, newTextLayers)) {
        return
      }

      props.textLayers.value = newTextLayers
      props.sendTextLayers(newTextLayers)
    }

    watch(() => {
      normalizeTextLayersIfNeeded()
    })

    return {
      hasTextLayers,

      includesDifferentFontSize,
      fontSizeDegree,
      maxFontSizeDegree,
      minFontSizeDegree,
      fontSizeDegreePlaceHolder,
      computedFontSize,

      includesDifferentTextStyle,
      lineHeightDegree,
      maxLineHeightDegree,
      computedLineHeight,

      roundDecimal,
    }
  },
})
</script>
