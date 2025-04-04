import Link from "next/link"
import {
  Sparkles,
  Zap,
  Shield,
  BarChart,
  Code,
  MessageSquare,
  Image,
  FileText,
  Headphones,
  Globe,
  Cpu,
  Database,
} from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Creative Assistant",
      description: "Generate ideas, content, and creative solutions with our AI-powered assistant.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Lightning Fast",
      description: "Get responses in milliseconds with our optimized infrastructure.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared with third parties.",
    },
    {
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Advanced Analytics",
      description: "Track your usage and optimize your workflow with detailed insights.",
    },
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      title: "Code Generation",
      description: "Generate code snippets and solutions for programming challenges.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Conversational AI",
      description: "Have natural conversations with our advanced language model.",
    },
    {
      icon: <Image className="h-6 w-6 text-primary" />,
      title: "Image Analysis",
      description: "Extract information and insights from images and visual content.",
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Document Processing",
      description: "Analyze, summarize, and extract key information from documents and text.",
    },
    {
      icon: <Headphones className="h-6 w-6 text-primary" />,
      title: "Audio Transcription",
      description: "Convert speech to text with high accuracy and multiple language support.",
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Multilingual Support",
      description: "Communicate in over 100 languages with native-level translation capabilities.",
    },
    {
      icon: <Cpu className="h-6 w-6 text-primary" />,
      title: "Custom AI Models",
      description: "Train specialized models on your data for industry-specific applications.",
    },
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Knowledge Base",
      description: "Access a vast database of information to answer complex questions.",
    },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              Powerful <span className="text-primary">Features</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover the tools and capabilities that make Stellar AI the leading choice for creative professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Featured Capability
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Advanced Conversational AI</h2>
              <p className="text-muted-foreground">
                Our state-of-the-art language model can understand context, remember previous interactions, and provide
                helpful, accurate responses to your questions and requests.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                    <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                  </svg>
                  <span>Natural language understanding</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                    <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                  </svg>
                  <span>Context-aware responses</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                    <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                  </svg>
                  <span>Memory of conversation history</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                    <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                  </svg>
                  <span>Personalized interactions</span>
                </li>
              </ul>
              <Link href="/contact" className="btn btn-primary">
                Learn More
              </Link>
            </div>
            <div className="rounded-lg border bg-card p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                      <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                    </svg>
                  </div>
                  <span className="font-medium">Stellar AI</span>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p>How can I help you with your creative projects today?</p>
                </div>
                <div className="rounded-lg bg-secondary p-4 ml-auto max-w-[80%]">
                  <p>I need help writing a marketing email for our new product launch.</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p>
                    I'd be happy to help with your marketing email! Could you share some details about your product and
                    the key benefits you want to highlight?
                  </p>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Type your message..." className="input-field w-full pr-12" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary p-1.5 text-primary-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="rounded-lg border bg-card p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to experience these features?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Start using Stellar AI today and unlock the full potential of AI for your creative and professional
                needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link href="/pricing" className="btn btn-secondary">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

