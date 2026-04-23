/**
 * 常用家用物品预设数据
 * ITEM-001: 约 50 个常见物品，按 category 分类
 * 仅在前端表单中供用户选择预填，不写入数据库
 */

export type Category = "food" | "daily" | "medicine" | "appliance" | "other";

export interface CommonItem {
  name: string;
  category: Category;
  unit: string;
  alertThreshold: number;
  trackExpiry: boolean;
  emoji: string;
}

export const commonItems: CommonItem[] = [
  // ── food（食品）──────────────────────────────────────
  { name: "大米", category: "food", unit: "kg", alertThreshold: 2, trackExpiry: true, emoji: "🍚" },
  { name: "面粉", category: "food", unit: "kg", alertThreshold: 1, trackExpiry: true, emoji: "🌾" },
  { name: "食用油", category: "food", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🫒" },
  { name: "酱油", category: "food", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🧴" },
  { name: "醋", category: "food", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🍶" },
  { name: "盐", category: "food", unit: "袋", alertThreshold: 1, trackExpiry: false, emoji: "🧂" },
  { name: "白砂糖", category: "food", unit: "袋", alertThreshold: 1, trackExpiry: false, emoji: "🍬" },
  { name: "鸡蛋", category: "food", unit: "个", alertThreshold: 6, trackExpiry: true, emoji: "🥚" },
  { name: "牛奶", category: "food", unit: "盒", alertThreshold: 2, trackExpiry: true, emoji: "🥛" },
  { name: "面包", category: "food", unit: "袋", alertThreshold: 1, trackExpiry: true, emoji: "🍞" },
  { name: "方便面", category: "food", unit: "包", alertThreshold: 3, trackExpiry: true, emoji: "🍜" },
  { name: "矿泉水", category: "food", unit: "瓶", alertThreshold: 6, trackExpiry: false, emoji: "💧" },
  { name: "咖啡", category: "food", unit: "袋", alertThreshold: 1, trackExpiry: true, emoji: "☕" },
  { name: "茶叶", category: "food", unit: "盒", alertThreshold: 1, trackExpiry: true, emoji: "🍵" },
  { name: "蜂蜜", category: "food", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🍯" },
  { name: "番茄酱", category: "food", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🍅" },
  { name: "黄油", category: "food", unit: "块", alertThreshold: 1, trackExpiry: true, emoji: "🧈" },
  { name: "奶酪", category: "food", unit: "包", alertThreshold: 1, trackExpiry: true, emoji: "🧀" },

  // ── daily（日用品）──────────────────────────────────
  { name: "洗手液", category: "daily", unit: "瓶", alertThreshold: 1, trackExpiry: false, emoji: "🧴" },
  { name: "洗洁精", category: "daily", unit: "瓶", alertThreshold: 1, trackExpiry: false, emoji: "🫧" },
  { name: "洗衣液", category: "daily", unit: "瓶", alertThreshold: 1, trackExpiry: false, emoji: "🧺" },
  { name: "卫生纸", category: "daily", unit: "包", alertThreshold: 2, trackExpiry: false, emoji: "🧻" },
  { name: "纸巾", category: "daily", unit: "包", alertThreshold: 2, trackExpiry: false, emoji: "🤧" },
  { name: "垃圾袋", category: "daily", unit: "卷", alertThreshold: 2, trackExpiry: false, emoji: "🗑️" },
  { name: "保鲜膜", category: "daily", unit: "卷", alertThreshold: 1, trackExpiry: false, emoji: "📦" },
  { name: "洗发水", category: "daily", unit: "瓶", alertThreshold: 1, trackExpiry: false, emoji: "🧴" },
  { name: "沐浴露", category: "daily", unit: "瓶", alertThreshold: 1, trackExpiry: false, emoji: "🛁" },
  { name: "牙膏", category: "daily", unit: "支", alertThreshold: 1, trackExpiry: false, emoji: "🪥" },
  { name: "牙刷", category: "daily", unit: "支", alertThreshold: 2, trackExpiry: false, emoji: "🪥" },
  { name: "毛巾", category: "daily", unit: "条", alertThreshold: 2, trackExpiry: false, emoji: "🧖" },
  { name: "拖鞋", category: "daily", unit: "双", alertThreshold: 1, trackExpiry: false, emoji: "🩴" },
  { name: "衣架", category: "daily", unit: "个", alertThreshold: 5, trackExpiry: false, emoji: "👔" },
  { name: "海绵擦", category: "daily", unit: "块", alertThreshold: 2, trackExpiry: false, emoji: "🧽" },

  // ── medicine（药品）─────────────────────────────────
  { name: "感冒药", category: "medicine", unit: "盒", alertThreshold: 1, trackExpiry: true, emoji: "💊" },
  { name: "退烧药", category: "medicine", unit: "盒", alertThreshold: 1, trackExpiry: true, emoji: "🌡️" },
  { name: "创可贴", category: "medicine", unit: "盒", alertThreshold: 1, trackExpiry: true, emoji: "🩹" },
  { name: "消毒液", category: "medicine", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🧪" },
  { name: "体温计", category: "medicine", unit: "支", alertThreshold: 1, trackExpiry: false, emoji: "🌡️" },
  { name: "止泻药", category: "medicine", unit: "盒", alertThreshold: 1, trackExpiry: true, emoji: "💊" },
  { name: "维生素C", category: "medicine", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🍊" },
  { name: "碘伏", category: "medicine", unit: "瓶", alertThreshold: 1, trackExpiry: true, emoji: "🩺" },
  { name: "口罩", category: "medicine", unit: "包", alertThreshold: 1, trackExpiry: false, emoji: "😷" },

  // ── appliance（家电/家居）───────────────────────────
  { name: "灯泡", category: "appliance", unit: "个", alertThreshold: 2, trackExpiry: false, emoji: "💡" },
  { name: "电池", category: "appliance", unit: "节", alertThreshold: 4, trackExpiry: false, emoji: "🔋" },
  { name: "插线板", category: "appliance", unit: "个", alertThreshold: 1, trackExpiry: false, emoji: "🔌" },
  { name: "数据线", category: "appliance", unit: "根", alertThreshold: 1, trackExpiry: false, emoji: "🔗" },

  // ── other（其他）────────────────────────────────────
  { name: "雨伞", category: "other", unit: "把", alertThreshold: 1, trackExpiry: false, emoji: "☂️" },
  { name: "钥匙扣", category: "other", unit: "个", alertThreshold: 1, trackExpiry: false, emoji: "🔑" },
  { name: "收纳盒", category: "other", unit: "个", alertThreshold: 1, trackExpiry: false, emoji: "📦" },
  { name: "文具", category: "other", unit: "套", alertThreshold: 1, trackExpiry: false, emoji: "✏️" },
];

/**
 * 按 category 分组的常用物品
 * 便于前端 UI 分组展示
 */
export function getCommonItemsByCategory(): Record<Category, CommonItem[]> {
  const grouped: Record<Category, CommonItem[]> = {
    food: [],
    daily: [],
    medicine: [],
    appliance: [],
    other: [],
  };

  for (const item of commonItems) {
    grouped[item.category].push(item);
  }

  return grouped;
}

/**
 * category 中文标签映射
 */
export const categoryLabels: Record<Category, string> = {
  food: "食品",
  daily: "日用品",
  medicine: "药品",
  appliance: "家电",
  other: "其他",
};
