import {
  applicationName,
} from "@/app-config";
import {
  createUser,
  getUserByEmail,
  verifyPassword,
} from "@/data-access/users";
import {
  createAccount,
  updatePassword,
} from "@/data-access/accounts";
import {
  uniqueNamesGenerator,
  colors,
  animals,
} from "unique-names-generator";
import {
  createProfile,
} from "@/data-access/profiles";
import { sendEmail } from "@/lib/send-email";
import {
  createVerifyEmailToken,
} from "@/data-access/verify-email";
import { VerifyEmail } from "@/emails/verify-email";
import { LoginError, PublicError } from "./errors";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  getPasswordResetToken,
} from "@/data-access/reset-tokens";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { createTransaction } from "@/data-access/utils";
import { deleteSessionForUser } from "@/data-access/sessions";


export async function registerUserUseCase(email: string, password: string) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new PublicError("An user with that email already exists.");
  }
  const user = await createUser(email);
  await createAccount(user.id, password);

  const displayName = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: " ",
    style: "capital",
  });
  await createProfile(user.id, displayName);

  try {
    const token = await createVerifyEmailToken(user.id);
    await sendEmail(
      email,
      `Verify your email for ${applicationName}`,
      <VerifyEmail token={token} />
    );
  } catch (error) {
    console.error(
      "Verification email would not be sent, did you setup the resend API key?",
      error
    );
  }

  return { id: user.id };
}

export async function signInUseCase(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new LoginError();
  }

  const isPasswordCorrect = await verifyPassword(email, password);

  if (!isPasswordCorrect) {
    throw new LoginError();
  }

  return { id: user.id };
}

export async function resetPasswordUseCase(email: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const token = await createPasswordResetToken(user.id);

  await sendEmail(
    email,
    `Your password reset link for ${applicationName}`,
    <ResetPasswordEmail token={token} />
  );
}

export async function changePasswordUseCase(token: string, password: string) {
  const tokenEntry = await getPasswordResetToken(token);

  if (!tokenEntry) {
    throw new PublicError("Invalid token");
  }

  const userId = tokenEntry.userId;

  await createTransaction(async (trx) => {
    await deletePasswordResetToken(token, trx);
    await updatePassword(userId, password, trx);
    await deleteSessionForUser(userId, trx);
  });
}
