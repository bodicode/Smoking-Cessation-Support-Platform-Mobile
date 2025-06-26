export function translateLevel(level: string) {
  switch (level) {
    case "EASY":
      return "Dễ";
    case "MEDIUM":
      return "Trung bình";
    case "HARD":
      return "Khó";
    default:
      return level;
  }
}

export function getLevelColor(level: string) {
  switch (level) {
    case "EASY":
      return "#44e27c";
    case "MEDIUM":
      return "#16F2A8";
    case "HARD":
      return "#f44336";
    default:
      return "#bbb";
  }
}
