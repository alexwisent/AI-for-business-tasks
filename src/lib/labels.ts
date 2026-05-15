import type { EquipmentCategory } from "@/types";

export const equipmentCategoryLabel: Record<EquipmentCategory, string> = {
  light: "Свет",
  sound: "Звук",
  props: "Реквизит",
  cameras: "Камеры",
  tripods: "Штативы",
};

export const equipmentCategoryOptions: { value: EquipmentCategory; label: string }[] = (
  Object.keys(equipmentCategoryLabel) as EquipmentCategory[]
).map((value) => ({ value, label: equipmentCategoryLabel[value] }));
