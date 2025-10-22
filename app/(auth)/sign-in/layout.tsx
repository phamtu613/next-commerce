"use client";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CredentialsSignInForm from './credentials-signin-form';

export default function SignIn() {
  return (
    <div className='w-full max-w-md mx-auto py-10'>
      <Card>
        <CardHeader className='space-y-4'>
          <Link href='/' className='flex-center'>
            <h2 className="sr-only">Home</h2>
          </Link>
          <CardTitle className='text-center text-2xl font-semibold'>
            Sign In
          </CardTitle>
          <CardDescription className='text-center'>
            Select a method to sign in to your account
          </CardDescription>
        </CardHeader>

        {/* ✅ Chèn form đăng nhập ở đây */}
        <CardContent className='space-y-4'>
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
