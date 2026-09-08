import { redirect } from "next/navigation";

/**
 * Retired route. Carolina's operator entry is /carolina, which owns the
 * only coach-login implementation. This stays so existing bookmarks and
 * internal redirects keep working.
 */
export default function CoachLoginPage() {
  redirect("/carolina");
}
