// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { corsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ActionToRemind } from "../models/actions-to-remind.model.ts";
import { basicTemplate } from "../email-templates/basic.template.ts";
import { actionsRemindTemplate } from "../email-templates/actions-remind.template.ts";
import { greetingTemplate } from "../email-templates/greeting.template.ts";

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  try {    
    const result = await supabaseClient
      .from("actions_past_next_at")
      .select();
    
    if (result.error) {
      console.log("Error with query", result.error.message)
      return new Response(JSON.stringify({ error: result.error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { data: actionsToRemind }: { data: ActionToRemind[] } = result;
    const actionsByEmail: Record<string, ActionToRemind[]> = {};
    actionsToRemind.forEach((action) => {
      if (actionsByEmail[action.user_email]) {
        actionsByEmail[action.user_email].push(action);
      } else {
        actionsByEmail[action.user_email] =  [action];
      }
    });

    const emailsPromises = Object.entries(actionsByEmail).map((([email, actions]) => {
      return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Remarc reminder!',
          html: basicTemplate(
            greetingTemplate(actions[0].user_name),
            actionsRemindTemplate(actions)
          ),
        }),
      })
    }));

    try {
      await Promise.allSettled(emailsPromises);
    } catch (error) {
      console.log(error.message)
      return new Response(JSON.stringify({ error: "Error while sending email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    try {
      await supabaseClient.rpc("update_next_at_actions")
      .then((value) => {
        console.log("function called", value);
      });
    } catch (error) {
      console.log("Error updating actions next_at", error.message);
      return new Response(JSON.stringify({ error: "Error updating actions next_at" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ data: actionsToRemind }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.log("An error has ocurred", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // and here
      status: 400,
    })
  }
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
