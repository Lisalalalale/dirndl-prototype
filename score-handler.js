let score = 0;
const scoreField = document.getElementById("score");
const okButton = document.getElementById("ok-button");
const message = document.getElementById("dom-overlay-message");

function updateScore(num) {
  score += num;
  scoreField.textContent = `${score}/9`;
  if (score == 9) {
    okButton.style.display = "flex";
    message.style.display = "flex";
    message.innerHTML =
      "Prima, du hast alle Punkte gesammelt. Verlasse den AR-Modus und lade die Seite neu, um die Anwendung erneut zu starten.";
  }
}

export { updateScore };
