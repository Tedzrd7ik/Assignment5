const items = [
  { id: 1, name: "Intel Core i5-13400F", category: "CPU", price: 220, watts: 65, socket: "LGA1700", tags: ["intel", "mid"] },
  { id: 2, name: "AMD Ryzen 5 7600", category: "CPU", price: 230, watts: 65, socket: "AM5", tags: ["amd", "mid"] },
  { id: 3, name: "Intel Core i7-13700K", category: "CPU", price: 380, watts: 125, socket: "LGA1700", tags: ["intel", "high"] },
  { id: 4, name: "AMD Ryzen 7 7800X3D", category: "CPU", price: 420, watts: 120, socket: "AM5", tags: ["amd", "high"] },
  { id: 5, name: "MSI B760 Gaming", category: "Motherboard", price: 160, watts: 0, socket: "LGA1700", tags: ["msi", "mid"] },
  { id: 6, name: "ASUS TUF B650", category: "Motherboard", price: 190, watts: 0, socket: "AM5", tags: ["asus", "mid"] },
  { id: 7, name: "Gigabyte Z790 Aorus", category: "Motherboard", price: 280, watts: 0, socket: "LGA1700", tags: ["gigabyte", "high"] },
  { id: 8, name: "MSI MAG X670E", category: "Motherboard", price: 320, watts: 0, socket: "AM5", tags: ["msi", "high"] },
  { id: 9, name: "Corsair Vengeance 16GB", category: "RAM", price: 55, watts: 0, socket: "any", tags: ["corsair", "ddr5"] },
  { id: 10, name: "G.Skill Trident Z5 32GB", category: "RAM", price: 110, watts: 0, socket: "any", tags: ["gskill", "ddr5"] },
  { id: 11, name: "Kingston Fury 64GB", category: "RAM", price: 210, watts: 0, socket: "any", tags: ["kingston", "ddr5"] },
  { id: 12, name: "NVIDIA RTX 4060", category: "GPU", price: 300, watts: 115, socket: "any", tags: ["nvidia", "mid"] },
  { id: 13, name: "AMD RX 7600", category: "GPU", price: 270, watts: 165, socket: "any", tags: ["amd", "mid"] },
  { id: 14, name: "NVIDIA RTX 4070 Super", category: "GPU", price: 600, watts: 220, socket: "any", tags: ["nvidia", "high"] },
  { id: 15, name: "Samsung 980 1TB", category: "Storage", price: 80, watts: 0, socket: "any", tags: ["samsung", "nvme"] },
  { id: 16, name: "WD Black SN850X 2TB", category: "Storage", price: 160, watts: 0, socket: "any", tags: ["wd", "nvme"] },
  { id: 17, name: "Corsair RM650", category: "PSU", price: 90, watts: 650, socket: "any", tags: ["corsair", "bronze"] },
  { id: 18, name: "Seasonic Focus GX-850", category: "PSU", price: 140, watts: 850, socket: "any", tags: ["seasonic", "gold"] },
  { id: 19, name: "be quiet! Dark Power 1200", category: "PSU", price: 250, watts: 1200, socket: "any", tags: ["bequiet", "platinum"] },
  { id: 20, name: "Fractal Meshify C", category: "Case", price: 100, watts: 0, socket: "any", tags: ["fractal", "mid"] },
  { id: 21, name: "Lian Li O11 Dynamic", category: "Case", price: 150, watts: 0, socket: "any", tags: ["lianli", "high"] }
];

const categoriesOrder = ["CPU", "Motherboard", "RAM", "GPU", "Storage", "PSU", "Case"];

let selected = {};
let budget = 1500;
let savedBuilds = [];
let searchQuery = "";
let filterCategory = "all";

const categoriesEl = document.getElementById("categories");
const summaryList = document.getElementById("summary-list");
const totalPriceEl = document.getElementById("total-price");
const budgetInput = document.getElementById("budget");
const budgetMsg = document.getElementById("budget-msg");
const conflictMsg = document.getElementById("conflict-msg");
const btnSave = document.getElementById("btn-save");
const savedList = document.getElementById("saved-list");
const savedBuildsTitle = document.querySelector("#saved-builds h4");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter-category");
const emptySearch = document.getElementById("empty-search");

function getCategories() {
  const set = new Set(items.map(function (i) { return i.category; }));
  return categoriesOrder.filter(function (c) { return set.has(c); });
}

