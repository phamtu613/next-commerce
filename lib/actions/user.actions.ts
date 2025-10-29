"use server";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";
import { formatError } from "../utils";
import { signInFormSchema, signUpFormSchema } from "../validator";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("NEXT_REDIRECT") ||
        error.message.includes("redirect")
      ) {
        return { success: true, message: "Signed in successfully" };
      }
    }

    return { success: false, message: "Invalid email or password" };
  }
}

export async function signUp(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      confirmPassword: formData.get("confirmPassword"),
      password: formData.get("password"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: "USER",
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "PrismaClientKnownRequestError"
    ) {
      const errorInfo = formatError(error);
      return {
        success: false,
        message: errorInfo.message,
        field: errorInfo.field,
      };
    }

    if (error instanceof Error) {
      if (
        error.message.includes("NEXT_REDIRECT") ||
        error.message.includes("redirect")
      ) {
        return { success: true, message: "User created successfully" };
      }
    }

    const errorInfo = formatError(error);
    return {
      success: false,
      message: errorInfo.message,
      field: errorInfo.field,
    };
  }
}

export async function signOutUser() {
  await signOut();
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUserPaymentMethod(data: { type: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { paymentMethod: data.type },
    });

    revalidateTag(`user-${session.user.id}`);
    revalidatePath("/place-order");
    revalidatePath("/payment-method");

    return { success: true, message: "Payment method updated" };
  } catch (error) {
    return { success: false, message: "Failed to update payment method" };
  }
}
