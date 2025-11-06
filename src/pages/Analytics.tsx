import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateMockPeopleData, generateMockIntrusionData } from '@/lib/mockData';
import { Users, Shield, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('today');
  const peopleData = generateMockPeopleData();
  const intrusionData = generateMockIntrusionData();

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Real-time insights and trends</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-primary p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Total People Detected</CardTitle>
                <CardDescription>Crowd Detection Service</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold">1,247</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="mr-1 h-4 w-4 text-success" />
                <span className="text-success">+12.5%</span>
                <span className="ml-1 text-muted-foreground">from yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-alert p-2">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Intrusion Alerts</CardTitle>
                <CardDescription>Intrusion Detection Service</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold">23</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="mr-1 h-4 w-4 text-warning" />
                <span className="text-warning">+5</span>
                <span className="ml-1 text-muted-foreground">from yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="crowd" className="space-y-6">
        <TabsList>
          <TabsTrigger value="crowd">Crowd Detection</TabsTrigger>
          <TabsTrigger value="intrusion">Intrusion Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="crowd" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>People Count Trend</CardTitle>
              <CardDescription>Hourly people detection over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={peopleData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intrusion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intrusion Frequency</CardTitle>
              <CardDescription>Daily intrusion alerts over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={intrusionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
