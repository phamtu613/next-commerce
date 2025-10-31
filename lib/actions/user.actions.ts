"use server";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/db/prisma";
import { ShippingAddress } from "@/types";
import { Prisma } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";
import { ROUTES } from "../constants/routes";
import { formatError } from "../utils";
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateProfileSchema,
  updateUserSchema,
} from "../validator";

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
      const errorMessage = formatError(error);
      return {
        success: false,
        message: errorMessage,
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

    const errorMessage = formatError(error);
    return {
      success: false,
      message: errorMessage,
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

export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "User is not authenticated" };
    }

    const validatedData = updateProfileSchema.parse(user);

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    if (!currentUser) throw new Error("User not found");

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: validatedData.name,
      },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
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

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id! },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    revalidateTag(`user-${currentUser.id}`);
    revalidatePath("/place-order");
    revalidatePath("/shipping-address");

    return {
      success: true,
      message: "Address updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count({
    where: {
      ...queryFilter,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });

    revalidatePath(ROUTES.ADMIN.USERS);

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath(ROUTES.ADMIN.USERS);

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
