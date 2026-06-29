import { createAdminClient } from "@/lib/supabase/admin";
import { createUserProfile, getProfileById, updateProfileAccess, updateProfilePassword } from "@/lib/local-db";
import { internalEmailForUsername, isInternalUsernameEmail, normalizeUsername, validateUsername } from "@/lib/utils/username";
import type { StaffRole, UserProfile } from "@/types/staff";

type UserAccessInput = {
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: StaffRole;
  isActive?: boolean;
  temporaryPassword?: string | null;
};

export async function createUserWithUsername(input: UserAccessInput) {
  const username = normalizeAndValidateUsername(input.username);
  const email = input.email?.trim() || internalEmailForUsername(username);

  const profile = await createUserProfile({
    username,
    fullName: input.fullName,
    email,
    phone: input.phone,
    role: input.role,
    isActive: input.isActive
  });

  if (profile && input.temporaryPassword) {
    await updateProfilePassword(profile.id, input.temporaryPassword);
    await upsertSupabaseAuthUser({
      email,
      password: input.temporaryPassword,
      username,
      fullName: input.fullName
    });
  }

  return profile;
}

export async function updateUserUsername(profile: UserProfile, username: string) {
  const nextUsername = normalizeAndValidateUsername(username);
  const nextEmail = isInternalUsernameEmail(profile.email) ? internalEmailForUsername(nextUsername) : profile.email;

  await updateSupabaseUserEmail({
    currentEmail: profile.email,
    nextEmail,
    username: nextUsername,
    fullName: profile.fullName
  });

  return updateProfileAccess({
    profileId: profile.id,
    username: nextUsername,
    email: nextEmail
  });
}

export async function updateUserPassword(profile: UserProfile, temporaryPassword: string) {
  if (!temporaryPassword.trim()) {
    throw new Error("Escribe una contraseña temporal.");
  }

  await updateProfilePassword(profile.id, temporaryPassword);
  await upsertSupabaseAuthUser({
    email: profile.email,
    password: temporaryPassword,
    username: profile.username,
    fullName: profile.fullName
  });

  return profile;
}

export function deactivateUser(profile: UserProfile) {
  return updateProfileAccess({
    profileId: profile.id,
    username: profile.username,
    isActive: false
  });
}

export function activateUser(profile: UserProfile) {
  return updateProfileAccess({
    profileId: profile.id,
    username: profile.username,
    isActive: true
  });
}

export function updateUserRole(profile: UserProfile, role: StaffRole) {
  return updateProfileAccess({
    profileId: profile.id,
    username: profile.username,
    role
  });
}

export function syncProfileAndStaffMember(input: {
  profileId: string;
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: StaffRole;
  isActive: boolean;
}) {
  return updateProfileAccess(input);
}

export async function upsertSupabaseAuthUser({
  email,
  password,
  username,
  fullName
}: {
  email: string;
  password: string;
  username: string;
  fullName: string;
}) {
  const supabase = createAdminClient();

  if (!supabase) {
    return null;
  }

  const existingUserId = await findUserIdByEmail(email);

  if (existingUserId) {
    const { error } = await supabase.auth.admin.updateUserById(existingUserId, {
      password,
      user_metadata: {
        username,
        full_name: fullName
      }
    });

    if (error) return null;
    return existingUserId;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      full_name: fullName
    }
  });

  if (error) return null;
  return data.user?.id || null;
}

async function updateSupabaseUserEmail({
  currentEmail,
  nextEmail,
  username,
  fullName
}: {
  currentEmail: string;
  nextEmail: string;
  username: string;
  fullName: string;
}) {
  if (currentEmail.toLowerCase() === nextEmail.toLowerCase()) return null;

  const supabase = createAdminClient();
  if (!supabase) return null;

  const existingUserId = await findUserIdByEmail(currentEmail);
  if (!existingUserId) return null;

  const { error } = await supabase.auth.admin.updateUserById(existingUserId, {
    email: nextEmail,
    email_confirm: true,
    user_metadata: {
      username,
      full_name: fullName
    }
  });

    if (error) return null;
  return existingUserId;
}

async function findUserIdByEmail(email: string) {
  const supabase = createAdminClient();
  if (!supabase) return null;

  let page = 1;
  const perPage = 100;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) return null;

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

function normalizeAndValidateUsername(username: string) {
  const normalized = normalizeUsername(username);
  const usernameError = validateUsername(normalized);
  if (usernameError) throw new Error(usernameError);
  return normalized;
}

export function getUserProfile(profileId: string) {
  return getProfileById(profileId);
}
