import { cookies } from "next/headers";

import { siteConfig } from "@/config";
import { AuthUser } from "@/types";

export default async function getServerUser() {
  const token = cookies().get("accessToken");

  try {
    const res = await fetch(`${siteConfig.apiUrl}/profile`, {
      headers: {
        authorization: ("Bearer " + token?.value) as string,
      },
    });

    if (!res.ok) return null;

    const user = await res.json();

    if (!user) return null;

    return user as AuthUser;
  } catch (error) {
    return null;
  }
}
