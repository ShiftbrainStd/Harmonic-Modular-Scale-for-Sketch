declare module 'sketch/dom' {
  interface Layer {
    id: string
  }

  interface Group extends Layer {
    type: 'Group'
    layers: (Group | Text)[]
  }

  interface Style {
    fontSize: number
    lineHeight: number | null
    getDefaultLineHeight(): number
  }

  interface Text extends Layer {
    type: 'Text'
    style: Style
  }

  interface Selection {
    layers: (Group | Text)[]
  }

  interface Document {
    selectedLayers: Selection
  }

  export const Types: {
    Group: 'Group'
    Text: 'Text'
  }

  export function getSelectedDocument(): Document | undefined
}

declare module 'sketch/settings' {
  export function settingForKey(key: string): any | undefined

  export function setSettingForKey(
    key: string,
    value: any | undefined,
  ): undefined

  export function documentSettingForKey(
    document: any,
    key: string,
  ): any | undefined

  export function setDocumentSettingForKey(
    document: any,
    key: string,
    value: any | undefined,
  ): undefined
}

declare module 'sketch/ui' {
  export function getTheme(): 'light' | 'dark'
}

declare module 'sketch-module-web-view'
declare module 'sketch-module-web-view/remote'
