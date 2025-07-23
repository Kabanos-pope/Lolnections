let allItems = [];
let currentItems = [];
let selected = [];
let allowedGroups = [];
let foundGroups = [];

const grid = document.getElementById("grid");
const message = document.getElementById("message");
const win_message = document.getElementById("win_message");
const pengu_win = document.getElementById("pengu_win");
const pengu_win2 = document.getElementById("pengu_win2");
const Submitbutton = document.getElementById("Submit-btn");
const Deselectbutton = document.getElementById("Deselect-btn");

fetch("Groups-LoLnections.json")
  .then(res => res.json())
  .then(data => {
    const allGroups = [...new Set(data.map(item => item.group))];
    let availableGroups = shuffle([...allGroups]);
    const groupMap = {};
    const usedNames = new Set();
    allowedGroups = [];

    
    while (allowedGroups.length < 4 && availableGroups.length > 0) {
      const group = availableGroups.shift();
      const candidates = shuffle(
        data.filter(item => item.group === group && !usedNames.has(item.name))
      );
      const groupItems = [];
      for (const item of candidates) {
        if (groupItems.length < 4 && !usedNames.has(item.name)) {
          groupItems.push(item);
        }
      }
      if (groupItems.length === 4) {
        groupItems.forEach(item => usedNames.add(item.name));
        groupMap[group] = groupItems;
        allowedGroups.push(group);
      }
    }

    if (allowedGroups.length < 4) {
      message.textContent = "Not enough groups with 4 unique items each!";
      return;
    }

    allItems = Object.values(groupMap).flat();
    currentItems = shuffle([...allItems]);
    renderGrid(currentItems);
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

function renderGrid(items) {
  grid.innerHTML = "";
  selected = [];
  message.textContent = "";

  items.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "item";

    
    const img = document.createElement("img");
    img.src = item.icon; 
    img.alt = item.name;
    img.style.width = "64px";  
    img.style.height = "64px";
    div.appendChild(img);

    if (foundGroups.includes(item.group)) {
      div.classList.add("correct");
    } else {
      div.onclick = () => toggleSelect(idx, div);
    }

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

  const pickedItems = selected.map(i => currentItems[i]);
  const pickedGroups = pickedItems.map(item => item.group);
  const firstGroup = pickedGroups[0];
  const allSameGroup = pickedGroups.every(g => g === firstGroup);

  if (allSameGroup && !foundGroups.includes(firstGroup)) {
    message.textContent = `🎉 Correct! Group: "${firstGroup}"`;

   
    selected.forEach(i => {
      grid.children[i].classList.add("correct");
      grid.children[i].classList.remove("selected");
      grid.children[i].onclick = null;
    });

    foundGroups.push(firstGroup);
    selected.forEach(i => grid.children[i].style.visibility = 'hidden');

    if (foundGroups.length === 4) {
      win_message.style.display = "flex";
      grid.style.display = "none";
      buttons.style.display = "none";
    }
  } else {
    message.textContent = "❌ Incorrect! Try again.";
    selected.forEach(i => grid.children[i].classList.remove("selected"));
  }

  selected = [];
};

Deselectbutton.onclick = () => {
  selected.forEach(i => grid.children[i].classList.remove("selected"));
  selected = [];
};
