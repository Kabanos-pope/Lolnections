let allItems = [];
let currentItems = [];
let selected = [];

const grid = document.getElementById("grid");
const message = document.getElementById("message");
const Submitbutton = document.getElementById("Submit-btn");
const Deselectbutton = document.getElementById("Deselect-btn");

fetch("Groups-LoLnections.json")
  .then(response => response.json())
  .then(data => {
    allItems = data;
    prepareBoard();
  })
  .catch(err => {
    message.textContent = "Failed to load items. Please try again later.";
    console.error(err);
  });

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getRandomGroup(items) {
  const groups = [...new Set(items.map(item => item.group))];
  const randomGroup = groups[Math.floor(Math.random() * groups.length)];
  return randomGroup;
}

function prepareBoard() {
  const correctGroup = getRandomGroup(allItems);
  const itemsInGroup = allItems.filter(item => item.group === correctGroup);
  const otherItems = allItems.filter(item => item.group !== correctGroup);

  if (itemsInGroup.length < 4) {
    message.textContent = "Not enough items in the group to play.";
    return;
  }

  const correctSet = itemsInGroup.sort(() => 0.5 - Math.random()).slice(0, 4);
  const incorrectSet = otherItems.sort(() => 0.5 - Math.random()).slice(0, 12);

  const boardItems = [...correctSet, ...incorrectSet];
  shuffle(boardItems);

  currentItems = boardItems; 
  renderGrid(boardItems, correctGroup);
}

function renderGrid(items, correctGroup) {
  grid.innerHTML = "";
  selected = [];

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = item.name;
    div.onclick = () => toggleSelect(index, div);
    grid.appendChild(div);
  });

  grid.dataset.correctGroup = correctGroup; 
}

function toggleSelect(index, element) {
  if (selected.includes(index)) {
    selected = selected.filter(i => i !== index);
    element.classList.remove("selected");
  } else if (selected.length < 4) {
    selected.push(index);
    element.classList.add("selected");
  }
}

Submitbutton.onclick = () => {
    if (selected.length !== 4) {
    message.textContent = "Please select exactly 4 items.";
    return;
    }
  
  const correctGroup = grid.dataset.correctGroup;
  const selectedGroups = selected.map(i => currentItems[i].group);

  const allCorrect = selectedGroups.every(g => g === correctGroup);

  if (allCorrect) {
    message.textContent = "Congratulations! 🎉 You found all items in the group: " + correctGroup;
    selected.forEach(i => {
      grid.children[i].style.visibility = "hidden";
    });
  } else {
    message.textContent = "Sorry, not all selected items belong to the same group. Please try again.";
  }

  selected.forEach(i => {
    grid.children[i].classList.remove("selected");
  });
  selected = [];
};

Deselectbutton.onclick = () => {
  selected.forEach(i => {
    grid.children[i].classList.remove("selected");
  });
  selected = [];
}
