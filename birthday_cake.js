document.addEventListener('DOMContentLoaded', () => {
  const clickableArea = document.getElementById('clickable-area');
  const cakeContainer = document.getElementById('cake-container');
  const ageInput = document.getElementById('age-input');
  let candleCount = 0;
  const maxCandles = 50; // Maximum number of candles

  clickableArea.addEventListener('click', function(event) {
    if (candleCount < maxCandles) {
      const offsetX = event.offsetX - cakeContainer.offsetLeft;
      const offsetY = event.offsetY - cakeContainer.offsetTop;
      if (offsetX > 0 && offsetX < cakeContainer.offsetWidth && offsetY > 0 && offsetY < cakeContainer.offsetHeight) {
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.style.left = `${offsetX}px`;
        candle.style.bottom = '100px'; // Position on top of the cake
        cakeContainer.appendChild(candle);
        candleCount++;
        ageInput.value = parseInt(ageInput.value) + 1 || 1;
      }
    }
  });

  // Check for browser API support
  if (!navigator.mediaDevices || !window.AudioContext) {
    alert('Your browser does not support the necessary audio APIs.');
    return;
  }

  let audioContext = new AudioContext();
  let analyser = audioContext.createAnalyser();
  let microphone;
  let scriptProcessor;

  // Remove a candle function
  function removeCandle() {
    if (cakeContainer.children.length > 0 && candleCount > 0) {
      cakeContainer.removeChild(cakeContainer.lastChild);
      candleCount--;
      ageInput.value = parseInt(ageInput.value) - 1;
    }
  }

  // Handle the audio processing event
  function processAudio(event) {
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let values = 0;

    let length = array.length;
    for (let i = 0; i < length; i++) {
      values += (array[i]);
    }

    let average = values / length;

    // Blow detected based on the volume average
    if (average > 60) { // You may need to adjust this threshold based on testing
      removeCandle();
    }
  }

  // Get access to the microphone
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
      microphone = audioContext.createMediaStreamSource(stream);
      scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      // Connect the script processor
      scriptProcessor.connect(audioContext.destination);
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);

      // Start processing
      scriptProcessor.onaudioprocess = processAudio;
    })
    .catch((err) => {
      alert('Error accessing the microphone: ' + err.message);
    });
});
