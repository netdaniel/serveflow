// Supabase Edge Function: Send Welcome Email to New Organizations
// This function sends a welcome email when a new organization is registered

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get request body
    const { orgId, adminEmail, adminName, orgName } = await req.json()

    if (!orgId || !adminEmail || !adminName || !orgName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if welcome email was already sent
    const { data: existingLog } = await supabaseClient
      .from('welcome_email_log')
      .select('*')
      .eq('org_id', orgId)
      .eq('email_sent', true)
      .single()

    if (existingLog) {
      return new Response(
        JSON.stringify({ message: 'Welcome email already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Email configuration - using Resend (recommended) or SMTP
    // Option 1: Using Resend (recommended for Supabase)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    // Option 2: Using SMTP (alternative)
    const SMTP_HOST = Deno.env.get('SMTP_HOST')
    const SMTP_PORT = Deno.env.get('SMTP_PORT')
    const SMTP_USER = Deno.env.get('SMTP_USER')
    const SMTP_PASS = Deno.env.get('SMTP_PASS')

    let emailSent = false
    let errorMessage = null

    // Welcome email HTML template
    const welcomeEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ServeFlow</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            width: 80px;
            height: 80px;
            border-radius: 12px;
        }
        h1 {
            color: #1e3a5f;
            font-size: 28px;
            margin-bottom: 20px;
            text-align: center;
        }
        .welcome-message {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 30px;
            text-align: center;
        }
        .org-info {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            border-left: 4px solid #3b82f6;
        }
        .org-info h3 {
            margin-top: 0;
            color: #1e3a5f;
        }
        .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .features {
            margin: 30px 0;
        }
        .features h3 {
            color: #1e3a5f;
            margin-bottom: 15px;
        }
        .features ul {
            list-style: none;
            padding: 0;
        }
        .features li {
            padding: 8px 0;
            padding-left: 28px;
            position: relative;
        }
        .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        .support {
            background-color: #fffbeb;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
            border-left: 4px solid #f59e0b;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="logo">
            <img src="https://serveflow.site/serveflow-logo.jpg" alt="ServeFlow Logo">
        </div>
        
        <h1>Welcome to ServeFlow!</h1>
        
        <p class="welcome-message">
            Hi ${adminName},<br>
            Thank you for choosing ServeFlow to manage your volunteer scheduling!
        </p>
        
        <div class="org-info">
            <h3>Your Organization</h3>
            <p><strong>${orgName}</strong></p>
            <p>Admin Email: ${adminEmail}</p>
        </div>
        
        <p style="text-align: center;">
            <a href="https://serveflow.site" class="cta-button">Get Started</a>
        </p>
        
        <div class="features">
            <h3>What you can do with ServeFlow:</h3>
            <ul>
                <li>Schedule volunteers for services and events</li>
                <li>Manage teams and ministry areas</li>
                <li>Track volunteer availability and assignments</li>
                <li>Send notifications to your team</li>
                <li>Share files and playlists for services</li>
                <li>Access from any device, anywhere</li>
            </ul>
        </div>
        
        <div class="support">
            <strong>Need Help?</strong><br>
            If you have any questions or need assistance getting started, 
            please don't hesitate to reach out to our support team.
        </div>
        
        <div class="footer">
            <p>Best regards,<br>The ServeFlow Team</p>
            <p style="margin-top: 20px; font-size: 12px;">
                © 2025 ServeFlow. All rights reserved.<br>
                <a href="https://serveflow.site">serveflow.site</a>
            </p>
        </div>
    </div>
</body>
</html>
    `

    const welcomeEmailText = `
Welcome to ServeFlow!

Hi ${adminName},

Thank you for choosing ServeFlow to manage your volunteer scheduling!

Your Organization: ${orgName}
Admin Email: ${adminEmail}

Get started: https://serveflow.site

What you can do with ServeFlow:
- Schedule volunteers for services and events
- Manage teams and ministry areas
- Track volunteer availability and assignments
- Send notifications to your team
- Share files and playlists for services
- Access from any device, anywhere

Need Help?
If you have any questions or need assistance getting started, please don't hesitate to reach out to our support team.

Best regards,
The ServeFlow Team

© 2025 ServeFlow. All rights reserved.
serveflow.site
    `

    try {
      // Try using Resend first
      if (RESEND_API_KEY) {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ServeFlow <welcome@serveflow.site>',
            to: adminEmail,
            subject: `Welcome to ServeFlow, ${adminName}!`,
            html: welcomeEmailHtml,
            text: welcomeEmailText,
          }),
        })

        if (resendResponse.ok) {
          emailSent = true
        } else {
          const errorData = await resendResponse.text()
          errorMessage = `Resend API error: ${errorData}`
        }
      }
      // Fallback to SMTP if Resend is not configured
      else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        // Note: SMTP sending would require a different approach in Deno
        // For now, we'll log that SMTP configuration is present
        errorMessage = 'SMTP configuration detected but not implemented. Please use Resend API.'
      }
      else {
        errorMessage = 'No email service configured. Please set up RESEND_API_KEY or SMTP credentials.'
      }
    } catch (emailError) {
      errorMessage = `Email sending error: ${emailError.message}`
    }

    // Log the email attempt
    const { error: logError } = await supabaseClient
      .from('welcome_email_log')
      .upsert({
        org_id: orgId,
        admin_email: adminEmail,
        admin_name: adminName,
        org_name: orgName,
        email_sent: emailSent,
        email_sent_at: emailSent ? new Date().toISOString() : null,
        error_message: errorMessage,
      }, {
        onConflict: 'org_id'
      })

    if (logError) {
      console.error('Error logging welcome email:', logError)
    }

    // Create notification for the admin
    if (emailSent) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: (await supabaseClient.auth.admin.listUsers()).data.users.find(u => u.email === adminEmail)?.id,
          org_id: orgId,
          type: 'welcome_email_sent',
          title: 'Welcome Email Sent',
          message: `A welcome email has been sent to ${adminEmail}.`,
          data: { org_id: orgId, email_sent: true }
        })
    }

    return new Response(
      JSON.stringify({
        success: emailSent,
        message: emailSent ? 'Welcome email sent successfully' : errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: emailSent ? 200 : 500,
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
