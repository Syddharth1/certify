import { useState } from "react";
import { QrCode, Shield, CheckCircle, XCircle, Search, ExternalLink, Link2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import QRScanner from "@/components/QRScanner";
import Navigation from "@/components/Navigation";
import { BlockchainStatus } from "@/components/BlockchainStatus";

const Verify = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) return;
    
    setIsVerifying(true);
    setVerificationResult(null); // Clear previous results
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });

      // Use secure RPC function for verification - only returns necessary fields
      const verifyPromise = supabase
        .rpc("verify_certificate_by_id", { verification_code: verificationCode.trim() });

      const { data: certificates, error } = await Promise.race([verifyPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

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
            certificateUrl: `/certificate/${certificate.verification_id}`,
            blockchainStatus: certificate.blockchain_status,
            blockchainHash: certificate.blockchain_hash,
            blockchainTimestamp: certificate.blockchain_timestamp,
            blockchainTxId: certificate.blockchain_tx_id
          },
          error: null
        });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorMessage = error.message === 'Request timeout' 
        ? "Request timed out. Please check your connection and try again."
        : "Failed to verify certificate. Please try again.";
      
      setVerificationResult({
        isValid: false,
        certificate: null,
        error: errorMessage
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanQR = () => {
    setShowQRScanner(true);
  };

  const handleQRScanResult = (result: string) => {
    console.log("QR scan result:", result);
    
    // Extract verification ID from URL if it's a full URL
    let verificationId = result;
    if (result.includes('/certificate/')) {
      const parts = result.split('/certificate/');
      if (parts.length > 1) {
        verificationId = parts[1];
      }
    }
    
    setVerificationCode(verificationId);
    setShowQRScanner(false);
    
    // Auto-verify after scanning with a slight delay
    setTimeout(() => {
      handleVerify();
    }, 300);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-subtle pt-20">
        <div className="container mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            Certificate Verification
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify the authenticity of certificates by scanning QR codes or entering verification codes
          </p>
        </div>

        {/* Verification Methods */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="certificate-card cursor-pointer" onClick={handleScanQR}>
              <CardContent className="p-6 text-center">
                <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Scan QR Code</h3>
                <p className="text-muted-foreground text-sm">
                  Use your device camera to scan the QR code on the certificate
                </p>
              </CardContent>
            </Card>

            <Card className="certificate-card">
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Enter Code</h3>
                <p className="text-muted-foreground text-sm">
                  Manually enter the verification code found on the certificate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Manual Verification */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Verification</CardTitle>
              <CardDescription>
                Enter the verification code to check certificate authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter verification code (e.g., CERT-2024-001)"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleVerify}
                  disabled={!verificationCode.trim() || isVerifying}
                  className="btn-hero"
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Results */}
        {verificationResult && (
          <div className="max-w-2xl mx-auto">
            <Card className={`${
              verificationResult.isValid 
                ? "border-success bg-success/5" 
                : "border-destructive bg-destructive/5"
            }`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {verificationResult.isValid ? (
                    <CheckCircle className="h-8 w-8 text-success" />
                  ) : (
                    <XCircle className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <CardTitle className={
                      verificationResult.isValid ? "text-success" : "text-destructive"
                    }>
                      {verificationResult.isValid ? "Certificate Verified" : "Verification Failed"}
                    </CardTitle>
                    <CardDescription>
                      {verificationResult.isValid 
                        ? "This certificate is authentic and valid"
                        : verificationResult.error
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {verificationResult.isValid && verificationResult.certificate && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Certificate Title</label>
                        <p className="font-semibold">{verificationResult.certificate.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Recipient</label>
                        <p className="font-semibold">{verificationResult.certificate.recipientName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Issued By</label>
                        <p className="font-semibold">{verificationResult.certificate.issuedBy}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                        <p className="font-semibold">{verificationResult.certificate.issueDate}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Certificate ID</p>
                          <p className="font-mono text-sm">{verificationResult.certificate.id}</p>
                        </div>
                        <Badge variant="outline" className="text-success border-success">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Verified on {verificationResult.certificate.verificationDate}
                      </p>
                      {verificationResult.certificate.certificateUrl && (
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(verificationResult.certificate.certificateUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View & Download Certificate
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Blockchain Verification Section */}
                    <div className="pt-4 border-t border-border">
                      <BlockchainStatus 
                        verificationId={verificationResult.certificate.id} 
                        variant="full" 
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold mb-4">How Verification Works</h2>
            <p className="text-muted-foreground">
              Our verification system ensures certificate authenticity through secure digital signatures
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <QrCode className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Scan or Enter</h3>
                <p className="text-sm text-muted-foreground">
                  Use QR code scanner or manually enter the verification code
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Search className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Database Check</h3>
                <p className="text-sm text-muted-foreground">
                  Our system checks the certificate against our secure database
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get immediate verification results with detailed certificate information
                </p>
              </CardContent>
            </Card>
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
      </div>
    </>
  );
};

export default Verify;