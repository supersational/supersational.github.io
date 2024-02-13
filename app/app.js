let vTimeout = null;
let vGap = 100;
let vDuration = 60;
const vibrate = (cents) => {
  console.log('vibrate', cents, vTimeout)

  // goes from -40 to 40
  if (cents === undefined) {
    navigator.vibrate(0);
    if (vTimeout) {
      clearTimeout(vTimeout);
      vTimeout = null;
    }
  } else {
    // calculate the duration and gap from cents
    vGap = Math.abs(cents) * 5; // so 200ms gap for 40 cents
    if (cents < 0) {
      vDuration = 60 ;
    } else {
      vDuration = 100;
    }
    if (vTimeout === null) {
      vInterval();
    }
  }
}

const vInterval = () => {
  vTimeout = setTimeout(vInterval, vDuration + vGap);
  if (navigator.vibrate && app.vibrateOnC) {
    console.log([vDuration, vGap])
    navigator.vibrate([vDuration, vGap]);
  }
}

const Application = function () {
  this.initA4();
  this.tuner = new Tuner(this.a4);
  this.notes = new Notes(".notes", this.tuner);
  this.meter = new Meter(".meter");
  this.frequencyBars = new FrequencyBars(".frequency-bars");
  this.update({
    name: "A",
    frequency: this.a4,
    octave: 4,
    value: 69,
    cents: 0,
  });
};

Application.prototype.initA4 = function () {
  this.$a4 = document.querySelector(".a4");
  this.$a4.addEventListener("click", function () {
    document.body.requestFullscreen();
  })
  // this.$a4 = document.querySelector(".a4 span");
  this.a4 = parseInt(localStorage.getItem("a4")) || 440;
  // this.$a4.innerHTML = this.a4;

};

Application.prototype.start = function () {
  const self = this;

  this.tuner.onNoteDetected = function (note) {
    self.pitch = note.frequency;
    // console.log('note', note)
    if (self.notes.isAutoMode) {
      if (self.lastNote === note.name) {
        self.update(note);
      } else {
        self.lastNote = note.name;
      }
    }

    if (self.vibrateOnC && note.name === "C") {
      vibrate(note.cents);
    } else {
      vibrate();
    }
  };

  // swal.fire("Welcome to online tuner!").then(function () {
  swal.fire({title:"Needs microphone permission to tune",
  showDenyButton: true,
  showCancelButton: true,
  confirmButtonText: "Vibrate on C",
  denyButtonText:"Don't vibrate"}).then(function (result) {
  // document.addEventListener('click', () => {
    console.log(result)
    self.tuner.init();
    self.frequencyData = new Uint8Array(self.tuner.analyser.frequencyBinCount);
    if (result.isConfirmed) {
      self.vibrateOnC = true;
      document.querySelector(".vibrate input").checked = true;
    } else {
      self.vibrateOnC = false;
      document.querySelector(".vibrate input").checked = false;
    }
  // }, { once: true, capture: false, passive: true });
  });

  // this.$a4.addEventListener("click", function () {
  //   swal
  //     .fire({ input: "number", inputValue: self.a4 })
  //     .then(function ({ value: a4 }) {
  //       if (!parseInt(a4) || a4 === self.a4) {
  //         return;
  //       }
  //       self.a4 = a4;
  //       self.$a4.innerHTML = a4;
  //       self.tuner.middleA = a4;
  //       self.notes.createNotes();
  //       self.update({
  //         name: "A",
  //         frequency: self.a4,
  //         octave: 4,
  //         value: 69,
  //         cents: 0,
  //       });
  //       localStorage.setItem("a4", a4);
  //     });
  // });

  this.updateFrequencyBars();

  document.querySelector(".auto input").addEventListener("change", () => {
    this.notes.toggleAutoMode();
  });

  document.querySelector(".vibrate input").addEventListener("change", (e) => {
    this.vibrateOnC = e.target.checked;
  });
};


Application.prototype.updateFrequencyBars = function () {
  if (this.tuner.analyser) {
    this.tuner.analyser.getByteFrequencyData(this.frequencyData);
    this.frequencyBars.update(this.frequencyData, this.pitch);
  }
  requestAnimationFrame(this.updateFrequencyBars.bind(this));
};

Application.prototype.update = function (note) {
  this.notes.update(note);
  this.meter.update((note.cents / 50) * 45);
};

const app = new Application();
app.start();
