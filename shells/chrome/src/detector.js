import { installToast } from 'src/backend/toast'
import { isFirefox } from 'src/devtools/env'

window.addEventListener('message', e => {
  if (e.source === window && e.data.vueDetected) {
    chrome.runtime.sendMessage(e.data)
  }
})

function detect (win) {
  setTimeout(() => {
    const all = document.querySelectorAll('*')
    let el
    for (let i = 0; i < all.length; i++) {
      if (all[i].__vue__) {
        el = all[i]
        break
      }
    }
    if (el) {
      let Vue = Object.getPrototypeOf(el.__vue__).constructor
      while (Vue.super) {
        Vue = Vue.super
      }
      win.postMessage({
        devtoolsEnabled: Vue.config.devtools,
        vueDetected: true
      }, '*')
    }
  }, 100)
}

// inject the hook
if (document instanceof HTMLDocument) {
  installScript(detect)
  installScript(installToast)
}

function installScript (fn) {
  const source = ';(' + fn.toString() + ')(window)'

  if (isFirefox) {
    /* eslint-disable no-eval */
    window.eval(source) // in Firefox, this evaluates on the content window
    /* eslint-enable no-eval */
  } else {
    const script = document.createElement('script')
    script.textContent = source
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
  }
}
