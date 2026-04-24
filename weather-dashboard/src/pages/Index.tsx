// src/pages/Index.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, ArrowRight, BarChart3, Globe, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CitySearch from "../components/CitySearch"; // 👈 import the search component

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-3 focus:py-2 rounded"
      >
        Skip to content
      </a>

      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* === Decorative Background Layers (kept behind via CSS) === */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 bg-hero-radial" />
          <div className="absolute inset-0 bg-noise opacity-10" />
          <div className="absolute inset-0 leaf-layer" aria-hidden>
            <span className="leaf leaf-1" />
            <span className="leaf leaf-2" />
            <span className="leaf leaf-3" />
          </div>
        </div>

        {/* === Main content container with good spacing & contrast === */}
        <main
          id="main-content"
          role="main"
          className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:py-28 lg:py-36 w-full"
        >
          <div className="text-center">
            {/* Icon Badge */}
            <div
              className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center glow-primary"
              aria-hidden
            >
              <CloudSun className="w-12 h-12 text-primary" />
            </div>

            {/* Heading & Subtitle */}
            <div className="mt-6 space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                Green Climate Weather Dashboard
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Advanced weather insights powered by Federated Green AI Principles.
                Monitor global climate data with sustainability at the forefront.
              </p>
            </div>

            {/* === City Search goes here === */}
            <div className="mt-10">
              <CitySearch />
            </div>

            {/* Features Grid */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="glass-effect border-primary/20 glow-accent"
                role="region"
                aria-labelledby="feature-analytics"
              >
                <CardHeader className="text-center">
                  <BarChart3 className="w-8 h-8 text-primary mx-auto" />
                  <CardTitle id="feature-analytics" className="text-primary">
                    Real-time Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Access comprehensive weather data and air quality metrics from around the globe.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="glass-effect border-primary/20 glow-accent"
                role="region"
                aria-labelledby="feature-global"
              >
                <CardHeader className="text-center">
                  <Globe className="w-8 h-8 text-primary mx-auto" />
                  <CardTitle id="feature-global" className="text-primary">
                    Global Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Monitor climate conditions across major cities worldwide with detailed insights.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="glass-effect border-primary/20 glow-accent"
                role="region"
                aria-labelledby="feature-sustainability"
              >
                <CardHeader className="text-center">
                  <Leaf className="w-8 h-8 text-primary mx-auto" />
                  <CardTitle id="feature-sustainability" className="text-primary">
                    Sustainability Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Built with green AI principles to minimize environmental impact while maximizing insights.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="mt-12 space-y-6">
              <Button
                onClick={() => navigate("/login")}
                className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-8 py-3 text-lg glow-primary hover:glow-accent transition-all duration-200"
                aria-label="Access Dashboard"
              >
                Access Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-sm text-muted-foreground">
                Secure login required to access climate monitoring tools
              </p>
            </div>
          </div>
        </main>

        {/* Bottom Fade Overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black/40"
        />
      </div>
    </>
  );
};

export default Index;
