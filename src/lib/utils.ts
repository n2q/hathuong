import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
}

export function toDateInputValue(date: Date | string) {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}
