import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, BarChart } from "lucide-react";

export default function Home() {
  return (
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-background">
        <div className="container-custom space-y-10 text-center">
          <div className="space-y-4">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Introducing Stellar AI
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Hey there, welcome to{" "}
              <span className="text-primary">Stellar AI</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Empowering your creativity with advanced AI technology. Get
              started today and unlock the full potential of AI.
            </p>
          </div>
          <div className="mx-auto flex flex-col sm:flex-row gap-4 sm:w-fit">
            <Link href="/features" className="btn btn-primary">
              Explore Features
            </Link>
            <Link href="/pricing" className="btn btn-secondary">
              View Pricing
            </Link>
          </div>
          <div className="mx-auto max-w-4xl rounded-lg border bg-card p-8 md:p-12">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 text-primary"
                    fill="currentColor"
                  >
                    <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold">How can I help you today?</h2>
              <div className="w-full max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="input-field w-full pr-12"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary p-1.5 text-primary-foreground">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Powerful Features
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              Discover the tools that make Stellar AI the leading choice for
              creative professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Creative Assistant</h3>
              <p className="text-muted-foreground">
                Generate ideas, content, and creative solutions with our
                AI-powered assistant.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get responses in milliseconds with our optimized infrastructure.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and never shared with third parties.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Track your usage and optimize your workflow with detailed
                insights.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/features" className="btn btn-primary">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom">
          <div className="rounded-lg border bg-card p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Free plan available
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to get started?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Join thousands of users who are already using Stellar AI to
                enhance their creativity and productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="btn btn-primary">
                  Sign Up Free
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
  );
}
