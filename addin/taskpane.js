let startTime = null;

Office.initialize = () => {
  const item = Office.context.mailbox.item;
  if (item) {
    startTime = Date.now();
    Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, onItemChanged);
  }

  document.getElementById('showTime').addEventListener('click', renderTime);
};

function onItemChanged() {
  const end = Date.now();
  saveTime(end - startTime);
  startTime = Date.now();
}

function saveTime(duration) {
  Office.context.mailbox.item.categories.getAsync(result => {
    if (result.status === Office.AsyncResultStatus.Succeeded) {
      result.value.forEach(cat => {
        const key = `time_${cat}`;
        const current = parseInt(localStorage.getItem(key) || '0', 10);
        localStorage.setItem(key, current + duration);
      });
    }
  });
}

function renderTime() {
  const list = document.getElementById('timeList');
  list.innerHTML = '';
  Object.keys(localStorage)
    .filter(k => k.startsWith('time_'))
    .forEach(k => {
      const li = document.createElement('li');
      const cat = k.substring(5);
      const ms = parseInt(localStorage.getItem(k), 10);
      li.textContent = `${cat}: ${Math.round(ms / 60000)} min`;
      list.appendChild(li);
    });
}
