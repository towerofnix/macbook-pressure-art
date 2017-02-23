'use strict'

{
  const canvas = document.getElementById('debug-canvas')

  let force = 0

  canvas.addEventListener('webkitmouseforcechanged', evt => {
    force = Math.round(evt.webkitForce * 100) / 100

    forceAmounts.push(force)
  })

  let forceAmounts = []

  const draw = function() {
    if (forceAmounts.length > canvas.width / 2) {
      forceAmounts = forceAmounts.slice(canvas.width / -2)
    }

    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < forceAmounts.length; x++) {
      const force = forceAmounts[x] * canvas.height / 4

      ctx.fillStyle = 'red'
      ctx.fillRect(x * 2, (canvas.height - force) / 2, 2, force)
    }

    ctx.fillStyle = 'black'
    ctx.fillText(`Force: ${force}`, 10, 20)

    requestAnimationFrame(draw)
  }

  draw()
}











{
  const overlay = document.getElementById('info-overlay')
  const box = document.getElementById('info')
  const button = document.getElementById('info-button')
  const hideButton = document.getElementById('hide-info')
  const debugButton = document.getElementById('toggle-debug')

  const showInfo = function() {
    box.classList.add('shown')
    overlay.classList.add('shown')
  }

  const hideInfo = function() {
    box.classList.remove('shown')
    overlay.classList.remove('shown')
  }

  const toggleDebug = function() {
    document.getElementById('debug-canvas').classList.toggle('shown')
    hideInfo()
  }
  
  button.addEventListener('click', showInfo)
  overlay.addEventListener('click', hideInfo)
  hideButton.addEventListener('click', hideInfo)
  debugButton.addEventListener('click', toggleDebug)
}





{
  const canvas = document.getElementById('art-canvas')

  let brushSize = 80

  let force = 0
  let pForce = 0

  let pMouseX = null
  let pMouseY = null

  const updateBrushSize = () => {
    brushSize = Math.max(1, parseInt(sizeControl.value))
  }

  const sizeControl = document.getElementById('size-control')
  sizeControl.addEventListener('input', updateBrushSize)
  sizeControl.value = brushSize

  const canvasPos = evt => {
    const canvasBox = canvas.getBoundingClientRect()

    return [
      (evt.clientX - canvasBox.left) * window.devicePixelRatio,
      (evt.clientY - canvasBox.top) * window.devicePixelRatio
    ]
  }

  const draw = evt => {
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = `rgba(0, 0, 0, 1)`

    const [ mouseX, mouseY ] = canvasPos(evt)
    const size = (
      (brushSize + brushSize * (force - 2)) * window.devicePixelRatio
    )

    // When the pressure is released, force will become less than zero.
    // Obviously that shouldn't be drawn! (It'll throw an error if we
    // do try to draw a negative-radius arc.)
    if (size <= 0) return

    const detail = 100
    const deltaX = (mouseX - pMouseX)
    const deltaY = (mouseY - pMouseY)
    const slopeX = deltaX / detail
    const slopeY = deltaY / detail

    ctx.fillStyle = '#222'
    ctx.beginPath()
    for (let i = 0; i < detail; i++) {
      const x = pMouseX + slopeX * i
      const y = pMouseY + slopeY * i

      ctx.arc(x, y, size / 2, 0, 2 * Math.PI)
    }
    ctx.fill()
  }

  canvas.addEventListener('webkitmouseforcechanged', evt => {
    force = evt.webkitForce

    draw(evt)
  })

  canvas.addEventListener('mousemove', evt => {
    if (force > 1) {
      draw(evt)
    }

    [ pMouseX, pMouseY ] = canvasPos(evt)
    pForce = force
  })

  const updateSize = () => {
    const ctx = canvas.getContext('2d')

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const dpr = window.devicePixelRatio

    if (canvas.width / dpr < window.innerWidth)
      canvas.width = window.innerWidth * dpr
    if (canvas.height / dpr < window.innerHeight)
      canvas.height = window.innerHeight * dpr

    canvas.style.width = (canvas.width / dpr) + 'px'
    canvas.style.height = (canvas.height / dpr) + 'px'

    ctx.putImageData(data, 0, 0)
  }

  window.addEventListener('resize', updateSize)

  updateSize()
}
