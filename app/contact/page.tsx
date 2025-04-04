import { Mail, Phone, MapPin, MessageSquare } from "lucide-react"

export default function Contact() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              We'd love to hear from you. Reach out with questions, feedback, or support requests.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter">Contact Information</h2>
                <p className="text-muted-foreground">
                  Our team is here to help. Use the form or reach out directly through one of our channels.
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">support@stellarai.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Office</h3>
                    <p className="text-muted-foreground">
                      123 AI Boulevard
                      <br />
                      San Francisco, CA 94107
                      <br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-muted-foreground">
                      Available Monday-Friday
                      <br />
                      9:00 AM - 6:00 PM PT
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-6 space-y-6">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="first-name" className="text-sm font-medium">
                      First Name
                    </label>
                    <input id="first-name" type="text" className="input-field" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last-name" className="text-sm font-medium">
                      Last Name
                    </label>
                    <input id="last-name" type="text" className="input-field" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input id="email" type="email" className="input-field" placeholder="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <input id="subject" type="text" className="input-field" placeholder="How can we help you?" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="input-field min-h-[120px]"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">Find quick answers to common questions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">What are your support hours?</h3>
              <p className="text-muted-foreground">
                Our support team is available Monday through Friday, 9:00 AM to 6:00 PM Pacific Time. For urgent issues,
                we offer 24/7 support for Enterprise customers.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">How quickly will I get a response?</h3>
              <p className="text-muted-foreground">
                We aim to respond to all inquiries within 24 hours. Pro and Enterprise customers receive priority
                support with faster response times.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">Do you offer technical support?</h3>
              <p className="text-muted-foreground">
                Yes, we provide technical support for all our customers. The level of support depends on your plan, with
                more comprehensive support available for paid plans.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">How do I report a bug?</h3>
              <p className="text-muted-foreground">
                You can report bugs through our contact form, by emailing support@stellarai.com, or through the in-app
                feedback feature. Please include as much detail as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="rounded-lg overflow-hidden border h-[400px] bg-card flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-bold">Interactive Map</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                This would be an interactive map showing our office location. For privacy and security reasons, we're
                displaying a placeholder instead.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

