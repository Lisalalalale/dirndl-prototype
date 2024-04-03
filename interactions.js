import { updateScore } from "./score-handler.js";

//references to the elements
const cursor = document.getElementById("cursor");
const cameraObject = document.getElementById("cameraObject");
const candle = document.getElementById("candleDrag");
const camera = document.getElementById("camera");
const message = document.getElementById("dom-overlay-message");
const okButton = document.getElementById("ok-button");

//list for the points and their transparent shadows
const points = [];
const pointShadows = [];

//boolean which specifies if the dragging mode for placing the candle is activated
let dragMode = false;
//if the dirndl is placed
let placed = false;
//if a collision is tracked
let hitStart = false;
//sets position out of an array
const positions = [
  [-0.0023, 1.2612, -0.1568],
  [-0.0569, 1.1339, 0.1002],
  [0.1425, 0.9722, 0.0549],
  [-0.168, 0.774, 0.035],
];

//adding point and pointShadows to the list
for (let i = 1; i < positions.length + 1; i++) {
  let annotation = document.getElementById(`point${i}`);
  let annotationShadow = document.getElementById(`point${i}shadow`);
  points.push(annotation);
  pointShadows.push(annotationShadow);
}

//annotation points get located
function makeAnnotations(positions) {
  for (let i = 1; i < positions.length + 1; i++) {
    let annotation = points[i - 1];
    let annotationShadow = pointShadows[i - 1];
    annotation.setAttribute("visible", "true");
    annotation.object3D.position.set(
      positions[i - 1][0],
      positions[i - 1][1],
      positions[i - 1][2]
    );
    annotationShadow.object3D.position.set(
      positions[i - 1][0],
      positions[i - 1][1],
      positions[i - 1][2]
    );
  }
}

//hide all annotation points
function hideAnnotations() {
  for (let i = 1; i < positions.length + 1; i++) {
    let annotation = document.getElementById(`point${i}`);
    annotation.setAttribute("visible", "false");
  }
}

//collider gets enabled
function startInteraction() {
  placed = true;
  makeAnnotations(positions);
  cursor.setAttribute("aabb-collider", {
    enabled: true,
    objects: ".space",
  });
  //if the user doesn't hit the dirndl or candle space then the user gets a hint
 setTimeout(function () {
    if (!hitStart) {
      displayNewText(
        okButton,
        message,
        "Gehe noch näher an das Dirndl oder die Kerze ran."
      );
    }
  }, 10000);
}

// enable collider and get draged candle
function endInteraction() {
  placed = false;
  endCollision(cursor);
  cursor.setAttribute("aabb-collider", {
    enabled:false,
  });
  candle.setAttribute("get-draged", {
    enabled: false,
  });
  hideAnnotations();
  hitStart = false;
}


//handles the collision with the dirndl or candle space
AFRAME.registerComponent("tracking-collision", {
  update: function () {
    this.el.addEventListener("hitstart", function (e) {
      hitStart = true;
      if (placed) {
        let component = e.target.components["aabb-collider"][
          "intersectedEls"
        ].map((x) => x.id);
        //entered candleSpace
        if (component[0] == "candleSpace") {
          enableDragging();
        }
        //entered dirndlSpace
        else {
          if (!dragMode) {
            displayNewText(
              okButton,
              message,
              "Ziele auf einen Punkt, um ihn zu aktivieren."
            );
          }
        }
        startCollision(this);
      }
    });
    this.el.addEventListener("hitend", function (e) {
      if (placed) {
        endCollision(this);
      }
    });
  },
});

//enables raycaster of the cursor and starts animation of the points
function startCollision(el) {
  el.setAttribute("raycaster", {
    enabled: true,
  });
  el.setAttribute("visible", "true");
  for (let point of points) {
    point.emit(`startAnimIn`, null, false);
  }
}

//disables raycaster of the corner and reverse animation of the points
function endCollision(el) {
  el.setAttribute("raycaster", {
    enabled: false,
  });

  el.setAttribute("visible", "false");
  for (let point of points) {
    point.emit(`startAnimOut`, null, false);
  }
}

function enableDragging() {
  candle.setAttribute("get-draged", { enabled: true });
  displayNewText(
    okButton,
    message,
    "Du kannst die Kerze aufheben und sie am Dirndl an einem bestimmten Punkt platzieren. Ziele dazu auf die Kerze und klicke anschließend auf den Bildschirm, um sie aufzuheben."
  );
}

