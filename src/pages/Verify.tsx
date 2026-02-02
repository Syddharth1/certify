import { useState, Suspense } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import QRScanner from "@/components/QRScanner";
import Navigation from "@/components/Navigation";
import { secureLogger, verificationCodeSchema, getSafeErrorMessage, sanitizeInput } from "@/lib/security";
import { Icon3D } from "@/components/3d/Icon3D";

const Verify = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleVerify = async () => {
    const trimmedCode = verificationCode.trim();
    if (!trimmedCode) return;
    
    const validationResult = verificationCodeSchema.safeParse(trimmedCode);
    if (!validationResult.success) {
      setVerificationResult({
        isValid: false,
        certificate: null,
        error: "Invalid verification code format. Please check and try again."
      });
      return;
    }
    
    const sanitizedCode = sanitizeInput(trimmedCode);
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const verifyPromise = supabase
        .rpc("verify_certificate_by_id", { verification_code: sanitizedCode });

      const { data: certificates, error } = await Promise.race([verifyPromise, timeoutPromise]) as any;

      if (error) throw error;

      const certificate = certificates && certificates.length > 0 ? certificates[0] : null;

      if (!certificate) {
        setVerificationResult({
          isValid: false,
          certificate: null,
          error: "Certificate not found with this verification ID"
        });
      } else {
        setVerificationResult({
          isValid: true,
          certificate: {
            id: certificate.verification_id,
            title: certificate.title,
            recipientName: certificate.recipient_name,
            issuedBy: "Certificate System",
            issueDate: certificate.issued_date ? new Date(certificate.issued_date).toLocaleDateString() : "Unknown",
            verificationDate: new Date().toLocaleString(),
            credentialId: certificate.verification_id,
            certificateUrl: `/certificate/${certificate.verification_id}`
          },
          error: null
        });
      }
    } catch (error: unknown) {
      secureLogger.error("Verification error:", error);
      const errorMessage = getSafeErrorMessage(error);
      setVerificationResult({
        isValid: false,
        certificate: null,
        error: errorMessage
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanQR = () => setShowQRScanner(true);

  const handleQRScanResult = (result: string) => {
    secureLogger.log("QR scan result received");
    let verificationId = result;
    if (result.includes('/certificate/')) {
      const parts = result.split('/certificate/');
      if (parts.length > 1) {
        verificationId = sanitizeInput(parts[1]);
      }
    } else {
      verificationId = sanitizeInput(result);
    }
    
    setVerificationCode(verificationId);
    setShowQRScanner(false);
    setTimeout(() => handleVerify(), 300);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent-gold/5 pt-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto p-8 relative z-10">
          {/* Hero Section with 3D Shield */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <Suspense fallback={
                <div className="w-32 h-32 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }>
                <Icon3D type="shield" size={160} color="#3b82f6" />
              </Suspense>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-primary via-primary to-accent-gold bg-clip-text text-transparent mb-6">
              Certificate Verification
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Instantly verify the authenticity of any certificate using our secure verification system
            </p>
          </div>

          {/* Verification Methods with 3D Icons */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <Card 
                className="group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all duration-500 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                onClick={handleScanQR}
              >
                <CardContent className="p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform duration-500">
                      <Suspense fallback={
                        <div className="w-24 h-24 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      }>
                        <Icon3D type="qr" size={100} color="#8b5cf6" />
                      </Suspense>
                    </div>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">Scan QR Code</h3>
                    <p className="text-muted-foreground">
                      Use your device camera to instantly scan and verify any certificate QR code
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group border-2 border-transparent hover:border-accent-gold/50 transition-all duration-500 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-accent-gold/10 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform duration-500">
                      <Suspense fallback={
                        <div className="w-24 h-24 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-accent-gold" />
                        </div>
                      }>
                        <Icon3D type="search" size={100} color="#f59e0b" />
                      </Suspense>
                    </div>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-accent-gold transition-colors">Enter Code</h3>
                    <p className="text-muted-foreground">
                      Manually enter the unique verification code found on your certificate
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verification Input */}
            <Card className="border-2 bg-card/90 backdrop-blur-sm shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Verify Your Certificate</CardTitle>
                <CardDescription className="text-base">
                  Enter the verification code to instantly check authenticity
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Enter verification code (e.g., CERT-2024-001)"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className="flex-1 h-14 text-lg px-6 border-2 focus:border-primary"
                  />
                  <Button
                    onClick={handleVerify}
                    disabled={!verificationCode.trim() || isVerifying}
                    className="h-14 px-10 text-lg font-semibold btn-hero"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Now"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Results */}
          {verificationResult && (
            <div className="max-w-3xl mx-auto mb-16 animate-fade-in">
              <Card className={`border-2 shadow-xl backdrop-blur-sm ${
                verificationResult.isValid 
                  ? "border-success bg-success/5" 
                  : "border-destructive bg-destructive/5"
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-6">
                    <Suspense fallback={null}>
                      <Icon3D 
                        type={verificationResult.isValid ? "check" : "shield"} 
                        size={80} 
                        color={verificationResult.isValid ? "#10b981" : "#ef4444"} 
                      />
                    </Suspense>
                    <div>
                      <CardTitle className={`text-2xl ${
                        verificationResult.isValid ? "text-success" : "text-destructive"
                      }`}>
                        {verificationResult.isValid ? "✓ Certificate Verified" : "✗ Verification Failed"}
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        {verificationResult.isValid 
                          ? "This certificate is authentic and valid"
                          : verificationResult.error
                        }
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                {verificationResult.isValid && verificationResult.certificate && (
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background/50 rounded-xl">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Certificate Title</label>
                          <p className="font-bold text-lg mt-1">{verificationResult.certificate.title}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recipient</label>
                          <p className="font-bold text-lg mt-1">{verificationResult.certificate.recipientName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Issued By</label>
                          <p className="font-bold text-lg mt-1">{verificationResult.certificate.issuedBy}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Issue Date</label>
                          <p className="font-bold text-lg mt-1">{verificationResult.certificate.issueDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
                        <div>
                          <p className="text-sm text-muted-foreground">Certificate ID</p>
                          <p className="font-mono text-sm font-medium">{verificationResult.certificate.id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Verified on {verificationResult.certificate.verificationDate}
                          </p>
                        </div>
                        <Badge className="bg-success text-success-foreground px-4 py-2 text-sm">
                          Verified ✓
                        </Badge>
                      </div>
                      
                      {verificationResult.certificate.certificateUrl && (
                        <Button 
                          className="w-full h-12 text-base btn-hero"
                          onClick={() => window.open(verificationResult.certificate.certificateUrl, '_blank')}
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          View & Download Certificate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* How It Works Section with 3D Icons */}
          <div className="max-w-5xl mx-auto py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold mb-4">How Verification Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our cutting-edge verification system ensures certificate authenticity through secure digital signatures
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <Suspense fallback={<div className="w-20 h-20" />}>
                      <Icon3D type="qr" size={100} color="#3b82f6" />
                    </Suspense>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">1</div>
                  <h3 className="font-bold text-lg mb-3">Scan or Enter</h3>
                  <p className="text-muted-foreground">
                    Use our QR scanner or manually enter the unique verification code from your certificate
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 bg-gradient-to-br from-accent-gold/5 to-accent-gold/10 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <Suspense fallback={<div className="w-20 h-20" />}>
                      <Icon3D type="database" size={100} color="#6366f1" />
                    </Suspense>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent-gold text-accent-gold-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">2</div>
                  <h3 className="font-bold text-lg mb-3">Secure Lookup</h3>
                  <p className="text-muted-foreground">
                    Our system instantly checks the certificate against our encrypted, tamper-proof database
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-0 bg-gradient-to-br from-success/5 to-success/10 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <Suspense fallback={<div className="w-20 h-20" />}>
                      <Icon3D type="check" size={100} color="#10b981" />
                    </Suspense>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">3</div>
                  <h3 className="font-bold text-lg mb-3">Instant Results</h3>
                  <p className="text-muted-foreground">
                    Get immediate verification with complete certificate details and authenticity status
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="max-w-4xl mx-auto text-center py-12 border-t border-border/50">
            <p className="text-muted-foreground mb-6">Trusted by organizations worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">🏛️ Universities</div>
              <div className="text-2xl font-bold text-muted-foreground">🏢 Corporations</div>
              <div className="text-2xl font-bold text-muted-foreground">🎓 Training Centers</div>
              <div className="text-2xl font-bold text-muted-foreground">🏥 Healthcare</div>
            </div>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner
            onScan={handleQRScanResult}
            onClose={() => setShowQRScanner(false)}
          />
        )}
      </div>
    </>
  );
};

export default Verify;
