import env from "./env";

const currentYear = new Date().getFullYear().toString();
const websiteLaunchYear = "2024";

export const siteConfig = {
  meta: {
    title: env.NEXT_PUBLIC_APP_NAME || "Chat App",
    description: "A chat app using nestjs nextjs socket.io",
    keywords: [],
  },
  language: "en-us",
  locale: "en-US",
  appName: env.NEXT_PUBLIC_APP_NAME || "Chat App",
  apiUrl: env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  copywriteYears: currentYear === websiteLaunchYear ? currentYear : `${websiteLaunchYear}-${currentYear}`,
};
