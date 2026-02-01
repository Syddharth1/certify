import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= Input Validation =============

interface SendCertificateInput {
  recipientEmail: string;
  recipientName: string;
  certificateTitle: string;
  certificateData: string;
  senderName?: string;
  message?: string;
  certificateId?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: SendCertificateInput;
}

/**
 * Validate and sanitize input data
 * Returns validated data or error message
 */
function validateInput(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const data = input as Record<string, unknown>;

  // Validate recipientEmail
  if (!data.recipientEmail || typeof data.recipientEmail !== 'string') {
    return { valid: false, error: 'recipientEmail is required' };
  }
  const email = data.recipientEmail.trim();
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Validate recipientName
  if (!data.recipientName || typeof data.recipientName !== 'string') {
    return { valid: false, error: 'recipientName is required' };
  }
  const recipientName = data.recipientName.trim();
  if (recipientName.length === 0 || recipientName.length > 255) {
    return { valid: false, error: 'recipientName must be 1-255 characters' };
  }

  // Validate certificateTitle
  if (!data.certificateTitle || typeof data.certificateTitle !== 'string') {
    return { valid: false, error: 'certificateTitle is required' };
  }
  const certificateTitle = data.certificateTitle.trim();
  if (certificateTitle.length === 0 || certificateTitle.length > 500) {
    return { valid: false, error: 'certificateTitle must be 1-500 characters' };
  }

  // Validate certificateData (base64)
  if (!data.certificateData || typeof data.certificateData !== 'string') {
    return { valid: false, error: 'certificateData is required' };
  }
  const certificateData = data.certificateData;
  // Basic base64 validation - check format and reasonable size (max ~10MB encoded)
  if (!/^[A-Za-z0-9+/=]+$/.test(certificateData) || certificateData.length > 15000000) {
    return { valid: false, error: 'Invalid certificate data format' };
  }

  // Validate optional senderName
  let senderName: string | undefined;
  if (data.senderName !== undefined && data.senderName !== null) {
    if (typeof data.senderName !== 'string') {
      return { valid: false, error: 'senderName must be a string' };
    }
    senderName = data.senderName.trim();
    if (senderName.length > 255) {
      return { valid: false, error: 'senderName must be 255 characters or less' };
    }
    if (senderName.length === 0) senderName = undefined;
  }

  // Validate optional message
  let message: string | undefined;
  if (data.message !== undefined && data.message !== null) {
    if (typeof data.message !== 'string') {
      return { valid: false, error: 'message must be a string' };
    }
    message = data.message.trim();
    if (message.length > 2000) {
      return { valid: false, error: 'message must be 2000 characters or less' };
    }
    if (message.length === 0) message = undefined;
  }

  // Validate optional certificateId
  let certificateId: string | undefined;
  if (data.certificateId !== undefined && data.certificateId !== null) {
    if (typeof data.certificateId !== 'string') {
      return { valid: false, error: 'certificateId must be a string' };
    }
    certificateId = data.certificateId.trim();
    if (certificateId.length > 100) {
      return { valid: false, error: 'certificateId must be 100 characters or less' };
    }
    if (certificateId.length === 0) certificateId = undefined;
  }

  return {
    valid: true,
    data: {
      recipientEmail: email,
      recipientName,
      certificateTitle,
      certificateData,
      senderName,
      message,
      certificateId,
    },
  };
}

/**
 * Sanitize text for safe HTML display - prevents XSS
 */
function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

/**
 * Create sanitized error response - never expose internal details
 */
function createErrorResponse(error: unknown, corsHeaders: Record<string, string>): Response {
  // Log detailed error server-side only
  console.error("Error in send-certificate function:", error);
  
  // Determine appropriate error code and message
  const message = error instanceof Error ? error.message : String(error);
  let clientMessage = 'An error occurred while processing your request';
  let status = 500;

  if (message.includes('Unauthorized') || message.includes('authorization')) {
    clientMessage = 'Authentication required';
    status = 401;
  } else if (message.includes('Invalid') || message.includes('required')) {
    clientMessage = 'Invalid input data';
    status = 400;
  }

  return new Response(
    JSON.stringify({ 
      success: false, 
      error: clientMessage 
    }),
    { status, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// ============= Main Handler =============

const handler = async (req: Request): Promise<Response> => {
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

    // Parse and validate input
    const rawInput = await req.json();
    const validation = validateInput(rawInput);
    
    if (!validation.valid || !validation.data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.error || 'Invalid input' 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { 
      recipientEmail, 
      recipientName, 
      certificateTitle, 
      certificateData,
      senderName,
      message,
      certificateId 
    } = validation.data;

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
      console.error('Failed to save certificate:', saveError);
      throw new Error('Failed to save certificate');
    }

    console.log("Certificate saved successfully:", certificate.id);

    // Trigger blockchain timestamping (fire and forget)
    try {
      const timestampResponse = await fetch(`${supabaseUrl}/functions/v1/timestamp-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          action: 'create',
          certificateId: certificate.id,
        }),
      });
      
      if (timestampResponse.ok) {
        console.log("Blockchain timestamp initiated for certificate:", certificate.id);
      } else {
        console.error("Failed to initiate blockchain timestamp");
      }
    } catch (timestampError) {
      console.error("Error initiating blockchain timestamp:", timestampError);
      // Don't fail the certificate creation if timestamping fails
    }

    // Generate QR code for verification
    const verificationUrl = `https://certify-cert.vercel.app/certificate/${verificationId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

    // Send email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Escape user-provided content for safe HTML display
    const safeRecipientName = escapeHtml(recipientName);
    const safeCertificateTitle = escapeHtml(certificateTitle);
    const safeSenderName = senderName ? escapeHtml(senderName) : undefined;
    const safeMessage = message ? escapeHtml(message) : undefined;
    
    try {
      const emailResponse = await resend.emails.send({
        from: "Certificate System <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Your Certificate: ${safeCertificateTitle}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #333; margin-bottom: 20px;">Congratulations ${safeRecipientName}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You have received a certificate: <strong>${safeCertificateTitle}</strong>
            </p>
            ${safeSenderName ? `<p style="color: #666; font-size: 16px;">From: ${safeSenderName}</p>` : ''}
            ${safeMessage ? `<p style="color: #666; font-size: 16px; font-style: italic;">"${safeMessage}"</p>` : ''}
            
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

      console.log("Email sent successfully");

      return new Response(
        JSON.stringify({ 
          success: true, 
          certificateId: certificate.id,
          message: "Certificate saved and email sent successfully!"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Still return success since certificate was saved
      return new Response(
        JSON.stringify({ 
          success: true, 
          certificateId: certificate.id,
          message: "Certificate saved successfully, but email delivery is pending."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error) {
    return createErrorResponse(error, corsHeaders);
  }
};

serve(handler);