//event listener of the points
AFRAME.registerComponent("cursor-specific-listener", {
  init() {
    let self = this.el;
    let activated = false;

    this.el.addEventListener("raycaster-intersected", function (els) {
      //starts animation to change the color if not the candle is dragged or the point is activated before
      if (!dragMode && !activated) {
        self.emit(`startAnimCol`, null, false);
      }
    });
    //the points get activated if they are not activated before
    self.addEventListener("animationcomplete", function (els) {
      if (!dragMode && !activated) {
        if (els.detail.name == "animation__color") {
          if (self.id == "point4") {
            self.setAttribute("sound", { src: "#audio1", autoplay: true });
            displayNewText(
              okButton,
              message,
              "„Juhu, du erhälst 1 Punkt! </br> […] da lernst du halt dann irgendwelche Leute kennen und das sind ja oft auch interessante Leute, weil so einen Trachtenstoffladen betreibst du ja aus Idealismus. Also. Natürlich soll das irgendwie auch umgehen [finanziell]. Aber die werden jetzt nicht gesagt haben: Da verdiene ich am meisten Geld, komm, machen wir einen Trachtenstoffladen auf. Also von dem her denkt man da dann, man lernt durch solche Aktionen, mit dem Boden oder mit dem Dirndl oder mit dem Brauen, irgendwelche Leute kennen, wo du dann sagst: Die sind an sich sehr interessante Leute.“"
            );
            
          } else {
            displayNewText(okButton, message, "Juhu, du erhältst 1 Punkt!");
          }
          setTimeout(function () {
            self.emit(`startAnimColRev`, null, false);
          }, 2000);
          activated = true;
          updateScore(1);
        }
      }
    });
  },
});

// the point shadows listen to raycaster intersection
AFRAME.registerComponent("cursor-listener", {
  init() {
    let self = this.el;
    let idSelf = self.id;
    let number = parseInt(idSelf[5]);
    //cameraObject intersects with points
    this.el.addEventListener("raycaster-intersected", function (els) {
      if (els.detail.el.id == "cameraObject") {
        //intersects with the right point

        if (self.id == "point1shadow") {
          points[0].setAttribute("material", {
            color: "green",
          });
          candle.setAttribute("position", self.getAttribute("position"));
          document.addEventListener("touchstart", makeVisible, { once: true });

          displayNewText(
            okButton,
            message,
            "Super, du hast den richtigen Punkt gefunden. Lege die Kerze hier ab, indem du noch einmal klickst."
          );
          
          //disable raycasting once the rigth point is found
          cameraObject.removeAttribute("raycaster");
        } //intersects with the wrong point
        else {
          console.log(points[number-1].hasAttribute( "material","color:#A04B19"))
          points[number - 1].setAttribute("material", {
            color: "red",
          });
          displayNewText(
            okButton,
            message,
            "Leider falsch, ziele an einen anderen Punkt."
          );
          
          setTimeout(function () {
            points[number - 1].setAttribute("material", {
              color: "#A04B19",
            });
          }, 3000);
        }
      }
      //cursor interaction with a point shadow
      points[number - 1].emit(`startAnimInDouble`, null, false);
    });
    this.el.addEventListener("raycaster-intersected-cleared", function (els) {
      points[number - 1].emit(`startAnimOutDouble`, null, false);
    });
  },
});

//if candle get draged it is restored by a candle on the camera, if the candle is intersecting with a point and then click it is there
AFRAME.registerComponent("get-draged", {
  schema: {
    default: true,
  },
  update() {
    const el = this.el;
    if (this.data.enabled) {
      this.el.addEventListener(
        "raycaster-intersected",
        function (els) {
          document.addEventListener("touchstart", makeUnvisible);
        },
        { once: true }
      );
    }
  },
});

// make candle unvisible, and camera candle visible and start raycasting
function makeUnvisible(event) {
  document.removeEventListener("touchstart", makeUnvisible);
  dragMode = true;
  displayNewText(
    okButton,
    message,
    "Bringe die Kerze zum Dirndl und ziele mit der Kerze auf die Punkte, um den richtigen Punkt zu finden."
  );
  cursor.setAttribute("visible", "false");
  candle.setAttribute("visible", "false");
  cameraObject.setAttribute("get-draged-camera", {
    enabled: true,
  });
}

//make camera candle unvisible and candle visible, task success
function makeVisible(event) {
  dragMode = false;
  
  displayNewText(okButton, message, "Juhu, du erhältst 5 Punkte!");
  cameraObject.setAttribute("get-draged-camera", {
    enabled: false,
  });
  candle.setAttribute("get-draged", {
    enabled: false,
  });
  cameraObject.setAttribute("visible", "false");
  candle.setAttribute("visible", "true");
  cursor.setAttribute("visible", "true");
  updateScore(5);
}

//start or stop raycast
AFRAME.registerComponent("get-draged-camera", {
  schema: {
    default: true,
  },
  update() {
    let el = this.el;
    if (this.data.enabled) {
      el.setAttribute("visible", "true");
      el.setAttribute("raycaster", {
        objects: ".droppable",
      });
    } else {
      el.setAttribute("visible", "false");
    }
  },
});

function displayNewText(okButton, message, text) {
  okButton.style.display = "flex";
  message.style.display = "flex";
  message.innerHTML = text;
  adjustPosition()
}
function adjustPosition() {
      var container = document.getElementById('container-message-button');
      var contentHeight = container.scrollHeight;
      var windowHeight = window.innerHeight;

      // Überprüfen, ob der Text nicht auf den Bildschirm passt
      if (contentHeight > windowHeight) {
        // Hier können Sie die Position anpassen, z.B. um 10% nach oben verschieben
        container.style.bottom = '15%';
        container.style.fontSize = '1em';
      } else {
        // Zurücksetzen auf die ursprüngliche Position
        container.style.bottom = '35%';
        container.style.fontSize = '1.3em';
      }
    }

export { startInteraction, endInteraction };
