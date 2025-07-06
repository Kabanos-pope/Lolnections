let allItems   = [];
let currentItems = [];
let selected     = [];

const grid          = document.getElementById("grid");
const message       = document.getElementById("message");
const Submitbutton  = document.getElementById("Submit-btn");
const Deselectbutton= document.getElementById("Deselect-btn");   

fetch("Groups-LoLnections.json")
  .then(res => res.json())
  .then(data => {

    const groupMap = {};
    data.forEach(item => {
      if (!groupMap[item.group]) groupMap[item.group] = [];
      if (groupMap[item.group].length < 4) {
        groupMap[item.group].push(item);
      }
    });
  
    allItems = Object.values(groupMap).flat();
    prepareBoard();
  })
  .catch(err => {
    console.error(err);
    message.textContent = "Failed to load items. Please try again later.";
  });

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomGroup(items) {
  const groups = [...new Set(items.map(i => i.group))];
  return groups[Math.floor(Math.random() * groups.length)];
}

function prepareBoard() {
  if (allItems.length < 4) {
    message.textContent = "Game over! No more complete groups left. GG!";
    return;
  }

  const correctGroup = getRandomGroup(allItems);
  const inGroup      = allItems.filter(i => i.group === correctGroup);
  const outGroup     = allItems.filter(i => i.group !== correctGroup);


  if (inGroup.length < 4) {
    allItems = allItems.filter(i => i.group !== correctGroup);
    return prepareBoard();
  }


  const correctSet   = shuffle(inGroup).slice(0, 4);
  const incorrectSet = shuffle(outGroup).slice(0, 12);

  currentItems = shuffle([...correctSet, ...incorrectSet]);
  renderGrid(currentItems, correctGroup);
}

function renderGrid(items, correctGroup) {
  grid.innerHTML = "";
  selected = [];
  grid.dataset.correctGroup = correctGroup;
  message.textContent = "";

  items.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = item.name;
    div.onclick = () => toggleSelect(idx, div);
    grid.appendChild(div);
  });
}

function toggleSelect(idx, elt) {
  if (selected.includes(idx)) {
    selected = selected.filter(i => i !== idx);
    elt.classList.remove("selected");
  } else if (selected.length < 4) {
    selected.push(idx);
    elt.classList.add("selected");
  }
}

Submitbutton.onclick = () => {
  if (selected.length !== 4) {
    message.textContent = "Please select exactly 4 items.";
    return;
  }

  const correctGroup = grid.dataset.correctGroup;
  const pickedGroups = selected.map(i => currentItems[i].group);
  const allMatch     = pickedGroups.every(g => g === correctGroup);

  if (allMatch) {
    message.textContent = `🎉 Correct! Those were the 4 from “${correctGroup}”.`;

    const names = selected.map(i => currentItems[i].name);
    allItems = allItems.filter(i =>
      !(i.group === correctGroup && names.includes(i.name))
    );
    prepareBoard();
  } else {
    message.textContent = "❌ Nope—those aren’t all from the same group.";
    selected.forEach(i => grid.children[i].classList.remove("selected"));
    selected = [];
  }
};

Deselectbutton.onclick = () => {
  selected.forEach(i => grid.children[i].classList.remove("selected"));
  selected = [];
};
