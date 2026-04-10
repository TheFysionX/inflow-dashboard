self.addEventListener('message', (event) => {
  if (event.data?.type !== 'load') {
    return
  }

  fetch('/demo-data.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to load demo dataset.')
      }

      return response.json()
    })
    .then((dataset) => {
      self.postMessage({
        type: 'loaded',
        dataset,
      })
    })
})
