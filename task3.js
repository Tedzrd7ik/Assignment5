const TAKEN_NAMES = ["admin", "player", "hero", "test", "guest", "root", "shadow", "legend"];
const TOTAL_POINTS = 20;
const MIN_SKILL = 1;
const MAX_SKILL = 10;
const CLASS_MIN = {
  warrior: { str: 5 },
  mage: { int: 5 },
  rogue: { agi: 5 },
  cleric: { vit: 4, int: 3 }
};

const form = document.getElementById("char-form");
const nameInput = document.getElementById("name");
const classSelect = document.getElementById("class");
const colorInput = document.getElementById("color");
const strInput = document.getElementById("str");
const agiInput = document.getElementById("agi");
const intInput = document.getElementById("int");
const vitInput = document.getElementById("vit");
const pointsLeftEl = document.getElementById("points-left");
const globalErrors = document.getElementById("global-errors");
const resultPanel = document.getElementById("result");
const resultContent = document.getElementById("result-content");
const btnNew = document.getElementById("btn-new");
const colorSwatches = document.getElementById("color-swatches");

const nameError = document.getElementById("name-error");
const classError = document.getElementById("class-error");
const colorError = document.getElementById("color-error");
const skillsError = document.getElementById("skills-error");

const previewName = document.getElementById("preview-name");
const previewClass = document.getElementById("preview-class");
const previewAvatar = document.getElementById("preview-avatar");
const barStr = document.getElementById("bar-str");
const barAgi = document.getElementById("bar-agi");
const barInt = document.getElementById("bar-int");
const barVit = document.getElementById("bar-vit");
const valStr = document.getElementById("val-str");
const valAgi = document.getElementById("val-agi");
const valInt = document.getElementById("val-int");
const valVit = document.getElementById("val-vit");

form.noValidate = true;

let touched = {
  name: false,
  class: false,
  color: false,
  skills: false
};

function getSkills() {
  return {
    str: Number(strInput.value) || 0,
    agi: Number(agiInput.value) || 0,
    int: Number(intInput.value) || 0,
    vit: Number(vitInput.value) || 0
  };
}

function skillSum() {
  const s = getSkills();
  return s.str + s.agi + s.int + s.vit;
}

function validateName() {
  const val = nameInput.value.trim();
  if (val.length === 0) {
    return "Name is required";
  }
  if (val.length < 3) {
    return "Name must be at least 3 characters";
  }
  if (val.length > 20) {
    return "Name must be at most 20 characters";
  }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(val)) {
    return "Name must start with a letter and contain only letters, numbers, underscore";
  }
  if (TAKEN_NAMES.indexOf(val.toLowerCase()) !== -1) {
    return "This name is already taken";
  }
  return "";
}

function validateClass() {
  const val = classSelect.value;
  if (!val) {
    return "Please select a class";
  }
  return "";
}

function validateColor() {
  if (!colorInput.value) {
    return "Please choose a color";
  }
  return "";
}

function validateSkills() {
  const s = getSkills();
  const keys = ["str", "agi", "int", "vit"];
  for (let i = 0; i < keys.length; i++) {
    const v = s[keys[i]];
    if (v < MIN_SKILL || v > MAX_SKILL) {
      return "Each skill must be between " + MIN_SKILL + " and " + MAX_SKILL;
    }
  }
  const sum = skillSum();
  if (sum !== TOTAL_POINTS) {
    return "Skill points must total exactly " + TOTAL_POINTS + " (currently " + sum + ")";
  }
  const cls = classSelect.value;
  if (cls && CLASS_MIN[cls]) {
    const reqs = CLASS_MIN[cls];
    for (const key in reqs) {
      if (s[key] < reqs[key]) {
        const labels = { str: "Strength", agi: "Agility", int: "Intelligence", vit: "Vitality" };
        return (cls.charAt(0).toUpperCase() + cls.slice(1)) + " requires " + labels[key] + " ≥ " + reqs[key];
      }
    }
  }
  return "";
}

function setFieldError(input, errorEl, message) {
  if (message) {
    errorEl.textContent = message;
    input.setAttribute("aria-invalid", "true");
  } else {
    errorEl.textContent = "";
    input.removeAttribute("aria-invalid");
  }
}

function updatePointsDisplay() {
  const left = TOTAL_POINTS - skillSum();
  pointsLeftEl.textContent = "Points left: " + left;
  if (left === 0) {
    pointsLeftEl.className = "points-left ok";
  } else if (left < 0) {
    pointsLeftEl.className = "points-left over";
  } else {
    pointsLeftEl.className = "points-left";
  }
}

function updatePreview() {
  const name = nameInput.value.trim() || "Unnamed";
  const cls = classSelect.value;
  const color = colorInput.value || "#64748b";
  const s = getSkills();

  previewName.textContent = name;
  previewClass.textContent = cls ? cls.charAt(0).toUpperCase() + cls.slice(1) : "No class";
  previewAvatar.textContent = name.charAt(0).toUpperCase() || "?";
  previewAvatar.style.background = color;

  barStr.style.width = (s.str / MAX_SKILL * 100) + "%";
  barAgi.style.width = (s.agi / MAX_SKILL * 100) + "%";
  barInt.style.width = (s.int / MAX_SKILL * 100) + "%";
  barVit.style.width = (s.vit / MAX_SKILL * 100) + "%";

  valStr.textContent = s.str;
  valAgi.textContent = s.agi;
  valInt.textContent = s.int;
  valVit.textContent = s.vit;
}

