'use server';
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { signIn, signOut as nextAuthSignOut } from '@/auth';
import { signInFormSchema, signUpFormSchema } from '../validator';
import { hashSync } from "bcryptjs";
import { prisma } from "../db/prisma";
import { formatError } from '../utils';

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Set user from form and validate it with Zod schema
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: 'Invalid email or password' };
  }
}

// Sign the user out
export async function SignOutUser() {
  'use server';
  await nextAuthSignOut({
    redirect: true,
    redirectTo: '/sign-in', // dùng redirectTo thay cho callbackUrl
  });
}

export async function signUp(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    });

    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
      redirect: true,
      callbackUrl: formData.get('callbackUrl') as string || '/',
    });

    return { success: true, message: 'User created successfully' };
  } catch (error: any) {
    console.error('SignUp Error:', error);
    return {
      success: false,
      message: formatError(error),
    };
  }
}