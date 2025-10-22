import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import CredentialsSignInForm from './credentials-signin-form'

export default async function SignInPage() {
  const session = await auth()

  if (session) {
    return redirect('/')
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <CredentialsSignInForm />
    </div>
  )
}
