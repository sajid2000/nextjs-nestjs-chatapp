import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date) {
  return format(date, "hh:mm aa");
}

let throttleTimer: any;

export const throttle = (cb: () => unknown, time: number) => {
  if (throttleTimer) return;

  throttleTimer = true;

  setTimeout(() => {
    cb();
    throttleTimer = false;
  }, time);
};

export const wait = (time: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), time));
};
