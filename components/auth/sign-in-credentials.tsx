// lib/actions/user.actions.ts
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { compareSync } from 'bcryptjs';

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const callbackUrl = formData.get('callbackUrl')?.toString() || '/';

  if (!email || !password) return { success: false, message: 'Email and password required' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return { success: false, message: 'Invalid credentials' };

  const isValid = compareSync(password, user.password);
  if (!isValid) return { success: false, message: 'Invalid credentials' };

  // TODO: set session or cookie if not using NextAuth here
  console.log("🚀 Login callbackUrl:", callbackUrl);
  redirect(callbackUrl); // redirect sau login thành công
}
