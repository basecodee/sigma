import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RegisterRequest {
  username: string;
  password: string;
  full_name?: string;
  role?: "admin" | "user";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { username, password, full_name, role = "user" }: RegisterRequest =
      await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Username dan password harus diisi",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Password minimal 6 karakter",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Username sudah digunakan",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const email = `${username}@payment-dashboard.local`;

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          username: username,
          full_name: full_name || null,
        },
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: authError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Gagal membuat akun",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        username: username,
        full_name: full_name || null,
        role: role,
        is_active: true,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Gagal membuat profil pengguna",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        data: {
          id: authData.user.id,
          username: username,
          email: email,
          role: role,
          full_name: full_name || null,
        },
        message: "Akun berhasil dibuat",
      }),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Terjadi kesalahan saat membuat akun",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
