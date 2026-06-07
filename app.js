const storageKey = "daily-dev-dashboard";
const draftStorageKey = "daily-dev-dashboard:drafts";

const defaultState = {
  focus: {
    text: "",
    savedOn: ""
  },
  tasks: [
    "Add keyboard shortcuts for saving focus",
    "Create a completed tasks view",
    "Write a deployment checklist"
  ],
  notes: []
};

const todayKey = getLocalDateKey(new Date());
const state = loadState();

const weekday = document.querySelector("#weekday");
const dateLabel = document.querySelector("#dateLabel");
const storageBanner = document.querySelector("#storageBanner");
const focusInput = document.querySelector("#focusInput");
const focusStatus = document.querySelector("#focusStatus");
const saveFocus = document.querySelector("#saveFocus");
const clearFocus = document.querySelector("#clearFocus");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const addTask = document.querySelector("#addTask");
const taskStatus = document.querySelector("#taskStatus");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const addNote = document.querySelector("#addNote");
const noteStatus = document.querySelector("#noteStatus");
const notesList = document.querySelector("#notesList");
const drafts = loadDrafts();

function createDefaultState() {
  return {
    focus: { ...defaultState.focus },
    tasks: [...defaultState.tasks],
    notes: [...defaultState.notes]
  };
}

function loadDrafts() {
  try {
    const savedDrafts = sessionStorage.getItem(draftStorageKey);

    if (!savedDrafts) {
      return {};
    }

    const parsedDrafts = JSON.parse(savedDrafts);

    if (!parsedDrafts || typeof parsedDrafts !== "object") {
      return {};
    }

    return parsedDrafts;
  } catch {
    return {};
  }
}

function saveDraft(field, value) {
  const nextDrafts = {
    ...drafts,
    [field]: value
  };

  if (!value) {
    delete nextDrafts[field];
  }

  Object.keys(drafts).forEach((key) => {
    delete drafts[key];
  });
  Object.assign(drafts, nextDrafts);

  try {
    if (Object.keys(drafts).length === 0) {
      sessionStorage.removeItem(draftStorageKey);
      return;
    }

    sessionStorage.setItem(draftStorageKey, JSON.stringify(drafts));
  } catch {
    // Ignore draft persistence failures and keep the main flows working.
  }
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return createDefaultState();
    }

    const parsed = JSON.parse(saved);
    const nextState = {
      ...createDefaultState(),
      ...parsed,
      focus: normalizeFocus(parsed.focus),
      tasks: normalizeTasks(parsed.tasks),
      notes: normalizeNotes(parsed.notes)
    };

    if (nextState.focus.savedOn !== todayKey) {
      nextState.focus = { ...defaultState.focus };
    }

    return nextState;
  } catch {
    return createDefaultState();
  }
}

function normalizeFocus(focus) {
  if (typeof focus === "string") {
    return {
      text: focus,
      savedOn: todayKey
    };
  }

  if (!focus || typeof focus !== "object") {
    return { ...defaultState.focus };
  }

  return {
    text: typeof focus.text === "string" ? focus.text : "",
    savedOn: typeof focus.savedOn === "string" ? focus.savedOn : ""
  };
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) {
    return [...defaultState.tasks];
  }

  return tasks.filter((task) => typeof task === "string" && task.trim().length > 0);
}

function normalizeNotes(notes) {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes.filter((note) => {
    return (
      note &&
      typeof note === "object" &&
      typeof note.text === "string" &&
      note.text.trim().length > 0 &&
      typeof note.createdAt === "string"
    );
  });
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    hideStorageBanner();
    return true;
  } catch {
    showStorageBanner("Browser storage is unavailable. Changes will last only for this session.");
    return false;
  }
}

function showStorageBanner(message) {
  storageBanner.hidden = false;
  storageBanner.textContent = message;
}

function hideStorageBanner() {
  storageBanner.hidden = true;
  storageBanner.textContent = "";
}

function saveFocusText(savedMessage = "Saved for today.") {
  const nextFocus = focusInput.value.trim();

  state.focus = nextFocus
    ? {
        text: nextFocus,
        savedOn: todayKey
      }
    : { ...defaultState.focus };
  saveDraft("focus", "");
  saveState();
  updateActionStates();
  focusStatus.textContent = nextFocus ? savedMessage : "Add a focus before saving.";
}

function updateActionStates() {
  const focusText = focusInput.value.trim();
  const taskText = taskInput.value.trim();
  const noteText = noteInput.value.trim();

  saveFocus.disabled = focusText.length === 0;
  clearFocus.disabled = state.focus.text.length === 0 && focusText.length === 0;
  addTask.disabled = taskText.length === 0 || getTaskValidationMessage(taskText).length > 0;
  addNote.disabled = noteText.length === 0 || getNoteValidationMessage(noteText).length > 0;
}

function getTaskValidationMessage(taskText) {
  if (!taskText) {
    return "Add a small task before submitting.";
  }

  if (taskText.length > 120) {
    return "Keep backlog items under 120 characters so they stay scannable.";
  }

  const normalizedTask = taskText.toLocaleLowerCase();
  const hasDuplicate = state.tasks.some((task) => task.toLocaleLowerCase() === normalizedTask);

  if (hasDuplicate) {
    return "That task is already in your backlog.";
  }

  return "";
}

