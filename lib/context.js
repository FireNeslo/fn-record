function createIframe(src, recording) {
  const height = Math.min(recording.height, recording.document.height)
  const width = Math.min(recording.width, recording.document.width)

  const iframe = document.createElement('iframe')

  iframe.src = src
  iframe.width = width
  iframe.height = height
  iframe.style.border = 0

  return {
    get requestAnimationFrame() {
      return iframe.contentWindow.requestAnimationFrame
    },
    get console() {
      return iframe.contentWindow.console
    },
    get element() {
      return iframe
    },
    get document() {
      return iframe.contentDocument
    },
    get window() {
      return iframe.contentWindow
    },
    addEventListener(...args) {
      return iframe.addEventListener(...args)
    }
  }
}

module.exports = function createContext(type='tab', recording) {
  const content = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Loading player...</title>
    </head>
    <body>
    </body>
  </html>`

  const file = new Blob([content], { type: 'text/html' })

  const url = URL.createObjectURL(file)

  if(type === 'tab') {
    return window.open(url)
  } else if(type === 'popup') {
    const height = Math.min(recording.height, recording.document.height)
    const width = Math.min(recording.width, recording.document.width)

    return window.open(url,"Loading player...",
      `width=${width},height=${height},resizable,scrollbars=yes`
    )
  } else if(type === 'iframe') {
    return createIframe(url, recording)
  }
}
