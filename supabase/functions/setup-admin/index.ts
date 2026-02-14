import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const adminEmail = "vedantchavan@gmail.com";
    const adminPassword = "vedant@290180";

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find((u) => u.email === adminEmail);

    if (existingAdmin) {
      // Ensure admin role exists
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", existingAdmin.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!existingRole) {
        await supabaseAdmin.from("user_roles").insert({ user_id: existingAdmin.id, role: "admin" });
      }

      return new Response(JSON.stringify({ message: "Admin already exists", userId: existingAdmin.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    });

    if (createError) throw createError;

    // Assign admin role
    await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: "admin" });

    // Update profile display name
    await supabaseAdmin
      .from("profiles")
      .update({ display_name: "Admin" })
      .eq("id", newUser.user.id);

    return new Response(JSON.stringify({ message: "Admin created", userId: newUser.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
