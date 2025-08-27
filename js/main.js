import {
  loadEvents,
  persistEvent,
  updateEvent,
  loadCategories,
  saveCategories,
  loadDnd
} from './storage.js';
import {
  populateCategorySelects,
  renderCategoryList
} from './categories.js';
import { applyFilters as applyFiltersModule } from './filters.js';
import { setupIcs } from './ics.js';
import { setupEventModal } from './eventModal.js';
import { calendarOptions } from './views.js';
import { requirePin, savePin, clearPin, loadPin } from './lock.js';
import { downloadBackup, importBackup } from './backup.js';
import { setupCourseSettings } from './courses.js';
import { loadProfile, saveProfile, estimateTravel } from './profile.js';
import { recalcTravelEvents } from './reminders.js';
import { quickAddStudy } from './study.js';

document.addEventListener('DOMContentLoaded', () => {
  if (!requirePin()) {
    document.body.innerHTML = '<p>Locked</p>';
    return;
  }
  const calendarEl = document.getElementById('calendar');
  const openSettingsBtn = document.getElementById('openSettings');
  const settingsModal = document.getElementById('settingsModal');
  const categoryList = document.getElementById('categoryList');
  const newCategoryName = document.getElementById('newCategoryName');
  const newCategoryColor = document.getElementById('newCategoryColor');
  const addCategoryBtn = document.getElementById('addCategory');
  const closeSettingsBtn = document.getElementById('closeSettings');
  const dndCheckbox = document.getElementById('dndMode');
  const searchInput = document.getElementById('searchEvents');
  const filterCategory = document.getElementById('filterCategory');
  const jumpDateInput = document.getElementById('jumpDate');
  const goToDateBtn = document.getElementById('goToDate');
  const calendarFilters = document.querySelectorAll('.calendarFilter');
  const importBtn = document.getElementById('importIcs');
  const exportBtn = document.getElementById('exportIcs');
  const shareBtn = document.getElementById('shareIcs');
  const quickStudyBtn = document.getElementById('quickStudy');
  const icsFileInput = document.getElementById('icsFile');
  const pinInput = document.getElementById('appLockPin');
  const savePinBtn = document.getElementById('savePin');
  const clearPinBtn = document.getElementById('clearPin');
  const backupBtn = document.getElementById('backupData');
  const restoreBtn = document.getElementById('restoreData');
  const backupFileInput = document.getElementById('backupFile');
  const homeLatInput = document.getElementById('homeLat');
  const homeLngInput = document.getElementById('homeLng');
  const travelModeSelect = document.getElementById('travelMode');
  const travelBufferInput = document.getElementById('travelBuffer');
  const travelPolicySelect = document.getElementById('travelPolicy');
  const travelProviderSelect = document.getElementById('travelProvider');
  const destList = document.getElementById('destinationsList');
  const destNameInput = document.getElementById('destName');
  const destLatInput = document.getElementById('destLat');
  const destLngInput = document.getElementById('destLng');
  const addDestBtn = document.getElementById('addDestination');
  const travelPreviewList = document.getElementById('travelPreview');

  let categories = loadCategories();
  let doNotDisturb = loadDnd();
  let profile = loadProfile();
  dndCheckbox.checked = doNotDisturb;
  pinInput.value = loadPin();
  homeLatInput.value = profile.homeLat ?? '';
  homeLngInput.value = profile.homeLng ?? '';
  travelModeSelect.value = profile.mode;
  travelBufferInput.value = profile.buffer;
  travelPolicySelect.value = profile.policy;
  travelProviderSelect.value = profile.provider;
  const getDnd = () => doNotDisturb;

  dndCheckbox.addEventListener('change', () => {
    doNotDisturb = dndCheckbox.checked;
    localStorage.setItem('dndMode', JSON.stringify(doNotDisturb));
  });
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  let openForCreate = () => {};
  let openForEdit = () => {};
  let categoryInput, scheduleRemindersBound;

  const calendar = new FullCalendar.Calendar(
    calendarEl,
    calendarOptions(info => openForCreate(info), event => openForEdit(event), loadEvents())
  );

  function renderDestinations() {
    destList.innerHTML = '';
    (profile.destinations || []).forEach((d, idx) => {
      const li = document.createElement('li');
      li.textContent = `${d.name} (${d.lat}, ${d.lng})`;
      const del = document.createElement('button');
      del.textContent = 'x';
      del.addEventListener('click', () => {
        profile.destinations.splice(idx, 1);
        saveProfile(profile);
        renderDestinations();
        recalcTravelEvents(calendar, persistEvent, updateEvent, getDnd(), profile);
        renderTravelPreview();
      });
      li.appendChild(del);
      destList.appendChild(li);
    });
  }

  renderDestinations();

  function renderTravelPreview() {
    travelPreviewList.innerHTML = '';
    (profile.destinations || []).forEach(d => {
      const mins = estimateTravel(profile, d.lat, d.lng);
      if (mins != null) {
        const li = document.createElement('li');
        li.textContent = `${d.name}: ${Math.round(mins)} min`;
        travelPreviewList.appendChild(li);
      }
    });
  }

  renderTravelPreview();

  function saveProfileAndRecalc() {
    profile.homeLat = parseFloat(homeLatInput.value);
    profile.homeLng = parseFloat(homeLngInput.value);
    profile.mode = travelModeSelect.value;
    profile.buffer = parseInt(travelBufferInput.value, 10) || 0;
    profile.policy = travelPolicySelect.value;
    profile.provider = travelProviderSelect.value;
    saveProfile(profile);
    recalcTravelEvents(calendar, persistEvent, updateEvent, getDnd(), profile);
    renderTravelPreview();
  }
  [
    homeLatInput,
    homeLngInput,
    travelModeSelect,
    travelBufferInput,
    travelPolicySelect,
    travelProviderSelect
  ].forEach(el => el.addEventListener('change', saveProfileAndRecalc));

  addDestBtn.addEventListener('click', () => {
    const name = destNameInput.value.trim();
    const lat = parseFloat(destLatInput.value);
    const lng = parseFloat(destLngInput.value);
    if (!name || isNaN(lat) || isNaN(lng)) return;
    profile.destinations.push({ name, lat, lng });
    saveProfile(profile);
    destNameInput.value = '';
    destLatInput.value = '';
    destLngInput.value = '';
    renderDestinations();
    recalcTravelEvents(calendar, persistEvent, updateEvent, getDnd(), profile);
    renderTravelPreview();
  });

  const applyFiltersBound = () =>
    applyFiltersModule(calendar, searchInput, filterCategory, calendarFilters);

  const modalSetup = setupEventModal(calendar, getDnd, applyFiltersBound);
  openForCreate = modalSetup.openForCreate;
  openForEdit = modalSetup.openForEdit;
  categoryInput = modalSetup.categoryInput;
  scheduleRemindersBound = modalSetup.scheduleRemindersBound;

  const populateCategories = () =>
    populateCategorySelects(categoryInput, filterCategory, categories);
  populateCategories();

  calendar.render();

  setupCourseSettings(calendar);

  setupIcs(
    importBtn,
    exportBtn,
    shareBtn,
    icsFileInput,
    calendar,
    persistEvent,
    scheduleRemindersBound,
    applyFiltersBound
  );

  openSettingsBtn.addEventListener('click', () => {
    renderCategoryList(
      categoryList,
      categories,
      saveCategories,
      populateCategories,
      applyFiltersBound
    );
    settingsModal.style.display = 'flex';
  });
  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
    newCategoryName.value = '';
  });
  addCategoryBtn.addEventListener('click', () => {
    const name = newCategoryName.value.trim();
    const color = newCategoryColor.value;
    if (!name) return;
    categories.push({ name, color });
    saveCategories(categories);
    populateCategories();
    renderCategoryList(
      categoryList,
      categories,
      saveCategories,
      populateCategories,
      applyFiltersBound
    );
    newCategoryName.value = '';
  });

  savePinBtn.addEventListener('click', () => {
    const pin = pinInput.value.trim();
    if (pin) savePin(pin);
    pinInput.value = '';
  });
  clearPinBtn.addEventListener('click', () => {
    clearPin();
    pinInput.value = '';
  });
  backupBtn.addEventListener('click', downloadBackup);
  restoreBtn.addEventListener('click', () => backupFileInput.click());
  backupFileInput.addEventListener('change', () => {
    const file = backupFileInput.files[0];
    if (file) importBackup(file, () => location.reload());
  });

  quickStudyBtn.addEventListener('click', () => {
    quickAddStudy(calendar, persistEvent);
    applyFiltersBound();
  });

  searchInput.addEventListener('input', applyFiltersBound);
  filterCategory.addEventListener('change', applyFiltersBound);
  calendarFilters.forEach(cb => cb.addEventListener('change', applyFiltersBound));
  goToDateBtn.addEventListener('click', () => {
    const date = jumpDateInput.value;
    if (date) calendar.gotoDate(date);
  });

  calendar.getEvents().forEach(scheduleRemindersBound);
  recalcTravelEvents(calendar, persistEvent, updateEvent, getDnd(), profile);
  applyFiltersBound();
});

