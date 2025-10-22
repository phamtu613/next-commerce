'use client';
import { useActionState } from 'react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import { signInDefaultValues } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface Props {
  callbackUrl: string;
}

export default function CredentialsSignInForm({ callbackUrl }: Props) {
  const [data, action] = useActionState(signInWithCredentials, { message: '', success: false });
  const [form, setForm] = useState(signInDefaultValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const SignInButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full" variant="default">
        {pending ? 'Signing in...' : 'Sign In with credentials'}
      </Button>
    );
  };

  return (
    <form action={action} className="space-y-6">
      <Input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="text-sm text-center text-muted-foreground">
        Debug callbackUrl: {callbackUrl}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          onChange={handleChange}
          value={form.email}
          autoComplete="email"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          onChange={handleChange}
          value={form.password}
          autoComplete="current-password"
        />
      </div>

      {data && !data.success && (
        <div className="text-center text-destructive text-sm">{data.message}</div>
      )}

      <SignInButton />

      <div className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link target="_self" className="link" href="/sign-up">
          Sign Up
        </Link>
      </div>
    </form>
  );
}
