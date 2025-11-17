import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCertificateRequest {
  recipientEmail: string;
  recipientName: string;
  certificateTitle: string;
  certificateData: string; // Base64 image data
  senderName?: string;
  message?: string;
  certificateId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { 
      recipientEmail, 
      recipientName, 
      certificateTitle, 
      certificateData,
      senderName,
      message,
      certificateId 
    }: SendCertificateRequest = await req.json();

    // Use provided certificate ID or generate new one
    const verificationId = certificateId || `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Save certificate to database with consistent data format
    const imageDataUrl = `data:image/png;base64,${certificateData}`;
    const { data: certificate, error: saveError } = await supabase
      .from("certificates")
      .insert({
        user_id: user.id,
        title: certificateTitle,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        verification_id: verificationId,
        certificate_data: { 
          imageData: imageDataUrl,
          format: 'png',
          timestamp: new Date().toISOString()
        },
        certificate_url: `https://certify-cert.vercel.app/certificate/${verificationId}`
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save certificate: ${saveError.message}`);
    }

    console.log("Certificate saved successfully:", certificate.id);

    // Generate QR code for verification
    const verificationUrl = `https://certify-cert.vercel.app/certificate/${verificationId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

    // Send email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    try {
      const emailResponse = await resend.emails.send({
        from: "Certificate System <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Your Certificate: ${certificateTitle}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #333; margin-bottom: 20px;">Congratulations ${recipientName}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You have received a certificate: <strong>${certificateTitle}</strong>
            </p>
            ${senderName ? `<p style="color: #666; font-size: 16px;">From: ${senderName}</p>` : ''}
            ${message ? `<p style="color: #666; font-size: 16px; font-style: italic;">"${message}"</p>` : ''}
            
            <div style="margin: 30px 0; text-align: center;">
              <img src="data:image/png;base64,${certificateData}" alt="Certificate" style="max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 8px;" />
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Certificate Verification</h3>
              <p style="margin: 10px 0; color: #666;">Verification ID: <strong>${verificationId}</strong></p>
              <p style="margin: 10px 0; color: #666;">
                <a href="${verificationUrl}" style="color: #2563eb; text-decoration: none;">
                  View and Download Certificate
                </a>
              </p>
              <div style="text-align: center; margin: 15px 0;">
                <img src="${qrCodeUrl}" alt="QR Code for verification" style="border: 1px solid #ddd;" />
                <p style="font-size: 12px; color: #999; margin: 5px 0;">Scan QR code to verify</p>
              </div>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This certificate was sent through our secure certificate delivery system.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `${certificateTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
            content: certificateData,
          }
        ]
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          certificateId: certificate.id,
          emailId: emailResponse.data?.id,
          message: "Certificate saved and email sent successfully!"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      // Still return success since certificate was saved
      return new Response(
        JSON.stringify({ 
          success: true, 
          certificateId: certificate.id,
          message: "Certificate saved successfully, but email sending failed. Please check your Resend configuration.",
          emailError: emailError.message
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

  } catch (error: any) {
    console.error("Error in send-certificate function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);