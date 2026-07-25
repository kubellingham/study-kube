import { redirect } from "next/navigation";

// The standalone /login page is retired — sign-in and create-account now live
// in the landing page's overlay (app/components/Landing.tsx). This route stays
// only as a redirect so any old link or bookmark lands on the front door.
export default function LoginRedirect() {
  redirect("/");
}
