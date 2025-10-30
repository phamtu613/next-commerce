import { auth } from "@/auth";
import { createSignInUrl, ROUTES } from "@/lib/constants/routes";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";
import ProfileSessionProvider from "./profile-session-provider";

export const metadata: Metadata = {
  title: "Customer Profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect(createSignInUrl(ROUTES.USER.PROFILE));
  }

  return (
    <ProfileSessionProvider session={session}>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="h2-bold">Profile</h2>
        <ProfileForm />
      </div>
    </ProfileSessionProvider>
  );
}
