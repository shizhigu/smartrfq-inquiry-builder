
import { useAppStore } from "@/stores/appStore";
import { useProjectStore } from "@/stores/projectStore";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  FolderOpen, 
  FileText, 
  Users, 
  Mail, 
  Settings, 
  BarChart, 
  Menu,
  ChevronRight,
  ChevronLeft,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const projects = useProjectStore(state => state.projects);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      name: "Projects",
      path: "/dashboard/projects",
      icon: <FolderOpen size={20} />,
    },
    {
      name: "RFQ Items",
      path: "/dashboard/rfq",
      icon: <FileText size={20} />,
      disabled: !selectedProjectId,
    },
    {
      name: "Suppliers",
      path: "/dashboard/suppliers",
      icon: <Users size={20} />,
      disabled: !selectedProjectId,
    },
    {
      name: "Emails",
      path: "/dashboard/emails",
      icon: <Mail size={20} />,
      disabled: !selectedProjectId,
    },
    {
      name: "Reports",
      path: "/dashboard/reports",
      icon: <BarChart size={20} />,
      beta: true,
    },
    {
      name: "Manage Subscription",
      path: "/dashboard/subscription",
      icon: <CreditCard size={20} />,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: <Settings size={20} />,
    },
  ];

  const isCurrentPath = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/dashboard";
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full border-r border-border bg-card text-card-foreground transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border h-16">
        {!collapsed && (
          <div className="font-semibold text-lg">
            <span className="text-brand-blue">Smart</span>RFQ
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full p-0 w-8 h-8"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      {selectedProjectId && !collapsed && (
        <div className="bg-muted/50 p-3 text-sm border-b border-border">
          <div className="font-medium truncate">{selectedProject?.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {selectedProject?.description || "No description"}
          </div>
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto py-2">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.disabled ? "#" : item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                isCurrentPath(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                collapsed && "justify-center"
              )}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                }
              }}
            >
              {item.icon}
              {!collapsed && (
                <div className="ml-3 flex items-center justify-between w-full">
                  <span>{item.name}</span>
                  {item.beta && (
                    <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full ml-1">
                      Beta
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-3 border-t border-border">
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Menu size={16} />
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="text-sm font-medium">Menu</div>
              <div className="text-xs text-muted-foreground">More options</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
