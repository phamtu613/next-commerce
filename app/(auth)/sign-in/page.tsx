import { auth } from '@/auth'
import CredentialsSignInForm from '@/components/auth/credentials-signin-form';
import { redirect } from 'next/navigation'

export default async function SignInPage(props: { searchParams: Promise<{ callbackUrl?: string }> }) {

  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl || '/';

  const session = await auth();
  
  if (session) {
    return redirect(callbackUrl)
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <CredentialsSignInForm callbackUrl={callbackUrl} />
    </div>
  )
}
