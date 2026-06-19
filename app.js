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
  completedTasks: [],
  notes: []
};

const state = loadState();

const weekday = document.querySelector("#weekday");
const dateLabel = document.querySelector("#dateLabel");
const storageBanner = document.querySelector("#storageBanner");
const streakCount = document.querySelector("#streakCount");
const streakMessage = document.querySelector("#streakMessage");
const todayCompletedCount = document.querySelector("#todayCompletedCount");
const totalNotesCount = document.querySelector("#totalNotesCount");
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
const clearCompleted = document.querySelector("#clearCompleted");
const completedTaskCount = document.querySelector("#completedTaskCount");
const completedTaskList = document.querySelector("#completedTaskList");
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
    completedTasks: [...defaultState.completedTasks],
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

function getTodayKey() {
  return getLocalDateKey(new Date());
}

function isSameLocalDay(isoString, dateKey) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return getLocalDateKey(date) === dateKey;
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
      completedTasks: normalizeCompletedTasks(parsed.completedTasks),
      notes: normalizeNotes(parsed.notes)
    };

    if (nextState.focus.savedOn !== getTodayKey()) {
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
      savedOn: getTodayKey()
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

function normalizeCompletedTasks(completedTasks) {
  if (!Array.isArray(completedTasks)) {
    return [];
  }

  return completedTasks.filter((task) => {
    return (
      task &&
      typeof task === "object" &&
      typeof task.text === "string" &&
      task.text.trim().length > 0 &&
      typeof task.completedAt === "string"
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

function getPersistenceMessage(successMessage, fallbackMessage) {
  return saveState() ? successMessage : fallbackMessage;
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

  if (!nextFocus) {
    focusStatus.textContent = "Add a focus before saving.";
    focusStatus.dataset.tone = "warning";
    updateActionStates();
    return false;
  }

  state.focus = {
    text: nextFocus,
    savedOn: getTodayKey()
  };
  saveDraft("focus", "");
  updateActionStates();
  focusStatus.textContent = getPersistenceMessage(
    savedMessage,
    "Focus updated for this session only because browser storage is unavailable."
  );
  focusStatus.dataset.tone = "success";
  return true;
}

function updateActionStates() {
  const focusText = focusInput.value.trim();
  const taskText = taskInput.value.trim();
  const noteText = noteInput.value.trim();

  saveFocus.disabled = focusText.length === 0;
  clearFocus.disabled = state.focus.text.length === 0 && focusText.length === 0;
  addTask.disabled = taskText.length === 0 || getTaskValidationMessage(taskText).length > 0;
  addNote.disabled = noteText.length === 0 || getNoteValidationMessage(noteText).length > 0;
  clearCompleted.disabled = state.completedTasks.length === 0;
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

function saveNoteFromInput(savedMessage = "Saved learning note.") {
  const noteText = noteInput.value.trim();
  const validationMessage = getNoteValidationMessage(noteText);

  if (validationMessage) {
    noteStatus.textContent = validationMessage;
    noteStatus.dataset.tone = "warning";
    updateActionStates();
    return false;
  }

  state.notes.push({
    text: noteText,
    createdAt: new Date().toISOString()
  });
  noteInput.value = "";
  saveDraft("note", "");
  noteStatus.textContent = getPersistenceMessage(
    savedMessage,
    "Saved learning note for this session only because browser storage is unavailable."
  );
  noteStatus.dataset.tone = "success";
  updateActionStates();
  renderNotes();
  return true;
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

function syncDayBoundary() {
  const todayKey = getTodayKey();
  const hasStaleFocus = state.focus.text && state.focus.savedOn && state.focus.savedOn !== todayKey;

  if (!hasStaleFocus) {
    return;
  }

  state.focus = { ...defaultState.focus };

  if (!drafts.focus) {
    focusInput.value = "";
  }

  saveState();
  focusStatus.textContent = "Started a new day. Yesterday's saved focus was cleared.";
  focusStatus.dataset.tone = "";
}

function handleDayChange() {
  setDate();
  syncDayBoundary();
  updateActionStates();
}

function scheduleDayBoundaryRefresh() {
  const now = new Date();
  const nextMidnight = new Date(now);

  nextMidnight.setHours(24, 0, 0, 0);

  const delay = Math.max(nextMidnight.getTime() - now.getTime(), 1000);

  window.setTimeout(() => {
    handleDayChange();
    scheduleDayBoundaryRefresh();
  }, delay);
}

function setRestoredDraftStatuses() {
  if (typeof drafts.focus === "string" && drafts.focus.trim()) {
    focusStatus.textContent = "Restored unsaved focus draft from this tab.";
    focusStatus.dataset.tone = "";
  }

  if (typeof drafts.task === "string" && drafts.task.trim() && !taskStatus.textContent) {
    taskStatus.textContent = "Restored unsaved task draft from this tab.";
    taskStatus.dataset.tone = "";
  }

  if (typeof drafts.note === "string" && drafts.note.trim() && !noteStatus.textContent) {
    noteStatus.textContent = "Restored unsaved learning note draft from this tab.";
    noteStatus.dataset.tone = "";
  }
}

function getCompletedDayKeys() {
  const completedDayKeys = new Set();

  state.completedTasks.forEach((task) => {
    if (typeof task.completedAt !== "string") {
      return;
    }

    const completedDate = new Date(task.completedAt);

    if (Number.isNaN(completedDate.getTime())) {
      return;
    }

    completedDayKeys.add(getLocalDateKey(completedDate));
  });

  return completedDayKeys;
}

function getCompletionStreak() {
  const completedDayKeys = getCompletedDayKeys();

  if (completedDayKeys.size === 0) {
    return 0;
  }

  const today = new Date();
  let streak = 0;

  while (completedDayKeys.has(getLocalDateKey(today))) {
    streak += 1;
    today.setDate(today.getDate() - 1);
  }

  return streak;
}

function renderStats() {
  const todayKey = getTodayKey();
  const streak = getCompletionStreak();
  const completedToday = state.completedTasks.filter((task) => isSameLocalDay(task.completedAt, todayKey)).length;

  streakCount.textContent = String(streak);
  todayCompletedCount.textContent = String(completedToday);
  totalNotesCount.textContent = String(state.notes.length);

  if (streak === 0) {
    streakMessage.textContent = "Complete one task today to start a streak.";
    return;
  }

  if (completedToday > 0) {
    streakMessage.textContent = "You extended the streak today. Keep the chain intact.";
    return;
  }

  streakMessage.textContent = "No task finished yet today. Complete one to keep the streak alive.";
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
      state.completedTasks.unshift({
        text: task,
        completedAt: new Date().toISOString()
      });
      const statusMessage = getPersistenceMessage(
        `Completed task: ${task}`,
        `Completed task for this session only: ${task}`
      );
      renderTasks();
      renderCompletedTasks();
      renderStats();
      taskStatus.textContent = statusMessage;
      taskStatus.dataset.tone = "success";
      updateActionStates();
    });

    item.append(label, remove);
    taskList.append(item);
  });
}

function renderCompletedTasks() {
  completedTaskList.innerHTML = "";
  completedTaskCount.textContent = state.completedTasks.length;

  if (state.completedTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Finish a task to build a visible streak of completed work.";
    completedTaskList.append(empty);
    return;
  }

  state.completedTasks.slice(0, 5).forEach((task) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const time = document.createElement("time");

    label.textContent = task.text;
    time.dateTime = task.completedAt;
    time.textContent = `Completed ${new Date(task.completedAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })}`;

    item.append(label, time);
    completedTaskList.append(item);
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
      const statusMessage = getPersistenceMessage(
        `Deleted note from ${time.textContent}.`,
        `Deleted note for this session only from ${time.textContent}.`
      );
      renderNotes();
      renderStats();
      noteStatus.textContent = statusMessage;
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
  focusStatus.textContent = "";
  focusStatus.dataset.tone = "";
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

noteInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    saveNoteFromInput("Saved learning note with keyboard shortcut.");
  }
});

clearFocus.addEventListener("click", () => {
  state.focus = { ...defaultState.focus };
  focusInput.value = "";
  saveDraft("focus", "");
  const statusMessage = getPersistenceMessage(
    "Focus cleared.",
    "Focus cleared for this session only because browser storage is unavailable."
  );
  updateActionStates();
  focusStatus.textContent = statusMessage;
  focusStatus.dataset.tone = "success";
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
  taskStatus.textContent = getPersistenceMessage(
    `Added task: ${nextTask}`,
    `Added task for this session only: ${nextTask}`
  );
  taskStatus.dataset.tone = "success";
  updateActionStates();
  renderTasks();
});

clearCompleted.addEventListener("click", () => {
  const completedCount = state.completedTasks.length;

  if (completedCount === 0) {
    updateActionStates();
    return;
  }

  const historyLabel = completedCount === 1 ? "1 completed task" : `${completedCount} completed tasks`;
  const confirmed = window.confirm(`Clear ${historyLabel} from your history?`);

  if (!confirmed) {
    taskStatus.textContent = "Kept completed task history.";
    taskStatus.dataset.tone = "";
    updateActionStates();
    return;
  }

  state.completedTasks = [];
  const statusMessage = getPersistenceMessage(
    "Cleared completed task history.",
    "Cleared completed task history for this session only."
  );
  renderCompletedTasks();
  renderStats();
  taskStatus.textContent = statusMessage;
  taskStatus.dataset.tone = "success";
  updateActionStates();
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveNoteFromInput();
});

handleDayChange();
focusInput.value = typeof drafts.focus === "string" ? drafts.focus : state.focus.text;
taskInput.value = typeof drafts.task === "string" ? drafts.task : "";
noteInput.value = typeof drafts.note === "string" ? drafts.note : "";

taskStatus.textContent = taskInput.value.trim() ? getTaskValidationMessage(taskInput.value.trim()) : "";
taskStatus.dataset.tone = taskStatus.textContent ? "warning" : "";
noteStatus.textContent = noteInput.value.trim() ? getNoteValidationMessage(noteInput.value.trim()) : "";
noteStatus.dataset.tone = noteStatus.textContent ? "warning" : "";
setRestoredDraftStatuses();
updateActionStates();
renderTasks();
renderCompletedTasks();
renderNotes();
renderStats();
scheduleDayBoundaryRefresh();

window.addEventListener("focus", () => {
  handleDayChange();
});
