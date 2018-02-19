/* globals window, document */

var getusermedia = require('getusermedia')
var hilbert = require('hilbert-2d')

function Synesthesia() {
  getusermedia({ video: { facingMode: "environment" }, audio: false }, (err, stream) => {
    if (err) {
      window.alert('Could not access camera. You may have an outdated browser!')
      throw err
    }
    this._onStream(stream)
  })
}

Synesthesia.prototype._onStream = function (stream) {
  var inputVideo = document.createElement('video')
  inputVideo.autoplay = true
  inputVideo.srcObject = stream
  inputVideo.muted = true
  inputVideo.playsinline = true
  inputVideo.setAttribute('muted', true)
  inputVideo.setAttribute('playsinline', true)
  inputVideo.play()

  // wait for width and height metadata
  inputVideo.addEventListener('loadedmetadata', () => {
    var canvas = document.createElement('canvas')

    canvas.width = inputVideo.videoWidth
    canvas.height = inputVideo.videoHeight
    canvas.id = 'videocanvas'
    document.body.appendChild(canvas)

    var ctx = canvas.getContext('2d')
    var audioCtx = window.audioContext

    // average data into lower-resolution cells
    var order = 4
    var cellCount = 2 ** (order - 1)
    var totalCells = cellCount * cellCount
    var cellWidth = canvas.width / cellCount
    var cellHeight = canvas.height / cellCount

    var masterGain = audioCtx.createGain()
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0)
    masterGain.gain.setTargetAtTime(0.1, audioCtx.currentTime, 3)
    masterGain.connect(audioCtx.destination)

    // intialize frequency oscilliators (that's fun to say...)
    var freqRange = [270, 900]
    var freqInterval = (freqRange[1] - freqRange[0]) / totalCells
    var gains = []
    for (var i = 0; i < totalCells; i++) {
      var gainNode = audioCtx.createGain()
      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02)
      gainNode.connect(masterGain)
      gains[i] = gainNode

      var osc = audioCtx.createOscillator()
      osc = audioCtx.createOscillator()
      osc.frequency.setValueAtTime(freqRange[1] - i * freqInterval, audioCtx.currentTime, 0.02) // value in hertz
      osc.start()
      osc.connect(gainNode)
    }

    function draw() {
      // draw video to canvas
      ctx.drawImage(inputVideo, 0, 0, canvas.width, canvas.height)

      // TODO: Utilize GPU
      for (var x = 0; x < cellCount; x++) {
        for (var y = 0; y < cellCount; y++) {
          var pixels = ctx.getImageData(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
          var sum = 0
          for (var i = 0; i < pixels.data.length; i += 4) {
            sum += (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3
          }
          var average = sum / (cellWidth * cellHeight)
          for (var i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i] = average
            pixels.data[i + 1] = average
            pixels.data[i + 2] = average
          }
          var index = Math.floor(hilbert.encode(order, [x, y])) // map to 1D
          var newGain = Math.max(average / 255, 0.0001)
          var gainNode = gains[index]
          gainNode.gain.exponentialRampToValueAtTime(newGain, audioCtx.currentTime + 0.01)
          ctx.putImageData(pixels, x * cellWidth, y * cellHeight)
        }
      }
      window.requestAnimationFrame(draw.bind(this))
    }
    window.requestAnimationFrame(draw.bind(this))
  })
}

module.exports = Synesthesia