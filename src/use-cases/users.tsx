import {
  applicationName,
} from "@/app-config";
import {
  createUser,
  getUserByEmail,
} from "@/data-access/users";
import {
  createAccount,
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
import { PublicError } from "./errors";

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