function validateField(field) {
  if (field === "name") {
    setFieldError(nameInput, nameError, validateName());
  } else if (field === "class") {
    setFieldError(classSelect, classError, validateClass());
  } else if (field === "color") {
    setFieldError(colorInput, colorError, validateColor());
  } else if (field === "skills") {
    const msg = validateSkills();
    skillsError.textContent = msg;
    const inputs = [strInput, agiInput, intInput, vitInput];
    for (let i = 0; i < inputs.length; i++) {
      if (msg) {
        inputs[i].setAttribute("aria-invalid", "true");
      } else {
        inputs[i].removeAttribute("aria-invalid");
      }
    }
  }
}

function validateAll() {
  const errors = [];
  const n = validateName();
  if (n) errors.push({ field: nameInput, msg: n });
  const c = validateClass();
  if (c) errors.push({ field: classSelect, msg: c });
  const col = validateColor();
  if (col) errors.push({ field: colorInput, msg: col });
  const sk = validateSkills();
  if (sk) errors.push({ field: strInput, msg: sk });

  setFieldError(nameInput, nameError, n);
  setFieldError(classSelect, classError, c);
  setFieldError(colorInput, colorError, col);
  skillsError.textContent = sk;
  const skillInputs = [strInput, agiInput, intInput, vitInput];
  for (let i = 0; i < skillInputs.length; i++) {
    if (sk) skillInputs[i].setAttribute("aria-invalid", "true");
    else skillInputs[i].removeAttribute("aria-invalid");
  }

  return errors;
}

function onInputOrBlur(field, isBlur) {
  if (isBlur) touched[field] = true;
  if (touched[field] || isBlur) {
    validateField(field);
  }
  updatePointsDisplay();
  updatePreview();
}

nameInput.addEventListener("blur", function () { onInputOrBlur("name", true); });
nameInput.addEventListener("input", function () { onInputOrBlur("name", false); });

classSelect.addEventListener("blur", function () { onInputOrBlur("class", true); });
classSelect.addEventListener("change", function () {
  touched.class = true;
  onInputOrBlur("class", false);
  onInputOrBlur("skills", false);
});

[strInput, agiInput, intInput, vitInput].forEach(function (inp) {
  inp.addEventListener("blur", function () { onInputOrBlur("skills", true); });
  inp.addEventListener("input", function () { onInputOrBlur("skills", false); });
});

colorSwatches.addEventListener("click", function (e) {
  const btn = e.target.closest(".color-swatch");
  if (!btn) return;
  const color = btn.dataset.color;
  colorInput.value = color;
  const all = colorSwatches.querySelectorAll(".color-swatch");
  for (let i = 0; i < all.length; i++) {
    all[i].classList.toggle("selected", all[i] === btn);
  }
  touched.color = true;
  onInputOrBlur("color", false);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  touched.name = true;
  touched.class = true;
  touched.color = true;
  touched.skills = true;

  const errors = validateAll();
  if (errors.length > 0) {
    globalErrors.textContent = errors.length + " error" + (errors.length > 1 ? "s" : "") + " found. Please fix them.";
    globalErrors.classList.remove("hidden");
    errors[0].field.focus();
    return;
  }

  globalErrors.classList.add("hidden");

  const s = getSkills();
  const name = nameInput.value.trim();
  const cls = classSelect.value;
  const color = colorInput.value;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  resultContent.innerHTML = "";
  const card = document.createElement("div");
  card.style.textAlign = "left";
  card.style.maxWidth = "320px";
  card.style.margin = "0 auto";

  const avatar = document.createElement("div");
  avatar.className = "char-avatar";
  avatar.style.background = color;
  avatar.style.margin = "0 auto 0.75rem";
  avatar.textContent = name.charAt(0).toUpperCase();
  card.appendChild(avatar);

  const h = document.createElement("h3");
  h.textContent = name;
  h.style.textAlign = "center";
  card.appendChild(h);

  const p = document.createElement("p");
  p.textContent = cls.charAt(0).toUpperCase() + cls.slice(1);
  p.style.textAlign = "center";
  p.style.color = "var(--text-muted)";
  card.appendChild(p);

  const stats = document.createElement("p");
  stats.style.marginTop = "0.75rem";
  stats.textContent = "STR " + s.str + " · AGI " + s.agi + " · INT " + s.int + " · VIT " + s.vit;
  card.appendChild(stats);

  const codeEl = document.createElement("p");
  codeEl.style.marginTop = "0.5rem";
  codeEl.textContent = "ID: " + code;
  card.appendChild(codeEl);

  resultContent.appendChild(card);
  resultPanel.classList.remove("hidden");
  form.classList.add("hidden");
  document.getElementById("preview").classList.add("hidden");
});

form.addEventListener("reset", function () {
  setTimeout(function () {
    touched = { name: false, class: false, color: false, skills: false };
    colorInput.value = "";
    const all = colorSwatches.querySelectorAll(".color-swatch");
    for (let i = 0; i < all.length; i++) all[i].classList.remove("selected");
    nameError.textContent = "";
    classError.textContent = "";
    colorError.textContent = "";
    skillsError.textContent = "";
    nameInput.removeAttribute("aria-invalid");
    classSelect.removeAttribute("aria-invalid");
    colorInput.removeAttribute("aria-invalid");
    [strInput, agiInput, intInput, vitInput].forEach(function (i) { i.removeAttribute("aria-invalid"); });
    globalErrors.classList.add("hidden");
    updatePointsDisplay();
    updatePreview();
  }, 0);
});

btnNew.addEventListener("click", function () {
  resultPanel.classList.add("hidden");
  form.classList.remove("hidden");
  document.getElementById("preview").classList.remove("hidden");
  form.reset();
});

updatePointsDisplay();
updatePreview();
