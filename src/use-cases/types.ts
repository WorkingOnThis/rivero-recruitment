export type Role = "owner" | "admin" | "guest";

export type UserId = number;

export type UserProfile = {
  id: UserId;
  name: string | null;
  image: string | null;
};

export type UserSession = {
  id: UserId;
};

export type MemberInfo = {
  name: string | null;
  userId: UserId;
  image: string | null;
  role: Role;
};
