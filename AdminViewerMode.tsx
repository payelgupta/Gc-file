import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";

const AdminViewerMode = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">
            ← ব্যাক
          </Button>
          <h1 className="text-xl font-bold text-foreground">ভিউয়ার মোড</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Button
              variant={device === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setDevice("desktop")}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "tablet" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setDevice("tablet")}
              title="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setDevice("mobile")}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
            <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> নতুন ট্যাবে খুলুন
            </a>
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-muted/50 p-4">
        <div
          className="h-full overflow-hidden rounded-lg border border-border bg-background shadow-lg transition-all duration-300"
          style={{ width: deviceWidths[device], maxWidth: "100%" }}
        >
          <iframe
            key={refreshKey}
            src={window.location.origin}
            className="h-full w-full border-0"
            title="Site Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminViewerMode;
