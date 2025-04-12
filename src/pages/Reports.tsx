import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, PieChart, Download, Calendar } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProjectStore } from "@/stores/projectStore";
import { 
  AreaChart, Area, 
  BarChart as RechartsBarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const monthlyRfqData = [
  { name: "Jan", count: 12 },
  { name: "Feb", count: 19 },
  { name: "Mar", count: 15 },
  { name: "Apr", count: 22 },
  { name: "May", count: 28 },
  { name: "Jun", count: 24 },
  { name: "Jul", count: 30 },
  { name: "Aug", count: 27 },
  { name: "Sep", count: 32 },
  { name: "Oct", count: 35 },
  { name: "Nov", count: 29 },
  { name: "Dec", count: 18 },
];

const supplierResponseData = [
  { name: "On Time", value: 68 },
  { name: "Late", value: 22 },
  { name: "No Response", value: 10 },
];

const categoryData = [
  { name: "Electronics", count: 42 },
  { name: "Mechanical", count: 28 },
  { name: "Electrical", count: 18 },
  { name: "Hardware", count: 12 },
  { name: "Software", count: 8 },
];

const COLORS = ['#8B5CF6', '#2563EB', '#D946EF', '#F97316', '#0EA5E9'];

export default function Reports() {
  const [dateRange, setDateRange] = useState("last6months");
  const [reportType, setReportType] = useState("overview");
  const { projects, selectedProjectId } = useProjectStore();
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    toast.info("Reports module is under development", {
      description: "Some features may not be fully functional",
      duration: 5000,
    });
  }, []);

  const handleExportReport = () => {
    alert("This would download a report in a real application");
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Reports & Analytics" 
        description={selectedProject 
          ? `Insights and analytics for ${selectedProject.name}` 
          : "View insights across your projects"}
      >
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </PageHeader>

      <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTitle className="text-amber-800 dark:text-amber-400">
          Under Development
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          The Reports & Analytics module is currently under development. Some features may not be fully functional.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last3months">Last 3 Months</SelectItem>
                <SelectItem value="last6months">Last 6 Months</SelectItem>
                <SelectItem value="lastyear">Last Year</SelectItem>
                <SelectItem value="alltime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue={selectedProjectId || "all"}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Report Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="suppliers">Supplier Performance</SelectItem>
                <SelectItem value="rfq">RFQ Analytics</SelectItem>
                <SelectItem value="categories">Categories Analysis</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="charts">
            <BarChart className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="tables">
            <Calendar className="h-4 w-4 mr-2" />
            Data Tables
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  RFQ Items by Month
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRfqData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8B5CF6" 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Supplier Response Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={supplierResponseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {supplierResponseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  RFQ Items by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  Summary Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Total RFQs</p>
                    <p className="text-3xl font-bold">246</p>
                    <p className="text-sm text-green-500">↑ 12% from last period</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <p className="text-3xl font-bold">82%</p>
                    <p className="text-sm text-green-500">↑ 4% from last period</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                    <p className="text-3xl font-bold">2.4d</p>
                    <p className="text-sm text-red-500">↓ 0.3d from last period</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Top Category</p>
                    <p className="text-3xl font-bold">Electronics</p>
                    <p className="text-sm text-muted-foreground">42% of all RFQs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tables">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Detailed data tables will be shown here. This view would include
                exportable tables with filterable data for detailed analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
