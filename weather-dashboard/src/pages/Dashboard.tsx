import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge,
  Eye,
  CloudRain,
  Sun,
  Leaf,
  BarChart3,
  Search,
  MapPin
} from "lucide-react";

const Dashboard = () => {
  const cities = [
    { name: "New York", country: "USA", temp: "18°C", humidity: "65%", aqi: 55, risk: "Medium", climate: "Humid Continental" },
    { name: "London", country: "UK", temp: "15°C", humidity: "75%", aqi: 40, risk: "Medium", climate: "Temperate Oceanic" },
    { name: "Tokyo", country: "Japan", temp: "25°C", humidity: "80%", aqi: 70, risk: "High", climate: "Humid Subtropical" },
    { name: "Mumbai", country: "India", temp: "28°C", humidity: "78%", aqi: 156, risk: "Very High", climate: "Tropical Wet" },
    { name: "São Paulo", country: "Brazil", temp: "22°C", humidity: "70%", aqi: 60, risk: "High", climate: "Humid Subtropical" },
    { name: "Cape Town", country: "South Africa", temp: "17°C", humidity: "72%", aqi: 30, risk: "Low", climate: "Mediterranean" }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "High": return "text-orange-400";
      case "Very High": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Green Climate Weather Dashboard
          </h1>
          <p className="text-muted-foreground">
            Powered by Federated Green AI Principles
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search city..." 
              className="pl-10 bg-input border-primary/30 focus:border-primary w-64"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-primary/30 text-primary">°C</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">°F</Button>
          </div>
        </div>
      </div>

      {/* Current Location Weather */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <MapPin className="w-5 h-5" />
            <span>New York, USA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Thermometer className="w-4 h-4" />
                <span className="text-sm">Temperature</span>
              </div>
              <p className="text-3xl font-bold text-foreground">18°C</p>
            </div>

            {/* Humidity */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Droplets className="w-4 h-4" />
                <span className="text-sm">Humidity</span>
              </div>
              <p className="text-3xl font-bold text-foreground">65%</p>
            </div>

            {/* Wind */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Wind className="w-4 h-4" />
                <span className="text-sm">Wind</span>
              </div>
              <p className="text-3xl font-bold text-foreground">15 km/h NW</p>
            </div>

            {/* Air Quality */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Air Quality</span>
              </div>
              <p className="text-3xl font-bold text-yellow-400">AQI: 55</p>
              <p className="text-xs text-muted-foreground">Moderate</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-primary/20">
            {/* Pressure */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Gauge className="w-4 h-4" />
                <span className="text-sm">Pressure</span>
              </div>
              <p className="text-xl font-semibold text-foreground">1012 hPa</p>
            </div>

            {/* UV Index */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Sun className="w-4 h-4" />
                <span className="text-sm">UV Index</span>
              </div>
              <p className="text-xl font-semibold text-foreground">4</p>
              <p className="text-xs text-muted-foreground">Moderate: Stay in shade, wear sunglasses & sunscreen</p>
            </div>

            {/* Precipitation */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <CloudRain className="w-4 h-4" />
                <span className="text-sm">Precipitation</span>
              </div>
              <p className="text-xl font-semibold text-foreground">0.1 mm</p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Visibility</span>
              </div>
              <p className="text-xl font-semibold text-foreground">10 km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Cities */}
        <div className="lg:col-span-2">
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Global Climate Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cities.map((city, index) => (
                  <Card key={index} className="bg-card/50 border-primary/10">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{city.name}</h3>
                          <p className="text-sm text-muted-foreground">{city.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">{city.temp}</p>
                          <p className="text-sm text-muted-foreground">Humidity: {city.humidity}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">AQI:</span>
                          <span className="text-sm font-medium text-yellow-400">{city.aqi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Climate:</span>
                          <span className="text-sm text-foreground">{city.climate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Risk:</span>
                          <span className={`text-sm font-medium ${getRiskColor(city.risk)}`}>{city.risk}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sustainability Metrics */}
        <div>
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Sustainability Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Leaf className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-muted-foreground">Renewable Energy</span>
                </div>
                <p className="text-2xl font-bold text-green-400">35%</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Carbon Footprint</span>
                </div>
                <p className="text-2xl font-bold text-primary">Medium</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-muted-foreground">Climate Risk</span>
                </div>
                <p className="text-2xl font-bold text-orange-400">Medium</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">Data Efficiency</span>
                </div>
                <p className="text-2xl font-bold text-accent">Good (Simulated)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;