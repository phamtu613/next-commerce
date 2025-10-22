'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/actions/user.actions';
import { signUpDefaultValues } from '@/lib/constants';
import Link from 'next/link';

interface SignUpFormProps {
  callbackUrl: string;
}

const SignUpForm = () => {
  const [data, action] = useActionState(signUp, { success: false, message: '' });
  const { pending } = useFormStatus();

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={signUpDefaultValues.name}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={signUpDefaultValues.email}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          defaultValue={signUpDefaultValues.password}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          defaultValue={signUpDefaultValues.confirmPassword}
          required
        />
      </div>

      <Button disabled={pending} className="w-full">
        {pending ? 'Submitting...' : 'Sign Up'}
      </Button>

      {!data.success && <div className="text-center text-destructive">{data.message}</div>}

      <div className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <Link href={`/sign-in`} className="link">
          Sign In
        </Link>
      </div>
    </form>
  );
};

export default SignUpForm;
