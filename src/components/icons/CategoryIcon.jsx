import {
  UtensilsCrossed,
  ShoppingBasket,
  Bus,
  Home,
  ShoppingBag,
  HeartPulse,
  Clapperboard,
  CircleDot,
  Coffee,
  Car,
  Plane,
  GraduationCap,
  Gift,
  Dumbbell,
  PawPrint,
  Wifi,
  BookOpen,
  Shirt,
  Smartphone,
  Wallet,
} from "lucide-react";

const ICONS = {
  utensils: UtensilsCrossed,
  basket: ShoppingBasket,
  bus: Bus,
  home: Home,
  bag: ShoppingBag,
  heart: HeartPulse,
  clapper: Clapperboard,
  circle: CircleDot,
  coffee: Coffee,
  car: Car,
  plane: Plane,
  education: GraduationCap,
  gift: Gift,
  fitness: Dumbbell,
  pet: PawPrint,
  wifi: Wifi,
  book: BookOpen,
  shirt: Shirt,
  phone: Smartphone,
  wallet: Wallet,
};

export const ICON_KEYS = Object.keys(ICONS);

export default function CategoryIcon({ name = "circle", className = "h-4 w-4", strokeWidth = 1.9 }) {
  const Icon = ICONS[name] || CircleDot;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}