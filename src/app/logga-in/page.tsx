import { redirect } from "next/navigation";

/** Gammal inloggningsväg. Behålls så att bokmärken fortsätter fungera. */
export default function LegacyLoginPage() {
  redirect("/coach-login");
}
