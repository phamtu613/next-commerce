import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CredentialsSignInForm from './credentials-signin-form'

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
