import { createInviteLinks } from '../js/invitations.js';

describe('invitations', () => {
  test('creates mailto links for participants', () => {
    const event = {
      title: 'Study Group',
      start: new Date('2024-01-01T12:00:00Z'),
      participants: ['a@example.com']
    };
    const links = createInviteLinks(event);
    expect(links[0]).toContain('mailto:a@example.com');
    expect(links[0]).toContain('subject=Invitation%3A+Study+Group');
  });
});