function calcTotal() {
  let total = 0;
  for (let i = 0; i < categoriesOrder.length; i++) {
    const cat = categoriesOrder[i];
    if (selected[cat]) {
      total += selected[cat].price;
    }
  }
  return total;
}

function calcPowerDraw() {
  let draw = 0;
  for (let i = 0; i < categoriesOrder.length; i++) {
    const cat = categoriesOrder[i];
    if (selected[cat] && selected[cat].watts && cat !== "PSU") {
      draw += selected[cat].watts;
    }
  }
  return draw;
}

function getSocketConflict() {
  const cpu = selected["CPU"];
  const mobo = selected["Motherboard"];
  if (cpu && mobo && cpu.socket !== "any" && mobo.socket !== "any" && cpu.socket !== mobo.socket) {
    return "CPU socket (" + cpu.socket + ") does not match motherboard (" + mobo.socket + ")";
  }
  return null;
}

function getPsuConflict() {
  const psu = selected["PSU"];
  if (!psu) return null;
  const draw = calcPowerDraw();
  if (draw > 0 && psu.watts < draw * 1.2) {
    return "PSU wattage (" + psu.watts + "W) is too low for system draw (~" + draw + "W). Need at least " + Math.ceil(draw * 1.2) + "W";
  }
  return null;
}

function isItemCompatible(item) {
  if (item.category === "Motherboard" && selected["CPU"]) {
    const cpu = selected["CPU"];
    if (cpu.socket !== "any" && item.socket !== "any" && cpu.socket !== item.socket) {
      return false;
    }
  }
  if (item.category === "CPU" && selected["Motherboard"]) {
    const mobo = selected["Motherboard"];
    if (mobo.socket !== "any" && item.socket !== "any" && mobo.socket !== item.socket) {
      return false;
    }
  }
  if (item.category === "PSU") {
    const draw = calcPowerDraw();
    if (draw > 0 && item.watts < draw * 1.2) {
      return false;
    }
  }
  return true;
}

function getIncompatibilityReason(item) {
  if (item.category === "Motherboard" && selected["CPU"]) {
    const cpu = selected["CPU"];
    if (cpu.socket !== "any" && item.socket !== "any" && cpu.socket !== item.socket) {
      return "Incompatible socket with selected CPU";
    }
  }
  if (item.category === "CPU" && selected["Motherboard"]) {
    const mobo = selected["Motherboard"];
    if (mobo.socket !== "any" && item.socket !== "any" && mobo.socket !== item.socket) {
      return "Incompatible socket with selected motherboard";
    }
  }
  if (item.category === "PSU") {
    const draw = calcPowerDraw();
    if (draw > 0 && item.watts < draw * 1.2) {
      return "Insufficient wattage for current build";
    }
  }
  return "";
}

