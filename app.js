const storageKey = "daily-dev-dashboard";

const defaultState = {
  focus: "",
  tasks: [
    "Add keyboard shortcuts for saving focus",
    "Create a completed tasks view",
    "Write a deployment checklist"
  ],
  notes: []
};

const state = loadState();

const weekday = document.querySelector("#weekday");
const dateLabel = document.querySelector("#dateLabel");
const focusInput = document.querySelector("#focusInput");
const focusStatus = document.querySelector("#focusStatus");
const saveFocus = document.querySelector("#saveFocus");
const clearFocus = document.querySelector("#clearFocus");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const notesList = document.querySelector("#notesList");

function loadState() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return { ...defaultState };
  }

  try {
    return { ...defaultState, ...JSON.parse(saved) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function setDate() {
  const today = new Date();
  weekday.textContent = today.toLocaleDateString(undefined, { weekday: "long" });
  dateLabel.textContent = today.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  taskCount.textContent = state.tasks.length;

  state.tasks.forEach((task, index) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const remove = document.createElement("button");

    label.textContent = task;
    remove.type = "button";
    remove.textContent = "Done";
    remove.addEventListener("click", () => {
      state.tasks.splice(index, 1);
      saveState();
      renderTasks();
    });

    item.append(label, remove);
    taskList.append(item);
  });
}

function renderNotes() {
  notesList.innerHTML = "";

  state.notes.slice().reverse().forEach((note) => {
    const item = document.createElement("li");
    const time = document.createElement("time");
    const body = document.createElement("p");

    time.dateTime = note.createdAt;
    time.textContent = new Date(note.createdAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    body.textContent = note.text;

    item.append(time, body);
    notesList.append(item);
  });
}

saveFocus.addEventListener("click", () => {
  state.focus = focusInput.value.trim();
  saveState();
  focusStatus.textContent = state.focus ? "Saved for today." : "Add a focus before saving.";
});

clearFocus.addEventListener("click", () => {
  state.focus = "";
  focusInput.value = "";
  saveState();
  focusStatus.textContent = "Focus cleared.";
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextTask = taskInput.value.trim();

  if (!nextTask) {
    return;
  }

  state.tasks.unshift(nextTask);
  taskInput.value = "";
  saveState();
  renderTasks();
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const noteText = noteInput.value.trim();

  if (!noteText) {
    return;
  }

  state.notes.push({
    text: noteText,
    createdAt: new Date().toISOString()
  });
  noteInput.value = "";
  saveState();
  renderNotes();
});

setDate();
focusInput.value = state.focus;
renderTasks();
renderNotes();
