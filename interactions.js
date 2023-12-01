import { updateScore } from "./score-handler.js";

const cursor = document.getElementById("cursor");
const cameraObject = document.getElementById("cameraObject");
const candle = document.getElementById("candleDrag");
const camera = document.getElementById("camera");
const message = document.getElementById("dom-overlay-message");
const closeButton = document.getElementById("close-button");
const points = [];
const pointShadows = [];
let dragMode = false;
//sets position out of an array
const positions = [
  [-0.0023, 1.2612, -0.1568],
  [-0.0569, 1.1339, 0.1002],
  [0.1425, 0.9722, 0.0549],
  [-0.168, 0.774, 0.035],
];

for (let i = 1; i < positions.length + 1; i++) {
  let annotation = document.getElementById(`point${i}`);
  let annotationShadow = document.getElementById(`point${i}shadow`);
  points.push(annotation);
  pointShadows.push(annotationShadow);
}

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

function hideAnnotations() {
  for (let i = 1; i < positions.length + 1; i++) {
    let annotation = document.getElementById(`point${i}`);
    annotation.setAttribute("visible", "false");
  }
}

function startInteraction() {
  makeAnnotations(positions);
  cursor.setAttribute("aabb-collider", {
    enabled: true,
  });
}

function endInteraction() {
  endCollision(cursor);
  cursor.setAttribute("aabb-collider", {
    enabled: false,
  });
  camera.setAttribute("drag-controls", {
    enabled: false,
  });
  candle.setAttribute("get-draged", {
    enabled: false,
  });
  hideAnnotations();
}

//handles the collision with the dirndl space
AFRAME.registerComponent("tracking-collision", {
  init: function () {
    this.el.addEventListener("hitstart", function (e) {
      console.log("intersected");
      let component = e.target.components["aabb-collider"][
        "intersectedEls"
      ].map((x) => x.id);
      if (component[0] == "candleSpace") {
        enableDragging();
      } else {
        for (let point of points) {
          point.emit(`startAnimIn`, null, false);
        }
        displayNewText(closeButton, message, "Ziele auf einen Punkt.");
      }
      startCollision(this);
    });
    this.el.addEventListener("hitend", function (e) {
      console.log("ending intersection");
      endCollision(this);
    });
  },
});

function startCollision(el) {
  el.setAttribute("raycaster", {
    enabled: true,
  });

  el.setAttribute("visible", "true");
}
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
    closeButton,
    message,
    "Ziele auf den Gegenstand, um ihn aufzuheben."
  );
}

AFRAME.registerComponent("cursor-specific-listener", {
  init() {
    let self = this.el;
    this.el.addEventListener("raycaster-intersected", function (els) {
      if (!dragMode) {
        self.emit(`startAnimCol`, null, false);
      }
    });
    self.addEventListener("animationcomplete", function (els) {
      if ((els.detail.name == "animation__color")) {
        if (self.id == "point4") {
          self.setAttribute("sound", { src: "#audio1", autoplay: true });
          displayNewText(
            closeButton,
            message,
            "„[…] da lernst du halt dann irgendwelche Leute kennen und das sind ja oft auch interessante Leute, weil so einen Trachtenstoffladen betreibst du ja aus Idealismus. Also. Natürlich soll das irgendwie auch umgehen [finanziell]. Aber die werden jetzt nicht gesagt haben: Da verdiene ich am meisten Geld, komm, machen wir einen Trachtenstoffladen auf. Also von dem her denkt man da dann, man lernt durch solche Aktionen, mit dem Boden oder mit dem Dirndl oder mit dem Brauen, irgendwelche Leute kennen, wo du dann sagst: Die sind an sich sehr interessante Leute.“"
          );
        } else {
          displayNewText(closeButton, message, `${self.id} wurde aktiviert.`);
        }
        setTimeout(function () {
          self.emit(`startAnimColRev`, null, false)
          
        }, 2000);
        updateScore();
      }
    });
  },
});

AFRAME.registerComponent("cursor-listener", {
  init() {
    let self = this.el;
    let idSelf = self.id;
    let number = parseInt(idSelf[5]);
    //cameraObject intersects with points
    this.el.addEventListener("raycaster-intersected", function (els) {
      if (els.detail.el.id == "cameraObject") {
        //intersects with the right point
        console.log("right point");
        if (self.id == "point1shadow") {
          points[0].setAttribute("material", {
            color: "green",
          });
          candle.setAttribute("position", self.getAttribute("position"));
          document.addEventListener("touchstart", makeVisible, { once: true });
          updateScore();
          displayNewText(
            closeButton,
            message,
            "Klicke nochmal um den Gegenstand an der Stelle zu positionieren."
          );
        } //intersects with the wrong point
        else {
          points[number - 1].setAttribute("material", {
            color: "red",
          });
          displayNewText(
            closeButton,
            message,
            "Leider falsch, versuche es an einem anderen Punkt."
          );
          setTimeout(function () {
            points[number - 1].setAttribute("material", {
              color: "#A04B19",
            });
          }, 3000);
        }
      } else {
        //cursor interaction with a point

        points[number - 1].emit(`startAnimInDouble`, null, false);
      }
    });
    this.el.addEventListener("raycaster-intersected-cleared", function (els) {
      points[number - 1].emit(`startAnimOutDouble`, null, false);
    });
  },
});
//if sphere get draged it is restored by a sphere on the camera, if this sphere is intersecting with the point and then click it is there
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
          displayNewText(
            closeButton,
            message,
            "Klicke, um den Gegenstand aufzuheben."
          );
        },
        { once: true }
      );
    } else {
      document.removeEventListener("touchstart", makeUnvisible);
      document.removeEventListener("touchend", makeVisible);
    }
  },
});
function makeUnvisible(event) {
  dragMode = true;
  displayNewText(
    closeButton,
    message,
    "Ziele mit dem Gegenstand auf den richtigen Punkt, um ihn zu zuordnen."
  );
  cursor.setAttribute("visible", false);
  candle.setAttribute("visible", "false");
  cameraObject.setAttribute("get-draged-camera", {
    enabled: true,
  });
}

function makeVisible(event) {
  dragMode = false;
  displayNewText(closeButton, message, "Super gemacht.");
  cameraObject.setAttribute("get-draged-camera", {
    enabled: false,
  });
  candle.setAttribute("get-draged", {
    enabled: false,
  });
  cameraObject.setAttribute("visible", "false");
  candle.setAttribute("visible", "true");
  cursor.setAttribute("visible", true);
  
}

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
      el.removeAttribute("raycaster");
    }
  },
});

function displayNewText(closeButton, message, text) {
  closeButton.style.display = "flex";
  message.style.display = "flex";
  message.innerHTML = text;
}

export { startInteraction, endInteraction };
