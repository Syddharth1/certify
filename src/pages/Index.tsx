import { Award, Shield, Sparkles, Users, Code, FileCheck, QrCode, Palette, Download, ChevronDown, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

import { SkipToContent } from "@/components/SkipToContent";

// 3D Icons for feature cards
import iconTemplates from "@/assets/icon-templates.png";
import iconVerification from "@/assets/icon-verification.png";
import iconEasy from "@/assets/icon-easy.png";

// How It Works images
import howItWorksCreate from "@/assets/how-it-works-create.png";
import howItWorksSend from "@/assets/how-it-works-send.png";
import howItWorksVerify from "@/assets/how-it-works-verify.png";

const Index = () => {
  const { user } = useAuth();

  const teamMembers = [
    {
      name: "Jai Marcony C. Torrefranca",
      role: "Programmer",
      icon: Code,
    },
    {
      name: "Jhon Angelo Lanojan",
      role: "System Analyst",
      icon: Users,
    },
    {
      name: "Mico Guzman",
      role: "Documents",
      icon: FileCheck,
    },
  ];

  const technologies = [
    { name: "React", description: "Modern UI Library" },
    { name: "TypeScript", description: "Type-safe JavaScript" },
    { name: "Tailwind CSS", description: "Utility-first CSS" },
    { name: "Supabase", description: "Backend as a Service" },
    { name: "Vite", description: "Fast Build Tool" },
    { name: "Fabric.js", description: "Canvas Library" },
  ];

  const services = [
    {
      icon: Palette,
      title: "Custom Certificate Design",
      description: "Create beautiful certificates with our intuitive drag-and-drop editor and professional templates.",
    },
    {
      icon: QrCode,
      title: "QR Code Verification",
      description: "Every certificate includes a unique QR code for instant verification and authenticity.",
    },
    {
      icon: Download,
      title: "Multiple Export Formats",
      description: "Download your certificates in various formats including PDF, PNG, and more.",
    },
    {
      icon: Shield,
      title: "Secure Certificate Management",
      description: "Manage all your certificates securely with user authentication and access control.",
    },
  ];

  const faqs = [
    {
      question: "How do I create my first certificate?",
      answer: "Simply sign up for a free account, browse our template library, select a design, and use our drag-and-drop editor to customize it. You can add text, images, and your logo in minutes."
    },
    {
      question: "Can I verify certificates created on your platform?",
      answer: "Yes! Every certificate includes a unique QR code that can be scanned to instantly verify its authenticity. Recipients and employers can verify certificates through our verification page."
    },
    {
      question: "What export formats are available?",
      answer: "You can export your certificates in multiple formats including PDF for printing, PNG for digital sharing, and high-resolution formats for professional use."
    },
    {
      question: "Can I create my own templates?",
      answer: "Absolutely! You can create custom templates from scratch using our editor, save them for future use, and even share them with your team or organization."
    },
    {
      question: "Is there a limit to how many certificates I can create?",
      answer: "Our free plan allows you to create unlimited certificates. Premium plans offer additional features like custom branding, advanced templates, and bulk certificate generation."
    },
    {
      question: "How secure is the certificate verification system?",
      answer: "Our verification system uses unique cryptographic IDs for each certificate. All data is encrypted and stored securely, ensuring the authenticity and integrity of every certificate."
    }
  ];
  
  return (
    <>
    <SkipToContent />
    <div className="min-h-screen" id="main-content">
      <Navigation />
      
      {/* Enhanced Hero Section with Color Bends Background */}
      <section className="color-bends-bg text-white py-32 md:py-40 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-fade-in">
              <Sparkles className="h-4 w-4 text-accent-gold" />
              <span className="text-sm font-medium tracking-wide">Trusted by 10,000+ Organizations Worldwide</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.1] tracking-tight animate-fade-in">
              Create, Verify & Share<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-white to-accent-gold animate-pulse">Professional Certificates</span>
            </h1>
            
            {/* Value Proposition */}
            <p className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in">
              The all-in-one platform for creating tamper-proof digital certificates with instant QR verification.
            </p>
            <p className="text-base md:text-lg text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Design stunning certificates in minutes, not hours. Our drag-and-drop editor and professional templates make it effortless to create, distribute, and verify credentials.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-white/60 animate-fade-in">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-accent-gold" />
                <span>50+ Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary-glow" />
                <span>1M+ Certificates Issued</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="group bg-white text-primary hover:bg-white/95 px-8 py-6 text-lg rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      Go to Dashboard
                      <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/templates">
                    <Button size="lg" variant="outline" className="border-2 border-white/30 bg-white/5 backdrop-blur-md text-white hover:bg-white/15 hover:border-white/50 px-8 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                      Browse Templates
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="group bg-white text-primary hover:bg-white/95 px-8 py-6 text-lg rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      Start Creating for Free
                      <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/templates">
                    <Button size="lg" variant="outline" className="border-2 border-white/30 bg-white/5 backdrop-blur-md text-white hover:bg-white/15 hover:border-white/50 px-8 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                      View Templates
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <p className="mt-6 text-sm text-white/50">No credit card required • Free forever plan • Setup in 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">Features</span>
            </div>
            <h2 className="text-5xl font-display font-bold text-foreground mb-6">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the power of modern certificate creation with our advanced features
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-10 text-center">
                <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <img src={iconTemplates} alt="Professional Templates" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Professional Templates</h3>
                <p className="text-muted-foreground leading-relaxed">Choose from dozens of professionally designed certificate templates</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-10 text-center">
                <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <img src={iconVerification} alt="QR Verification" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">QR Verification</h3>
                <p className="text-muted-foreground leading-relaxed">Built-in QR codes ensure your certificates are authentic and verifiable</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-10 text-center">
                <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <img src={iconEasy} alt="Easy to Use" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Easy to Use</h3>
                <p className="text-muted-foreground leading-relaxed">Intuitive drag-and-drop editor makes certificate creation effortless</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
        {/* Decorative dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">How It Works</span>
            </div>
            <h2 className="text-5xl font-display font-bold text-foreground mb-6">Three Simple Steps</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From design to verification, our streamlined process makes certificate management effortless
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-24">
            {/* Step 1: Create */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <span className="text-6xl font-display font-bold text-primary/20 absolute -mt-16 -ml-4">01</span>
                <h3 className="text-4xl font-display font-bold text-foreground mb-4">Create</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Choose from 100+ professionally designed templates or build from scratch with our intuitive AI-powered editor. Customize every detail to match your brand identity.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Drag-and-drop editor</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Custom branding options</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Professional templates</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-gradient-to-br from-muted/50 to-background">
                  <img 
                    src={howItWorksCreate} 
                    alt="Certificate Editor Interface" 
                    className="w-full h-auto"
                  />
                  <span className="absolute bottom-6 left-6 text-6xl font-display font-bold text-primary/50">01</span>
                </div>
              </div>
            </div>

            {/* Step 2: Send */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-gradient-to-br from-muted/50 to-background">
                  <img 
                    src={howItWorksSend} 
                    alt="Send Certificate Dialog" 
                    className="w-full h-auto"
                  />
                  <span className="absolute bottom-6 left-6 text-6xl font-display font-bold text-primary/50">02</span>
                </div>
              </div>
              <div className="lg:border-l lg:border-border/30 lg:pl-12">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-4xl font-display font-bold text-foreground mb-4">Send</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Distribute certificates instantly via email, SMS, or direct download. Track delivery status and recipient engagement in real-time with our advanced analytics dashboard.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Lightning fast delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Secure & encrypted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Real-time tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Verify */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <QrCode className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-4xl font-display font-bold text-foreground mb-4">Verify</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Recipients and verifiers can instantly authenticate certificates by scanning the unique QR code. Powered by secure cryptographic technology for unparalleled security and trust.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Instant verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Tamper-proof records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground">Global accessibility</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative lg:border-l lg:border-border/30 lg:pl-12">
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-gradient-to-br from-muted/50 to-background">
                  <img 
                    src={howItWorksVerify} 
                    alt="Certificate Verification Page" 
                    className="w-full h-auto"
                  />
                  <span className="absolute bottom-6 left-6 text-6xl font-display font-bold text-primary/50">03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">Team</span>
            </div>
            <h2 className="text-5xl font-display font-bold text-foreground mb-6">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The talented individuals behind this innovative certificate platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 overflow-hidden">
                <CardContent className="p-10 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                      <member.icon className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>
                    <p className="text-primary font-semibold">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section - Infinite Slider */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">Technology Stack</span>
            </div>
            <h2 className="text-5xl font-display font-bold text-foreground mb-6">Built with Modern Technologies</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Powered by cutting-edge technologies for optimal performance and reliability
            </p>
          </div>
          <div className="tech-slider">
            <div className="tech-slider-track">
              {/* First set of technologies */}
              {technologies.map((tech, index) => (
                <Card key={`tech-1-${index}`} className="tech-card group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2">
                  <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                    <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl w-20 h-20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg">
                      <Code className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{tech.name}</h3>
                    <p className="text-muted-foreground text-sm">{tech.description}</p>
                  </CardContent>
                </Card>
              ))}
              {/* Duplicate set for seamless infinite scroll */}
              {technologies.map((tech, index) => (
                <Card key={`tech-2-${index}`} className="tech-card group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2">
                  <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                    <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl w-20 h-20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg">
                      <Code className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{tech.name}</h3>
                    <p className="text-muted-foreground text-sm">{tech.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">Services</span>
            </div>
            <h2 className="text-5xl font-display font-bold text-foreground mb-6">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive certificate solutions to meet all your professional needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-5 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-hover transition-all">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm flex-grow leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">FAQ</span>
            </div>
            <h2 className="text-5xl font-display font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about our certificate platform
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-2 rounded-xl px-6 bg-card hover:shadow-md transition-shadow">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>


      {/* Call to Action with Color Bends Background */}
      <section className="py-32 color-bends-bg text-white relative">
        <div className="container mx-auto px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">Ready to Create Amazing Certificates?</h2>
            <p className="text-xl md:text-2xl opacity-90 mb-10 leading-relaxed font-light">
              Join thousands of users who trust our platform for their certificate needs
            </p>
            {!user && (
              <Link to="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/95 hover:shadow-2xl px-12 py-6 text-lg rounded-xl font-semibold transition-all hover:scale-105">
                  Start Creating Today
                </Button>
              </Link>
            )}
            <p className="mt-8 text-sm opacity-70">No credit card required • Free forever plan available</p>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Index;
