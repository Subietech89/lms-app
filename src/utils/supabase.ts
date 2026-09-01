import { createClient, SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";
import { User, UserRole, DatabaseConfig } from "../types";
import { StorageService } from "./storage";

let cachedClient: SupabaseClient | null = null;
let lastClientKey = "";

/**
 * Returns the effective Supabase URL and Anon Key from environment variables or stored DatabaseConfig.
 */
export function getEffectiveSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

  const dbConfig: DatabaseConfig = StorageService.getDatabaseConfig();
  const storedUrl = (dbConfig?.supabaseUrl || "").trim();
  const storedKey = (dbConfig?.supabaseAnonKey || "").trim();

  const url = envUrl || storedUrl;
  const anonKey = envKey || storedKey;

  // Validate that it's a real URL and not the placeholder example
  const isPlaceholder =
    !url ||
    url.includes("xyzcompany.supabase.co") ||
    !url.startsWith("http") ||
    !anonKey ||
    anonKey.includes("...");

  return {
    url,
    anonKey,
    isConfigured: !isPlaceholder && Boolean(url && anonKey),
  };
}

/**
 * Get or initialize the Supabase client instance.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getEffectiveSupabaseConfig();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  const currentKey = `${url}_${anonKey}`;
  if (cachedClient && lastClientKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastClientKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

/**
 * Maps a Supabase Auth User object to the application's User model.
 */
export function mapSupabaseUserToLmsUser(sbUser: SupabaseAuthUser): User {
  const meta = sbUser.user_metadata || {};
  const rawRole = meta.role || "student";
  const validRole: UserRole =
    rawRole === "admin" ? "admin" : rawRole === "teacher" ? "teacher" : "student";

  const email = sbUser.email || "";
  const name =
    meta.full_name ||
    meta.name ||
    email.split("@")[0].replace(/[._]/g, " ") ||
    "Scholar";

  return {
    id: sbUser.id,
    name: name
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    email: email.toLowerCase(),
    avatar:
      meta.avatar_url ||
      `https://images.unsplash.com/photo-${
        validRole === "teacher"
          ? "1507003211169-0a1dd7228f2d"
          : validRole === "admin"
          ? "1573496359142-b8d87734a5a2"
          : "1535713875002-d1d0cf377fde"
      }?auto=format&fit=crop&w=200&q=80`,
    role: validRole,
    department: meta.department || (validRole === "student" ? "General Studies" : "Faculty Department"),
    enrolledCourseIds: meta.enrolledCourseIds || [],
    completedCourseIds: meta.completedCourseIds || [],
    totalPoints: meta.totalPoints || 0,
    learningStreakDays: meta.learningStreakDays || 0,
    lastActive: "Just now",
  };
}

/**
 * Real Supabase Sign-In with Email & Password.
 */
export async function supabaseSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Supabase client is not configured. Please check your Supabase URL & Anon Key in Admin Settings or .env.",
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "No user account returned from Supabase authentication." };
    }

    const lmsUser = mapSupabaseUserToLmsUser(data.user);
    StorageService.login(lmsUser);

    return { success: true, user: lmsUser };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected Supabase error occurred." };
  }
}

/**
 * Real Supabase Sign-Up with Email, Password & User Profile Metadata.
 */
export async function supabaseSignUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = "student",
  department?: string
): Promise<{ success: boolean; user?: User; needsEmailVerification?: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: "Supabase client is not configured. Please check your Supabase URL & Anon Key.",
    };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
          department: department?.trim() || (role === "student" ? "General Studies" : "Faculty Department"),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to create user in Supabase." };
    }

    const lmsUser = mapSupabaseUserToLmsUser(data.user);

    // If email confirmation is enabled in Supabase project and no active session yet
    const needsEmailVerification = !data.session && data.user.identities && data.user.identities.length > 0;

    if (!needsEmailVerification) {
      StorageService.login(lmsUser);
    }

    return {
      success: true,
      user: lmsUser,
      needsEmailVerification,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An error occurred during registration." };
  }
}

/**
 * Real Supabase Sign-Out.
 */
export async function supabaseSignOut(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout warning:", e);
    }
  }
  StorageService.logout();
}

/**
 * Restore active Supabase session if one exists.
 */
export async function supabaseGetSession(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.user) {
      return null;
    }
    const lmsUser = mapSupabaseUserToLmsUser(data.session.user);
    return lmsUser;
  } catch {
    return null;
  }
}

/**
 * Send Password Reset Email via Supabase Auth.
 */
export async function supabaseResetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    const { error } = await client.auth.resetPasswordForEmail(email.trim());
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send reset email." };
  }
}

/**
 * Live test of Supabase connection & Auth service.
 */
export async function testSupabaseAuth(): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  url: string;
}> {
  const { url, anonKey, isConfigured } = getEffectiveSupabaseConfig();
  if (!isConfigured || !url || !anonKey) {
    return {
      success: false,
      latencyMs: 0,
      message: "Supabase URL and Anon Key must be provided and not empty.",
      url: url || "Not set",
    };
  }

  const start = performance.now();
  try {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Client initialization failed.");
    }

    // Ping Supabase Auth service
    const { error } = await client.auth.getSession();
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return {
        success: false,
        latencyMs,
        message: `Supabase Auth error: ${error.message}`,
        url,
      };
    }

    return {
      success: true,
      latencyMs,
      message: `Supabase Auth API connected and responding (${latencyMs}ms). Authentication, token management, and user metadata are active.`,
      url,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: false,
      latencyMs,
      message: `Failed to connect to Supabase: ${err.message}`,
      url,
    };
  }
}
