export function addParticipantRow(list, email = '', status = 'pending', note = '') {
  const li = document.createElement('li');
  li.innerHTML = `
      <input type="email" class="participantEmail" value="${email}" placeholder="email" />
      <select class="participantStatus">
        <option value="pending"${status === 'pending' ? ' selected' : ''}>Pending</option>
        <option value="accepted"${status === 'accepted' ? ' selected' : ''}>Accepted</option>
        <option value="declined"${status === 'declined' ? ' selected' : ''}>Declined</option>
      </select>
      <input type="text" class="participantNote" value="${note}" placeholder="note" />
      <button type="button" class="removeParticipant">x</button>`;
  li.querySelector('.removeParticipant').addEventListener('click', () => li.remove());
  list.appendChild(li);
}

export function renderParticipants(list, participants) {
  list.innerHTML = '';
  participants.forEach(p => addParticipantRow(list, p.email, p.status, p.note));
}

export function getParticipants(list) {
  return Array.from(list.querySelectorAll('li'))
    .map(li => ({
      email: li.querySelector('.participantEmail').value.trim(),
      status: li.querySelector('.participantStatus').value,
      note: li.querySelector('.participantNote').value.trim()
    }))
    .filter(p => p.email);
}
