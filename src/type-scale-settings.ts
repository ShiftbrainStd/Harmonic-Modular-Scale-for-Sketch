import sketch, { Text, Group } from 'sketch/dom'
import Settings from 'sketch/settings'
import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import * as pkg from '../package.json'
import { AppTextLayer, AppSettingsArgs } from '../types'

const webviewIdentifier = `${pkg.name}.webview`

const extractTextLayers = (rootLayers: (Group | Text)[]): Text[] => {
  const textLayers: Text[] = []

  const traverse = (layers: (Group | Text)[]) => {
    layers.forEach((layer) => {
      switch (layer.type) {
        case sketch.Types.Text: {
          textLayers.push(layer)
          break
        }

        case sketch.Types.Group: {
          traverse(layer.layers)
          break
        }
      }
    })
  }
  traverse(rootLayers)

  return textLayers
}

const getSelectedSketchTextLayers = (): Text[] => {
  const document = sketch.getSelectedDocument()
  if (!document) {
    return []
  }
  return extractTextLayers(document.selectedLayers.layers)
}

const sendTextLayers = (sketchTextLayers: Text[]) => {
  const textLayers: AppTextLayer[] = sketchTextLayers.map((textLayer) => {
    return {
      id: textLayer.id,
      fontSize: {
        value: textLayer.style.fontSize,
      },
      lineHeight: {
        value:
          textLayer.style.lineHeight == null
            ? textLayer.style.getDefaultLineHeight()
            : textLayer.style.lineHeight,
        default: textLayer.style.lineHeight == null,
      },
    }
  })

  const webview = getWebview(webviewIdentifier)

  if (webview) {
    webview.webContents
      .executeJavaScript(`onSelectTextLayers(${JSON.stringify(textLayers)})`)
      .catch(console.error)
  }
}

const sendSettings = () => {
  const document = sketch.getSelectedDocument()

  const settings: AppSettingsArgs = {
    baseFontSize: Settings.documentSettingForKey(
      document,
      `${pkg.name}.baseFontSize`,
    ),
    scaleFactor: Settings.documentSettingForKey(
      document,
      `${pkg.name}.scaleFactor`,
    ),
    lineHeightUnit: Settings.documentSettingForKey(
      document,
      `${pkg.name}.lineHeightUnit`,
    ),
    autoNormalizes: Settings.settingForKey('autoNormalizes'),
  }

  const webview = getWebview(webviewIdentifier)

  if (webview) {
    webview.webContents
      .executeJavaScript(`onChangeSettings(${JSON.stringify(settings)})`)
      .catch(console.error)
  }
}

export default () => {
  const browserWindow = new BrowserWindow({
    identifier: webviewIdentifier,
    width: 520,
    height: 355,
    hidesOnDeactivate: process.env.NODE_ENV === 'production',
    remembersWindowFrame: true,
    alwaysOnTop: true,
    acceptsFirstMouse: true,
  })

  browserWindow.once('ready-to-show', () => {
    sendSettings()
    sendTextLayers(getSelectedSketchTextLayers())
    browserWindow.show()
  })

  const { webContents } = browserWindow
  const document = sketch.getSelectedDocument()

  webContents.on('change-text-layers', (textLayers: AppTextLayer[]) => {
    const sketchTextLayers = getSelectedSketchTextLayers()
    textLayers.forEach((textLayer) => {
      const sketchTextLayer = sketchTextLayers.find((sketchTextLayer) => {
        return sketchTextLayer.id === textLayer.id
      })
      if (!sketchTextLayer) {
        return
      }

      if (textLayer.fontSize.value !== sketchTextLayer.style.fontSize) {
        sketchTextLayer.style.fontSize = textLayer.fontSize.value
      }

      if (textLayer.lineHeight.value !== sketchTextLayer.style.lineHeight) {
        sketchTextLayer.style.lineHeight = textLayer.lineHeight.value
      }
    })
  })

  webContents.on('set-settings', (settings: AppSettingsArgs) => {
    if (settings.baseFontSize != null) {
      Settings.setDocumentSettingForKey(
        document,
        `${pkg.name}.baseFontSize`,
        settings.baseFontSize,
      )
    }

    if (settings.scaleFactor != null) {
      Settings.setDocumentSettingForKey(
        document,
        `${pkg.name}.scaleFactor`,
        settings.scaleFactor,
      )
    }

    if (settings.lineHeightUnit != null) {
      Settings.setDocumentSettingForKey(
        document,
        `${pkg.name}.lineHeightUnit`,
        settings.lineHeightUnit,
      )
    }

    if (settings.autoNormalizes != null) {
      Settings.setSettingForKey('autoNormalizes', settings.autoNormalizes)
    }
  })

  browserWindow.loadURL(require('../resources/webview.html'))
}

export const onSelectionChanged = () => {
  sendTextLayers(getSelectedSketchTextLayers())
}

export const onShutdown = () => {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}
