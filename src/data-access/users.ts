import { database } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createUser(email: string) {
    const [user] = await database
      .insert(users)
      .values({
        email,
      })
      .returning();
    return user;
  }

export async function getUserByEmail(email: string) {
const user = await database.query.users.findFirst({
    where: eq(users.email, email),
});

return user;
}