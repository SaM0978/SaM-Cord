export function convertTimestampToText(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Function to add leading zero if the number is less than 10
  const addLeadingZero = (num) => (num < 10 ? `0${num}` : num);

  // Convert hours to 12-hour format
  const formattedHours = hours % 12 || 12;

  // Determine if it's AM or PM
  const amOrPm = hours < 12 ? "AM" : "PM";

  // Construct the time string
  const timeString = `${formattedHours}:${addLeadingZero(minutes)} ${amOrPm}`;

  // Get today's date
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  // Get the date from the provided timestamp
  const providedDate = date.getDate();
  const providedMonth = date.getMonth();
  const providedYear = date.getFullYear();

  // Check if the provided date is today
  if (
    todayDate === providedDate &&
    todayMonth === providedMonth &&
    todayYear === providedYear
  ) {
    return `Today at ${timeString}`;
  } else {
    // Check if the provided date is yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (
      yesterday.getDate() === providedDate &&
      yesterday.getMonth() === providedMonth &&
      yesterday.getFullYear() === providedYear
    ) {
      return `Yesterday at ${timeString}`;
    } else {
      // If it's not today or yesterday, return the date in MM/DD/YYYY format
      const formattedDate = `${addLeadingZero(
        providedMonth + 1
      )}/${addLeadingZero(providedDate)}/${providedYear} at ${timeString}`;
      return formattedDate;
    }
  }
}
