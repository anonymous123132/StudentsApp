import {
  addParticipantRow,
  renderParticipants,
  getParticipants
} from '../js/participants.js';

describe('participants', () => {
  test('addParticipantRow adds a row', () => {
    const list = document.createElement('ul');
    addParticipantRow(list, 'a@example.com', 'accepted', 'note');
    const li = list.querySelector('li');
    expect(li).not.toBeNull();
    expect(li.querySelector('.participantEmail').value).toBe('a@example.com');
  });

  test('renderParticipants populates list', () => {
    const list = document.createElement('ul');
    renderParticipants(list, [
      { email: 'a@example.com', status: 'accepted', note: 'ok' },
      { email: 'b@example.com', status: 'pending', note: '' }
    ]);
    expect(list.children).toHaveLength(2);
  });

  test('getParticipants reads data', () => {
    const list = document.createElement('ul');
    addParticipantRow(list, 'a@example.com', 'accepted', 'hi');
    addParticipantRow(list, '', 'pending', '');
    const participants = getParticipants(list);
    expect(participants).toEqual([
      { email: 'a@example.com', status: 'accepted', note: 'hi' }
    ]);
  });
});
