function MultiOscillator (frequencies, gains, audioContext) {
  var bufferSize = 4096
  this._scriptNode = audioContext.createScriptProcessor(bufferSize, 0, 1)

  var twoPI = 2 * Math.PI
  var sampleRate = 1 / 48000

  this._scriptNode.onaudioprocess = function (event) {
    var outputBuffer = event.outputBuffer

    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var outputData = outputBuffer.getChannelData(channel)

      for (var i=0; i < outputData.length; i++) {
        outputData[i] = 0
      }

      // TODO: Utilize GPU
      frequencies.forEach((freq, index) => {
        var time = event.playbackTime
        for (var i=0; i < bufferSize; i++) {
          outputData[i] += gains[index]*Math.sin(twoPI * freq * time)
          time+=sampleRate
        }
      })
    }
  }
}

MultiOscillator.prototype.connect = function (node) {
  this._scriptNode.connect(node)
}

module.exports = MultiOscillator