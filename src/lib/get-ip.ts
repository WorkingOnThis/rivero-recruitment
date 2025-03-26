import { headers } from "next/headers";

export function getIp() {
  // const forwardedFor = headers().get("x-forwarded-for");
  // const realIp = headers().get("x-real-ip");
  const forwardedFor = headers().then((headers) => headers.get("x-forwarded-for"));
  const realIp = headers().then((headers) => headers.get("x-real-ip"));

  if (forwardedFor) {
    // return forwardedFor.split(",")[0].trim();
    return forwardedFor;
  }

  if (realIp) {
    return realIp;
  }

  return null;
}
