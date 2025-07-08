import COLORS from "@/constants/Colors";

export interface IHealthMilestone {
  id: string;
  timeframe: string;
  description: string;
  iconName: string;
  iconColor: string;
}

export const HEALTH_MILESTONES: IHealthMilestone[] = [
  {
    id: "1",
    timeframe: "20 phút",
    description: "Nhịp tim và huyết áp bắt đầu trở lại bình thường.",
    iconName: "heart-outline",
    iconColor: COLORS.light.PRIMARY_RED,
  },
  {
    id: "2",
    timeframe: "8 giờ",
    description:
      "Nồng độ carbon monoxide trong máu giảm một nửa. Mức oxy trở lại bình thường.",
    iconName: "cloud-outline",
    iconColor: COLORS.light.PRIMARY_GREEN,
  },
  {
    id: "3",
    timeframe: "24 giờ",
    description: "Nguy cơ đau tim giảm đáng kể.",
    iconName: "pulse-outline",
    iconColor: COLORS.light.PRIMARY_RED_DARK,
  },
  {
    id: "4",
    timeframe: "48 giờ",
    description:
      "Các đầu dây thần kinh bị tổn thương bắt đầu hồi phục. Khứu giác và vị giác cải thiện.",
    iconName: "bulb-outline",
    iconColor: COLORS.light.PRIMARY_YELLOW_DARK,
  },
  {
    id: "5",
    timeframe: "2-12 tuần",
    description: "Tuần hoàn máu cải thiện. Chức năng phổi tăng lên tới 30%.",
    iconName: "walk-outline",
    iconColor: COLORS.light.PRIMARY_BLUE_DARK,
  },
  {
    id: "6",
    timeframe: "1 năm",
    description: "Nguy cơ đau tim giảm một nửa so với người hút thuốc.",
    iconName: "shield-checkmark-outline",
    iconColor: COLORS.light.PRIMARY_GREEN,
  },
  {
    id: "7",
    timeframe: "5 năm",
    description: "Nguy cơ đột quỵ trở lại mức của người không hút thuốc.",
    iconName: "speedometer-outline",
    iconColor: COLORS.light.PRIMARY_YELLOW,
  },
  {
    id: "8",
    timeframe: "10 năm",
    description: "Nguy cơ ung thư phổi giảm một nửa so với người hút thuốc.",
    iconName: "medkit-outline",
    iconColor: COLORS.light.PRIMARY_RED,
  },
  {
    id: "9",
    timeframe: "15 năm",
    description:
      "Nguy cơ mắc bệnh tim mạch trở lại mức của người không hút thuốc.",
    iconName: "heart-circle-outline",
    iconColor: COLORS.light.PRIMARY_BLUE,
  },
];
