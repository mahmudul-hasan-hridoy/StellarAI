import Link from "next/link"
import { Users, Award, Clock, Globe } from "lucide-react"

export default function About() {
  const stats = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      value: "100,000+",
      label: "Active Users",
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      value: "99.9%",
      label: "Uptime",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      value: "24/7",
      label: "Support",
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      value: "190+",
      label: "Countries",
    },
  ]

  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Michael Rodriguez",
      role: "Head of AI Research",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Priya Patel",
      role: "Chief Design Officer",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              About <span className="text-primary">Stellar AI</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              We're on a mission to make advanced AI technology accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Our Story</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">From Idea to Innovation</h2>
              <p className="text-muted-foreground">
                Stellar AI was founded in 2021 with a simple yet ambitious goal: to democratize access to advanced AI
                technology. What started as a small team of passionate engineers and researchers has grown into a global
                company serving users in over 190 countries.
              </p>
              <p className="text-muted-foreground">
                Our journey began when our founders recognized that while AI was advancing rapidly, these powerful tools
                remained inaccessible to most people. We set out to change that by creating an intuitive, powerful AI
                assistant that anyone could use, regardless of their technical background.
              </p>
              <p className="text-muted-foreground">
                Today, we're proud to be at the forefront of AI innovation, constantly pushing the boundaries of what's
                possible while maintaining our commitment to accessibility, privacy, and ethical AI development.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <img
                src="/placeholder.svg?height=600&width=800"
                alt="Stellar AI team working together"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="card p-6 text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {stat.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Values</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">The principles that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
                  <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Accessibility</h3>
              <p className="text-muted-foreground">
                We believe advanced AI should be accessible to everyone, regardless of technical expertise or resources.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
                  <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Privacy</h3>
              <p className="text-muted-foreground">
                We're committed to protecting user data and privacy, with transparent policies and secure
                infrastructure.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
                  <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously push the boundaries of what's possible, investing heavily in research and development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Meet Our Team</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">The talented individuals behind Stellar AI.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="card overflow-hidden">
                <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-4 text-center">
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="rounded-lg border bg-card p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Join Our Journey</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Be part of the AI revolution and help us shape the future of technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="btn btn-primary">
                  Get Started
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

