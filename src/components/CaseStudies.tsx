import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Users, Trophy } from "lucide-react";

const caseStudies = [
  {
    icon: Building2,
    title: "Corporate Training Programs",
    company: "Tech Corp Inc.",
    description: "Streamlined employee certification process, issuing 500+ certificates monthly",
    metrics: "85% time saved on certificate generation",
    category: "Enterprise",
  },
  {
    icon: GraduationCap,
    title: "Online Education Platform",
    company: "LearnHub Academy",
    description: "Automated course completion certificates for 10,000+ students",
    metrics: "100% automated delivery",
    category: "Education",
  },
  {
    icon: Users,
    title: "Professional Workshops",
    company: "Skill Masters",
    description: "Created branded certificates for workshop participants",
    metrics: "95% participant satisfaction",
    category: "Training",
  },
  {
    icon: Trophy,
    title: "Sports & Events",
    company: "City Marathon Committee",
    description: "Issued digital participation and achievement certificates",
    metrics: "3,000+ certificates in one day",
    category: "Events",
  },
];

export const CaseStudies = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 section-badge">Case Studies</Badge>
          <h2 className="text-4xl font-display font-bold text-foreground mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how organizations use Certify to streamline their certification processes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => {
            const Icon = study.icon;
            return (
              <Card
                key={index}
                className="certificate-card hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">
                        {study.category}
                      </Badge>
                      <CardTitle className="text-xl mb-1">{study.title}</CardTitle>
                      <CardDescription className="text-sm font-medium text-primary">
                        {study.company}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{study.description}</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-semibold text-foreground">
                      📊 {study.metrics}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
