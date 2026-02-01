import { useState, useEffect } from "react";
import { Link2, Clock, CheckCircle2, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface BlockchainStatusProps {
  verificationId: string;
  variant?: "full" | "badge" | "inline";
  className?: string;
}

interface BlockchainData {
  hasBlockchainProof: boolean;
  status?: "pending" | "confirmed";
  hash?: string;
  timestamp?: string;
  txId?: string;
  message?: string;
  explorerUrl?: string;
}

export const BlockchainStatus = ({ 
  verificationId, 
  variant = "full",
  className = ""
}: BlockchainStatusProps) => {
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockchainStatus = async () => {
      if (!verificationId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('timestamp-certificate', {
          body: { action: 'verify', verificationId }
        });

        if (error) throw error;
        setBlockchainData(data);
      } catch (err: any) {
        console.error("Error fetching blockchain status:", err);
        setError("Failed to fetch blockchain status");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainStatus();
  }, [verificationId]);

  // Badge variant - compact status indicator
  if (variant === "badge") {
    if (loading) {
      return (
        <Badge variant="outline" className={`text-muted-foreground ${className}`}>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Checking...
        </Badge>
      );
    }

    if (!blockchainData?.hasBlockchainProof) {
      return null; // Don't show anything if no blockchain proof
    }

    if (blockchainData.status === "confirmed") {
      return (
        <Badge variant="outline" className={`text-success border-success bg-success/10 ${className}`}>
          <Link2 className="h-3 w-3 mr-1" />
          On-Chain
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className={`text-warning border-warning bg-warning/10 ${className}`}>
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  }

  // Inline variant - minimal inline display
  if (variant === "inline") {
    if (loading) {
      return (
        <span className={`inline-flex items-center text-sm text-muted-foreground ${className}`}>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Checking blockchain...
        </span>
      );
    }

    if (!blockchainData?.hasBlockchainProof) {
      return (
        <span className={`inline-flex items-center text-sm text-muted-foreground ${className}`}>
          <AlertCircle className="h-3 w-3 mr-1" />
          No blockchain proof
        </span>
      );
    }

    if (blockchainData.status === "confirmed") {
      return (
        <span className={`inline-flex items-center text-sm text-success ${className}`}>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Anchored to Bitcoin
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center text-sm text-warning ${className}`}>
        <Clock className="h-3 w-3 mr-1" />
        Awaiting confirmation
      </span>
    );
  }

  // Full variant - complete card with all details
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Checking blockchain status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-destructive/50 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!blockchainData?.hasBlockchainProof) {
    return (
      <Card className={`border-muted ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-muted rounded-full">
              <Link2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Blockchain Verification</h3>
              <p className="text-sm text-muted-foreground">
                This certificate has not been anchored to the blockchain yet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isConfirmed = blockchainData.status === "confirmed";

  return (
    <Card className={`${isConfirmed ? "border-success bg-success/5" : "border-warning bg-warning/5"} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${isConfirmed ? "bg-success/20" : "bg-warning/20"}`}>
            {isConfirmed ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <Clock className="h-6 w-6 text-warning" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">
                {isConfirmed ? "Blockchain Verified" : "Blockchain Pending"}
              </h3>
              <Badge 
                variant="outline" 
                className={isConfirmed 
                  ? "text-success border-success" 
                  : "text-warning border-warning"
                }
              >
                {isConfirmed ? "Confirmed" : "Pending"}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {isConfirmed 
                ? "This certificate has been permanently anchored to the Bitcoin blockchain via OpenTimestamps."
                : blockchainData.message || "Proof submitted, awaiting Bitcoin blockchain confirmation (typically 1-2 hours)."
              }
            </p>

            <div className="space-y-2 text-sm">
              {blockchainData.hash && (
                <div>
                  <span className="text-muted-foreground">Hash: </span>
                  <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded break-all">
                    {blockchainData.hash}
                  </code>
                </div>
              )}
              
              {blockchainData.timestamp && (
                <div>
                  <span className="text-muted-foreground">Timestamp: </span>
                  <span>{new Date(blockchainData.timestamp).toLocaleString()}</span>
                </div>
              )}
              
              {blockchainData.txId && (
                <div>
                  <span className="text-muted-foreground">Transaction ID: </span>
                  <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                    {blockchainData.txId}
                  </code>
                </div>
              )}
            </div>

            {isConfirmed && blockchainData.explorerUrl && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.open(blockchainData.explorerUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on OpenTimestamps
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for quick status badge in lists
export const BlockchainStatusBadge = ({ 
  status,
  className = ""
}: { 
  status?: string | null;
  className?: string;
}) => {
  if (!status) return null;

  if (status === "confirmed") {
    return (
      <Badge variant="outline" className={`text-success border-success bg-success/10 ${className}`}>
        <Link2 className="h-3 w-3 mr-1" />
        On-Chain
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge variant="outline" className={`text-warning border-warning bg-warning/10 ${className}`}>
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  }

  return null;
};

export default BlockchainStatus;
