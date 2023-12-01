let score = 0
const scoreField = document.getElementById("score")

function updateScore(){
  score += 1
  scoreField.textContent = score
  
}

export{updateScore}