function getNoteValidationMessage(noteText) {
  if (!noteText) {
    return "Add one short learning note before submitting.";
  }

  if (noteText.length > 280) {
    return "Keep learning notes under 280 characters so they stay easy to scan later.";
  }

  const normalizedNote = noteText.toLocaleLowerCase();
  const hasDuplicate = state.notes.some((note) => note.text.toLocaleLowerCase() === normalizedNote);

  if (hasDuplicate) {
    return "That learning note is already saved.";
  }

  return "";
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

  if (state.tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Backlog clear. Add the next small improvement when you are ready.";
    taskList.append(empty);
    return;
  }

  state.tasks.forEach((task, index) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const remove = document.createElement("button");

    label.textContent = task;
    remove.type = "button";
    remove.textContent = "Done";
    remove.setAttribute("aria-label", `Mark task done: ${task}`);
    remove.addEventListener("click", () => {
      state.tasks.splice(index, 1);
      saveState();
      renderTasks();
      taskStatus.textContent = `Completed task: ${task}`;
      taskStatus.dataset.tone = "success";
      updateActionStates();
    });

    item.append(label, remove);
    taskList.append(item);
  });
}

function renderNotes() {
  notesList.innerHTML = "";

  if (state.notes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No learning notes yet. Capture one sentence after today's session.";
    notesList.append(empty);
    return;
  }

  state.notes.slice().reverse().forEach((note, reverseIndex) => {
    const noteIndex = state.notes.length - 1 - reverseIndex;
    const item = document.createElement("li");
    const header = document.createElement("div");
    const time = document.createElement("time");
    const body = document.createElement("p");
    const remove = document.createElement("button");

    time.dateTime = note.createdAt;
    time.textContent = new Date(note.createdAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    body.textContent = note.text;
    remove.type = "button";
    remove.className = "note-remove";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete note from ${time.textContent}`);
    remove.addEventListener("click", () => {
      state.notes.splice(noteIndex, 1);
      saveState();
      renderNotes();
      noteStatus.textContent = `Deleted note from ${time.textContent}.`;
      noteStatus.dataset.tone = "success";
      updateActionStates();
    });

    header.className = "note-meta";
    header.append(time, remove);
    item.append(header, body);
    notesList.append(item);
  });
}

saveFocus.addEventListener("click", saveFocusText);

focusInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    saveFocusText("Saved for today with keyboard shortcut.");
  }
});

focusInput.addEventListener("input", () => {
  saveDraft("focus", focusInput.value);
  updateActionStates();
});

taskInput.addEventListener("input", () => {
  saveDraft("task", taskInput.value);
  taskStatus.textContent = taskInput.value.trim() ? getTaskValidationMessage(taskInput.value.trim()) : "";
  taskStatus.dataset.tone = taskStatus.textContent ? "warning" : "";
  updateActionStates();
});

noteInput.addEventListener("input", () => {
  saveDraft("note", noteInput.value);
  noteStatus.textContent = noteInput.value.trim() ? getNoteValidationMessage(noteInput.value.trim()) : "";
  noteStatus.dataset.tone = noteStatus.textContent ? "warning" : "";
  updateActionStates();
});

clearFocus.addEventListener("click", () => {
  state.focus = { ...defaultState.focus };
  focusInput.value = "";
  saveDraft("focus", "");
  saveState();
  updateActionStates();
  focusStatus.textContent = "Focus cleared.";
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextTask = taskInput.value.trim();
  const validationMessage = getTaskValidationMessage(nextTask);

  if (validationMessage) {
    taskStatus.textContent = validationMessage;
    taskStatus.dataset.tone = "warning";
    updateActionStates();
    return;
  }

  state.tasks.unshift(nextTask);
  taskInput.value = "";
  saveDraft("task", "");
  saveState();
  taskStatus.textContent = `Added task: ${nextTask}`;
  taskStatus.dataset.tone = "success";
  updateActionStates();
  renderTasks();
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const noteText = noteInput.value.trim();
  const validationMessage = getNoteValidationMessage(noteText);

  if (validationMessage) {
    noteStatus.textContent = validationMessage;
    noteStatus.dataset.tone = "warning";
    updateActionStates();
    return;
  }

  state.notes.push({
    text: noteText,
    createdAt: new Date().toISOString()
  });
  noteInput.value = "";
  saveDraft("note", "");
  noteStatus.textContent = "Saved learning note.";
  noteStatus.dataset.tone = "success";
  saveState();
  updateActionStates();
  renderNotes();
});

setDate();
focusInput.value = typeof drafts.focus === "string" ? drafts.focus : state.focus.text;
taskInput.value = typeof drafts.task === "string" ? drafts.task : "";
noteInput.value = typeof drafts.note === "string" ? drafts.note : "";

if (drafts.focus || drafts.task || drafts.note) {
  focusStatus.textContent = "Restored unsaved draft text from this tab.";
}

taskStatus.textContent = taskInput.value.trim() ? getTaskValidationMessage(taskInput.value.trim()) : "";
taskStatus.dataset.tone = taskStatus.textContent ? "warning" : "";
noteStatus.textContent = noteInput.value.trim() ? getNoteValidationMessage(noteInput.value.trim()) : "";
noteStatus.dataset.tone = noteStatus.textContent ? "warning" : "";
updateActionStates();
renderTasks();
renderNotes();
