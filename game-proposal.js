const memoryDemo = document.querySelector("[data-memory-demo]");

if (memoryDemo) {
  const objectButtons = Array.from(
    memoryDemo.querySelectorAll("[data-memory-object]"),
  );
  const locations = Array.from(
    memoryDemo.querySelectorAll("[data-memory-location]"),
  );
  const status = memoryDemo.querySelector("[data-memory-status]");
  const soundToggle = memoryDemo.querySelector("[data-sound-toggle]");
  const resetButton = memoryDemo.querySelector("[data-memory-reset]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const objectNames = {
    photo: "Photograph",
    rabbit: "Rabbit",
    trophy: "Trophy",
  };

  let selectedObject = null;
  let completed = 0;
  let soundEnabled = false;
  let audioContext = null;

  function setStatus(message) {
    status.textContent = `${message} Memory ${completed} of ${objectButtons.length}.`;
  }

  function selectObject(objectName) {
    const button = objectButtons.find(
      (item) => item.dataset.memoryObject === objectName && !item.hidden,
    );

    if (!button) return;

    selectedObject = objectName;
    objectButtons.forEach((item) => {
      item.setAttribute(
        "aria-pressed",
        String(item.dataset.memoryObject === selectedObject),
      );
    });
    memoryDemo.classList.add("has-selection");
    setStatus(`${objectNames[objectName]} selected. Choose a location.`);
  }

  function ensureAudioContext() {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioContext = new AudioContext();
    }

    if (audioContext?.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTone(frequencies, duration = 0.42) {
    if (!soundEnabled) return;

    const context = ensureAudioContext();
    if (!context) return;

    const start = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    gain.connect(context.destination);

    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.detune.setValueAtTime(index * 4, start);
      oscillator.connect(gain);
      oscillator.start(start + index * 0.035);
      oscillator.stop(start + duration);
    });
  }

  function clearSelection() {
    selectedObject = null;
    objectButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    memoryDemo.classList.remove("has-selection");
  }

  function placeSelectedObject(location) {
    if (!selectedObject) {
      setStatus("Select a displaced object first.");
      return;
    }

    const selectedButton = objectButtons.find(
      (item) => item.dataset.memoryObject === selectedObject,
    );
    const expectedLocation = selectedButton.dataset.memoryTarget;
    const locationName = location.dataset.memoryLocation;

    if (expectedLocation !== locationName) {
      location.classList.remove("is-wrong");
      void location.offsetWidth;
      location.classList.add("is-wrong");
      window.setTimeout(() => location.classList.remove("is-wrong"), 520);
      playTone([188, 174], 0.5);
      setStatus(`${objectNames[selectedObject]} does not feel right there. Try again.`);
      return;
    }

    const placedLabel = location.querySelector(".memory-location__placed");
    location.classList.add("is-correct");
    location.setAttribute("aria-disabled", "true");
    location.removeAttribute("tabindex");
    placedLabel.textContent = objectNames[selectedObject];
    placedLabel.removeAttribute("aria-hidden");
    selectedButton.hidden = true;
    completed += 1;
    playTone([294 + completed * 36, 440 + completed * 42]);

    const placedName = objectNames[selectedObject];
    clearSelection();

    if (completed === objectButtons.length) {
      memoryDemo.classList.add("is-complete");
      setStatus(
        `${placedName} returned. The room settles, but one detail still feels wrong.`,
      );
    } else {
      setStatus(`${placedName} returned to its remembered location.`);
    }
  }

  objectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectObject(button.dataset.memoryObject);
    });

    button.addEventListener("dragstart", (event) => {
      selectObject(button.dataset.memoryObject);
      event.dataTransfer.setData("text/plain", button.dataset.memoryObject);
      event.dataTransfer.effectAllowed = "move";
    });
  });

  locations.forEach((location) => {
    location.addEventListener("click", () => {
      if (!location.classList.contains("is-correct")) placeSelectedObject(location);
    });

    location.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!location.classList.contains("is-correct")) placeSelectedObject(location);
      }
    });

    location.addEventListener("dragover", (event) => {
      if (!location.classList.contains("is-correct")) event.preventDefault();
    });

    location.addEventListener("drop", (event) => {
      event.preventDefault();
      const draggedObject = event.dataTransfer.getData("text/plain");
      if (draggedObject) selectObject(draggedObject);
      if (!location.classList.contains("is-correct")) placeSelectedObject(location);
    });
  });

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.textContent = soundEnabled ? "Sound on" : "Sound off";

    if (soundEnabled) {
      playTone([330, 440], 0.3);
      setStatus("Sound feedback is on. Select an object to continue.");
    } else {
      setStatus("Sound feedback is off. Select an object to continue.");
    }
  });

  resetButton.addEventListener("click", () => {
    completed = 0;
    clearSelection();
    memoryDemo.classList.remove("is-complete");
    objectButtons.forEach((button) => {
      button.hidden = false;
      button.setAttribute("aria-pressed", "false");
    });
    locations.forEach((location) => {
      location.classList.remove("is-correct", "is-wrong");
      location.removeAttribute("aria-disabled");
      location.setAttribute("tabindex", "0");
      const placedLabel = location.querySelector(".memory-location__placed");
      placedLabel.textContent = "";
      placedLabel.setAttribute("aria-hidden", "true");
    });
    setStatus("Select an object to begin.");
  });

  reducedMotion.addEventListener("change", () => {
    memoryDemo.classList.toggle("reduce-motion", reducedMotion.matches);
  });
  memoryDemo.classList.toggle("reduce-motion", reducedMotion.matches);
}
