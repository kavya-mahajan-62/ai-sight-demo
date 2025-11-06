import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    id: 'crowd-detection',
    title: 'Crowd Detection',
    description: 'Monitor crowd density and people count in real-time',
    icon: Users,
    status: 'Active',
    color: 'bg-gradient-primary',
    route: '/analytics?service=crowd',
  },
  {
    id: 'intrusion-detection',
    title: 'Intrusion Detection',
    description: 'Detect unauthorized access and boundary violations',
    icon: Shield,
    status: 'Active',
    color: 'bg-gradient-alert',
    route: '/analytics?service=intrusion',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage surveillance services</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.id}
            className="group cursor-pointer transition-all hover:shadow-card"
            onClick={() => navigate(service.route)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`rounded-xl p-3 ${service.color}`}>
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-success text-success">
                  <Activity className="mr-1 h-3 w-3" />
                  {service.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="mb-2">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </div>
              <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total People Detected Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,247</div>
            <p className="text-sm text-success">+12.5% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Intrusion Alerts Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <p className="text-sm text-warning">+5 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Cameras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Out of 5 total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
