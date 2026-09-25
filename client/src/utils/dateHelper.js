export const getTodayDateString = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, '0');
  const day = String(ist.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isRideExpired = (dateStr, departureTimeStr) => {
  if (!dateStr) return false;
  try {
    const todayStr = getTodayDateString();

    if (dateStr < todayStr) return true;
    if (dateStr > todayStr) return false;

    if (!departureTimeStr) return false;

    let hours = 0;
    let minutes = 0;

    const timeMatch = departureTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
    }

    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const istNow = new Date(utc + (3600000 * 5.5));
    const nowMinutes = istNow.getHours() * 60 + istNow.getMinutes();
    const rideMinutes = hours * 60 + minutes;

    return nowMinutes >= rideMinutes;
  } catch (e) {
    return false;
  }
};
