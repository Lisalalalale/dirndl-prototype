import { startInteraction, endInteraction} from "./interactions.js";


//hide 3d objects in AR while placing them
AFRAME.registerComponent("hide-on-hit-test-start", {
  init: function () {
    let self = this;
    this.el.sceneEl.addEventListener("ar-hit-test-start", function () {
      window.addEventListener("beforexrselect", preventClicks);
      self.el.object3D.visible = false;
    });
    this.el.sceneEl.addEventListener("ar-hit-test-achieved", function () {
      window.removeEventListener("beforexrselect", preventClicks);
      self.el.object3D.visible = false;
    });
    this.el.sceneEl.addEventListener("exit-vr", function () {
      self.el.object3D.visible = true;
    });
  },
});

function preventClicks(e) {
  e.preventDefault();
}

// handling the DOM-Overlay
window.addEventListener("DOMContentLoaded", function () {
  const sceneEl = document.querySelector("a-scene");
  const message = document.getElementById("dom-overlay-message");
  const exitButton = document.getElementById("exit-AR-button");
  const placeButton = document.getElementById("place-button");
  const pauseButton = document.getElementById("pause-button");
  const container = document.getElementById("container-message-button");
  const score = document.getElementById("score-container");
  const okButton = document.getElementById("ok-button");
  let interactionStarted = false;

  // makeAnnotations(positions)

  // If the user taps on any buttons or interactive elements we may add then prevent
  // Any WebXR select events from firing
  container.addEventListener("beforexrselect", (e) => {
    e.preventDefault();
  });

  //cancels the xr session
  exitButton.addEventListener("click", function () {
    sceneEl.xrSession.end();
  });

  okButton.addEventListener("click", function () {
    message.style.display = "none";
    this.style.display = "none";
  
  });

  //toggles between placing and interaction
  placeButton.addEventListener("click", function () {
    startInteraction();
    
    interactionStarted = true;
    displayNewText(
      okButton,
      message,
      "Erkunde nun die Objekte. Du kannst Punkte am Dirndl aktivieren und die Kerze an einem Punkt am Dirndl zuordnen. Dafür bekommst du Punkte.  Beginne indem du dich dem Dirndl oder der Kerze näherst. Dann folgen weitere Schritte."
    );

    sceneEl.setAttribute("ar-hit-test", {
      enabled: false,
    });
    this.style.display = "none";
    pauseButton.style.display = "flex";
  });

  pauseButton.addEventListener("click", function () {
    endInteraction();
    interactionStarted = false;
    sceneEl.setAttribute("ar-hit-test", {
      enabled: true,
    });
    placeButton.style.display = "flex";

    displayNewText(
      okButton,
      message,
      "Die Fläche wurde erkannt, du kannst das Dirndl an der passenden Stelle platzieren, indem du darauf klickst. Klicke an eine andere Stelle, um das Dirndl zu bewegen. Du solltest das Dirndl in ganzer Größe sehen. Wenn du fertig bist, klicke auf Los gehts!"
    );
  });

  sceneEl.addEventListener("enter-vr", function () {
    if (this.is("ar-mode")) {
      // Entered AR
      this.setAttribute("ar-hit-test", {
        enabled: true,
        target: "#container",
        type: "footprint",
      });
      score.style.display = "flex";
      message.textContent = "";
      container.style.background = "#FAF0E6";
      exitButton.style.display = "block";

      // Hit testing is available
      this.addEventListener(
        "ar-hit-test-start",
        function () {
          displayNewText(
            okButton,
            message,
            "Willkommen im AR-Modus! Um das Dirndl zu platzieren suche eine freie Bodenfläche und scanne diese, indem du das Gerät langsam darüber bewegst. "
          );
        },

        { once: true }
      );

      // Has managed to start doing hit testing
      this.addEventListener(
        "ar-hit-test-achieved",
        function () {
          displayNewText(
            okButton,
            message,
            "Die Fläche wurde erkannt, du kannst das Dirndl an der passenden Stelle platzieren, indem du darauf klickst. Klicke an eine andere Stelle, um das Dirndl zu bewegen. Du solltest das Dirndl in ganzer Größe sehen. Wenn du fertig bist, klicke auf Los gehts!"
          );
        },
        { once: true }
      );

      // User has placed an object
      this.addEventListener(
        "ar-hit-test-select",
        function () {
          // Object placed for the first time
          placeButton.style.display = "flex";
        },
        { once: true }
      );
    }
  });

  sceneEl.addEventListener("exit-vr", function () {
    displayNewText(okButton, message, "AR-Mode wurde verlassen");
    container.style.background = "#9B969155";
    endInteraction();
    exitButton.style.display = "none";
    placeButton.style.display = "none";
    pauseButton.style.display = "none";
    score.style.display = "none";
  });
});

function displayNewText(okButton, message, text) {
  okButton.style.display = "flex";
  message.style.display = "flex";
  message.innerHTML = text;
  
}
