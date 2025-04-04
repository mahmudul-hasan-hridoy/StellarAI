import Link from "next/link"
import { Check } from "lucide-react"

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      description: "Basic features for personal use",
      price: "$0",
      period: "forever",
      features: [
        "Up to 25 queries per day",
        "Basic creative assistant",
        "Standard response time",
        "Community support",
        "1 user",
      ],
      cta: "Get Started",
      href: "/signup",
      highlighted: false,
    },
    {
      name: "Pro",
      description: "Advanced features for professionals",
      price: "$19",
      period: "per month",
      features: [
        "Unlimited queries",
        "Advanced creative tools",
        "Priority response time",
        "Email support",
        "Custom instructions",
        "Up to 3 users",
      ],
      cta: "Upgrade to Pro",
      href: "/signup?plan=pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for teams",
      price: "Custom",
      period: "contact for pricing",
      features: [
        "Unlimited everything",
        "Dedicated account manager",
        "Custom AI model training",
        "API access",
        "24/7 premium support",
        "Unlimited users",
      ],
      cta: "Contact Sales",
      href: "/contact",
      highlighted: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Choose the plan that's right for you and start creating with Stellar AI.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`card p-6 space-y-6 ${
                  plan.highlighted ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="ml-2 text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`btn w-full justify-center ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              Find answers to common questions about our pricing and features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">Can I change plans later?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription will take
                effect immediately.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and for Enterprise customers, we also support invoicing.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">Is there a free trial for paid plans?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a 7-day free trial for our Pro plan so you can experience all the features before
                committing.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">What happens if I exceed my query limit?</h3>
              <p className="text-muted-foreground">
                On the Free plan, once you reach your daily limit, you'll need to wait until the next day or upgrade to
                continue. Pro and Enterprise plans have no limits.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">Do you offer discounts for annual billing?</h3>
              <p className="text-muted-foreground">
                Yes, you can save 20% by choosing annual billing on any of our paid plans.
              </p>
            </div>
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold">How do I cancel my subscription?</h3>
              <p className="text-muted-foreground">
                You can cancel your subscription at any time from your account settings. Your access will continue until
                the end of your current billing period.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions? We're here to help.</p>
            <Link href="/contact" className="btn btn-primary">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

