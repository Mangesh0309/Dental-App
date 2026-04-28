export function getFestivalWish() {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-12
  const day = today.getDate(); // 1-31

  const festivals = [
    { name: "Republic Day", month: 1, day: 26, wish: "Happy Republic Day!" },
    { name: "Independence Day", month: 8, day: 15, wish: "Happy Independence Day!" },
    { name: "Gandhi Jayanti", month: 10, day: 2, wish: "Happy Gandhi Jayanti!" },
    { name: "Diwali", month: 10, day: 31, wish: "Happy Diwali! May the festival of lights bring you joy." },
    { name: "Diwali", month: 11, day: 1, wish: "Happy Diwali! May the festival of lights bring you joy." },
    { name: "Holi", month: 3, day: 25, wish: "Happy Holi! Wishing you a colorful day." },
    { name: "Makar Sankranti", month: 1, day: 14, wish: "Happy Makar Sankranti!" }
  ];

  const currentFestival = festivals.find(f => f.month === month && f.day === day);

  if (currentFestival) {
    return currentFestival.wish;
  }

  const hour = today.getHours();
  if (hour < 12) return "Good Morning!";
  if (hour < 18) return "Good Afternoon!";
  return "Good Evening!";
}
