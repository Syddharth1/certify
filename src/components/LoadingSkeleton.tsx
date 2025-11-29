import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CertificateCardSkeleton = () => (
  <Card className="certificate-card">
    <CardContent className="p-0">
      <Skeleton className="w-full h-48" />
    </CardContent>
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  </Card>
);

export const DashboardStatSkeleton = () => (
  <Card className="certificate-card">
    <CardHeader className="pb-3">
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center">
        <Skeleton className="h-8 w-8 rounded-full mr-3" />
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const ListItemSkeleton = () => (
  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-6 w-20" />
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-border">
    <Skeleton className="h-4 w-full max-w-[200px]" />
    <Skeleton className="h-4 w-full max-w-[150px]" />
    <Skeleton className="h-4 w-full max-w-[100px]" />
    <Skeleton className="h-8 w-20" />
  </div>
);
