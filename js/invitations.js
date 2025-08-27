export function createInviteLinks(event) {
  const participants = event.participants || [];
  return participants.map(p => {
    const params = new URLSearchParams({
      subject: `Invitation: ${event.title || ''}`,
      body: `Please join ${event.title || ''} on ${new Date(event.start).toLocaleString()}`
    });
    return `mailto:${p}?${params.toString()}`;
  });
}
