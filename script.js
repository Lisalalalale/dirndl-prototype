import{startInteraction, endInteraction} from "./interactions.js"

//sets position out of an array
let positions = [[-0.0023, 1.2612, -0.1568],
                 [-0.0569, 1.1339, 0.1002],
                 [0.1425, 0.9722, 0.0549],
                 [-0.168, 0.774, 0.035]]
function makeAnnotations(positions){

  
  for (let i=1; i < positions.length+1;  i++){
    let annotation = document.getElementById(`point${i}`)
        annotation.setAttribute("fulfil", "")

    annotation.setAttribute("position", (positions[i]))
   
    
  }
}

          

//hide 3d objects in AR while placing them
AFRAME.registerComponent("hide-on-hit-test-start", {
  init: function (){
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
    })
  }
})

function preventClicks(e) {
  e.preventDefault();
}

// handling the DOM-Overlay
window.addEventListener("DOMContentLoaded", function () {
  const sceneEl = document.querySelector("a-scene")
  const message = document.getElementById("dom-overlay-message")
  const exitButton = document.getElementById("exit-AR-button")
  const placeButton = document.getElementById("place-button")
  const container = document.getElementById("container-message-button")
  const score = document.getElementById("score-container")
  const closeButton = document.getElementById("close-button")
  
  let placed = false
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
  
  closeButton.addEventListener("click", function() {
    message.style.display = "none"
    this.style.display = "none"
  })
  
  //toggles between placing and interaction
  placeButton.addEventListener("click", function() {
   if(!placed){
     startInteraction()
     displayNewText(closeButton, message, "Interagiere nun mit dem Objekt, indem du dich in die Nähe des Objekts bewegst und auf Punkte zielst. Oder hebe einen Gegenstand auf. <br />Wenn du auf den Pause-Button klickst, kannst du das Objekt neu platzieren.")
      sceneEl.setAttribute("ar-hit-test", {
      enabled: false,
    })
     this.style.backgroundImage = "url(https://cdn.glitch.global/1b4d9e9e-59c4-40a2-bb38-376de613510a/hand.gemacht%20WebApp%20pause%20perlweiss.svg?v=1700642681717)"
     
   }
    else{
      endInteraction()
      sceneEl.setAttribute("ar-hit-test", {
        enabled:true,
      })
           this.style.backgroundImage = "url(https://cdn.glitch.global/1b4d9e9e-59c4-40a2-bb38-376de613510a/hand.gemacht%20WebApp%20play%20perlweiss.svg?v=1700642682124)"

      displayNewText(closeButton, message, `Klicke auf eine Stelle, um das Objekt zu platzieren .<br /> Wenn du mit deiner Positionierung zufrieden bist, klicken auf den Button links.` )
    }
    placed = !placed
  })
  
  sceneEl.addEventListener("enter-vr", function () {
    if (this.is("ar-mode")) {
      // Entered AR
      this.setAttribute("ar-hit-test", {
        enabled:true,
        target:"#container",
        type:"footprint",
      })
      score.style.display= "flex"
      message.textContent = "";
      container.style.background = "#FAF0E6"
      exitButton.style.display = "block"

      // Hit testing is available
      this.addEventListener(
        "ar-hit-test-start",
        function () {
          displayNewText(closeButton, message, `Die Umgebung wird gescannt, bewege die Kamera langsam entlang einer Fläche.`)
        },
        { once: true }
      );

      // Has managed to start doing hit testing
      this.addEventListener(
        "ar-hit-test-achieved",
        function () {
          displayNewText(closeButton, message,`Klicke auf eine Stelle, um das Objekt zu platzieren .<br /> Wenn du mit deiner Positionierung zufrieden bist, klicke auf den Play-Button.`)
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
    displayNewText(closeButton, message,"AR-Mode wurde verlassen")
    container.style.background = "#9B969155"
    endInteraction()
    exitButton.style.display = "none"
    placeButton.style.display = "none"
    placeButton.style.backgroundImage = "url(https://cdn.glitch.global/1b4d9e9e-59c4-40a2-bb38-376de613510a/hand.gemacht%20WebApp%20play%20perlweiss.svg?v=1700642682124)"
    score.style.display = "none"
    placed = false
    
    
  })

});

function displayNewText(closeButton, message, text){
  closeButton.style.display = "flex"
  message.style.display = "flex"
  message.innerHTML = text
}