function render() {
  const cats = getCategories();
  categoriesEl.innerHTML = "";

  let anyVisible = false;

  for (let c = 0; c < cats.length; c++) {
    const cat = cats[c];
    if (filterCategory !== "all" && filterCategory !== cat) continue;

    const catItems = items.filter(function (item) {
      if (item.category !== cat) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay = (item.name + " " + item.tags.join(" ")).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (catItems.length === 0) continue;
    anyVisible = true;

    const section = document.createElement("div");
    section.className = "category";

    const title = document.createElement("div");
    title.className = "category-title";
    title.textContent = cat;
    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "item-list";

    for (let i = 0; i < catItems.length; i++) {
      const item = catItems[i];
      const compatible = isItemCompatible(item);
      const isSelected = selected[cat] && selected[cat].id === item.id;

      const el = document.createElement("div");
      el.className = "item";
      if (isSelected) el.classList.add("selected");
      if (!compatible && !isSelected) el.classList.add("disabled");
      el.dataset.id = String(item.id);

      const info = document.createElement("div");
      info.className = "info";

      const name = document.createElement("div");
      name.className = "name";
      name.textContent = item.name;
      info.appendChild(name);

      const desc = document.createElement("div");
      desc.className = "desc";
      let extra = item.socket !== "any" ? "Socket: " + item.socket : "";
      if (item.watts && item.category !== "PSU") extra += (extra ? " · " : "") + item.watts + "W";
      if (item.category === "PSU") extra = item.watts + "W";
      desc.textContent = extra || item.tags.join(", ");
      info.appendChild(desc);

      if (!compatible && !isSelected) {
        const reason = document.createElement("div");
        reason.className = "desc";
        reason.style.color = "var(--danger)";
        reason.textContent = getIncompatibilityReason(item);
        info.appendChild(reason);
      }

      el.appendChild(info);

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = "$" + item.price;
      el.appendChild(price);

      list.appendChild(el);
    }

    section.appendChild(list);
    categoriesEl.appendChild(section);
  }

  if (!anyVisible) {
    emptySearch.classList.remove("hidden");
  } else {
    emptySearch.classList.add("hidden");
  }

  summaryList.innerHTML = "";
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const li = document.createElement("li");
    const left = document.createElement("span");
    left.textContent = cat;
    const right = document.createElement("span");
    if (selected[cat]) {
      right.textContent = selected[cat].name + " ($" + selected[cat].price + ")";
    } else {
      right.textContent = "—";
      right.style.color = "var(--text-muted)";
    }
    li.appendChild(left);
    li.appendChild(right);
    summaryList.appendChild(li);
  }

  const total = calcTotal();
  totalPriceEl.textContent = "$" + total;

  if (total > budget) {
    budgetMsg.textContent = "Over budget by $" + (total - budget);
    budgetMsg.className = "status error";
    budgetMsg.classList.remove("hidden");
  } else if (total > 0) {
    budgetMsg.textContent = "Within budget ($" + (budget - total) + " left)";
    budgetMsg.className = "status success";
    budgetMsg.classList.remove("hidden");
  } else {
    budgetMsg.classList.add("hidden");
  }

  const socketConflict = getSocketConflict();
  const psuConflict = getPsuConflict();
  if (socketConflict) {
    conflictMsg.textContent = socketConflict;
    conflictMsg.classList.remove("hidden");
  } else if (psuConflict) {
    conflictMsg.textContent = psuConflict;
    conflictMsg.classList.remove("hidden");
  } else {
    conflictMsg.classList.add("hidden");
  }

  const hasAll = cats.every(function (c) { return selected[c]; });
  const noConflict = !socketConflict && !psuConflict;
  const withinBudget = total <= budget;
  btnSave.disabled = !(hasAll && noConflict && withinBudget && savedBuilds.length < 3);

  savedBuildsTitle.textContent = "Saved Builds (" + savedBuilds.length + "/3)";
  savedList.innerHTML = "";
  for (let i = 0; i < savedBuilds.length; i++) {
    const b = savedBuilds[i];
    const div = document.createElement("div");
    div.className = "build-item";
    const text = document.createElement("span");
    text.textContent = "Build #" + (i + 1) + " – $" + b.total;
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-danger";
    del.type = "button";
    del.textContent = "Remove";
    del.dataset.index = String(i);
    div.appendChild(text);
    div.appendChild(del);
    savedList.appendChild(div);
  }
}

function selectItem(item) {
  if (!isItemCompatible(item) && !(selected[item.category] && selected[item.category].id === item.id)) {
    return;
  }
  if (selected[item.category] && selected[item.category].id === item.id) {
    delete selected[item.category];
  } else {
    selected[item.category] = item;
  }
  render();
}

categoriesEl.addEventListener("click", function (e) {
  const itemEl = e.target.closest(".item");
  if (!itemEl || itemEl.classList.contains("disabled")) return;
  const id = Number(itemEl.dataset.id);
  const item = items.find(function (i) { return i.id === id; });
  if (item) selectItem(item);
});

savedList.addEventListener("click", function (e) {
  const btn = e.target.closest("button[data-index]");
  if (!btn) return;
  const idx = Number(btn.dataset.index);
  savedBuilds.splice(idx, 1);
  render();
});

btnSave.addEventListener("click", function () {
  if (btnSave.disabled) return;
  const build = {
    total: calcTotal(),
    parts: Object.assign({}, selected)
  };
  savedBuilds.push(build);
  render();
});

budgetInput.addEventListener("input", function () {
  const val = Number(budgetInput.value);
  budget = isNaN(val) || val < 0 ? 0 : val;
  render();
});

searchInput.addEventListener("input", function () {
  searchQuery = searchInput.value.trim();
  render();
});

filterSelect.addEventListener("change", function () {
  filterCategory = filterSelect.value;
  render();
});

(function initFilter() {
  const cats = getCategories();
  for (let i = 0; i < cats.length; i++) {
    const opt = document.createElement("option");
    opt.value = cats[i];
    opt.textContent = cats[i];
    filterSelect.appendChild(opt);
  }
})();

render();
