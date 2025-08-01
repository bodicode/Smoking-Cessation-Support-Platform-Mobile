import COLORS from "@/constants/Colors";

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

export const translateStatus = (status: string) => {
  switch (status) {
    case "PLANNING":
      return "Đang lên kế hoạch";
    case "ACTIVE":
      return "Đang thực hiện";
    case "PAUSED":
      return "Tạm dừng";
    case "COMPLETED":
      return "Hoàn thành";
    case "ABANDONED":
      return "Đã tạm ngưng";
    case "CANCELLED":
      return "Đã hủy";
    case "PENDING":
      return "Đang chờ";
    case "SKIPPED":
      return "Đã bỏ qua";
    default:
      return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "PLANNING":
      return COLORS.light.PRIMARY_YELLOW;
    case "ACTIVE":
      return COLORS.light.ACTIVE;
    case "PAUSED":
      return COLORS.light.grey;
    case "COMPLETED":
      return COLORS.light.PRIMARY_BLUE;
    case "ABANDONED":
      return COLORS.light.ERROR;
    case "CANCELLED":
      return COLORS.light.SUBTEXT;
    case "PENDING":
      return COLORS.light.BORDER_GREY;
    case "SKIPPED":
      return COLORS.light.DARK_GREY_TEXT;
    default:
      return COLORS.light.SUBTEXT;
  }
};
