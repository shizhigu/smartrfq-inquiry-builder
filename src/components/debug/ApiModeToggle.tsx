
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMockData, setUseMockData } from "@/lib/config";
import { BugIcon } from "lucide-react";

export function ApiModeToggle() {
  const [isUsingMock, setIsUsingMock] = useState<boolean>(true);
  
  // Load current setting on component mount
  useEffect(() => {
    setIsUsingMock(useMockData());
  }, []);
  
  const handleToggle = (checked: boolean) => {
    setIsUsingMock(checked);
    setUseMockData(checked);
  };
  
  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-md">
      <BugIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <Label htmlFor="api-mode" className="text-sm font-medium">
          {isUsingMock ? "Using Mock Data" : "Using Real API"}
        </Label>
      </div>
      <Switch
        id="api-mode"
        checked={isUsingMock}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
