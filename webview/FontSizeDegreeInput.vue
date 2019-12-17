<template>
  <input
    type="number"
    :value="userInput"
    :max="max"
    :min="min"
    required
    @input="onInput"
    @blur="onBlur"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import { createComponent, ref, watch } from '@vue/composition-api'
import { clamp, roundBy, roundDecimal } from './number'

export default createComponent({
  props: {
    sourceValue: {
      type: Number,
    },
    max: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    changeSource: {
      type: Function,
      required: true,
    },
    autoNormalizes: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { attrs }) {
    const userInput = ref('')
    let isChangedByInput = false
    let prevValidValue = 0
    let prevValidNumber = 0

    watch(
      () => props.sourceValue,
      (sourceValue) => {
        if (isChangedByInput) {
          return
        }

        userInput.value =
          sourceValue != null ? String(roundDecimal(sourceValue)) : ''
        prevValidValue = sourceValue != null ? roundDecimal(sourceValue) : 0
      },
    )

    const onInput = (event: any) => {
      userInput.value = event.target.value

      const isEmpty = event.target.value === ''
      const inputValueAsNumber = Number(event.target.value)
      const isValidNumber = !isEmpty && !Number.isNaN(inputValueAsNumber)

      if (isValidNumber) {
        props.changeSource(inputValueAsNumber)
        prevValidNumber = inputValueAsNumber
        isChangedByInput = true

        Vue.nextTick().then(() => {
          isChangedByInput = false
        })
      }

      if (event.target.checkValidity()) {
        prevValidValue = inputValueAsNumber
      }
    }

    const onBlur = (event: any) => {
      if (event.target.checkValidity()) {
        return
      }

      const isEmpty = event.target.value === ''
      const inputValueAsNumber = Number(event.target.value)
      const isValidNumber = !isEmpty && !Number.isNaN(inputValueAsNumber)
      const step = attrs.step != null ? Number(attrs.step) : 1
      const fixedValue = isValidNumber
        ? props.autoNormalizes
          ? clamp(roundBy(inputValueAsNumber, step), props.max, props.min)
          : Math.min(roundDecimal(inputValueAsNumber), props.max + 0.99)
        : props.autoNormalizes
        ? prevValidValue
        : prevValidNumber

      props.changeSource(fixedValue)
      userInput.value = String(fixedValue)
    }

    return {
      userInput,
      onInput,
      onBlur,
    }
  },
})
</script>
