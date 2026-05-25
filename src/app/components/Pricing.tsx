"use client";

import React, { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Check, Info } from "lucide-react";

export const Pricing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      description: "Ideal for small research groups getting started with automated scientific workflows.",
      price: billingPeriod === "monthly" ? "$29" : "$24",
      features: [
        "Up to 10 active pipelines",
        "Standard multimodal DB preview",
        "200 PDF processing cycles / mo",
        "Component-wise rubric support",
        "Community support & docs"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Ozymor Pro",
      description: "For active research centers and production laboratories requiring high-fidelity pipelines.",
      price: billingPeriod === "monthly" ? "$99" : "$79",
      features: [
        "Unlimited active pipelines",
        "Access to AI Copilot Console",
        "5,000 PDF processing cycles / mo",
        "Explainable trace log exports",
        "Priority developer support"
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "neon" as const,
      popular: true
    },
    {
      name: "Enterprise",
      description: "Custom capabilities and dedicated sandbox networks designed for leading research institutes.",
      price: "Custom",
      features: [
        "Unlimited document processing",
        "Sandboxed local environment hosting",
        "Dedicated threat audit controls",
        "Custom database triggers",
        "24/7 Enterprise SLAs & Integration"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white border-t border-solid border-[#e5e6e6] relative">
      {/* Glow elements */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-t from-[#e3ff8f]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Pricing Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fafaf9] border border-solid border-[#e5e6e6] text-[#1f2223] text-[10px] font-bold tracking-wider uppercase mb-4 shadow-sm">
            Plans & Tier Options
          </div>
          <h2 className="text-[32px] md:text-[50px] font-extrabold text-[#1f2223] tracking-tight leading-tight mb-4">
            Pricing that scales <br />with your research.
          </h2>
          <p className="text-[14px] md:text-[16px] text-[#5f5e5a] font-semibold max-w-lg mb-8">
            Choose a plan that fits your lab. Switch or cancel at any time. Save up to 20% on annual billing cycles.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center bg-[#fafaf9] border border-solid border-[#e5e6e6] p-1.5 rounded-xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-[#1f2223] text-white shadow-md"
                  : "text-[#5f5e5a] hover:text-[#1f2223]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer ${
                billingPeriod === "yearly"
                  ? "bg-[#1f2223] text-white shadow-md"
                  : "text-[#5f5e5a] hover:text-[#1f2223]"
              }`}
            >
              Annual Billing
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              variant={plan.popular ? "dark" : "white"}
              hoverable
              className={`flex flex-col justify-between p-8 min-h-[500px] border-solid relative ${
                plan.popular 
                  ? "border-[#2e3133] shadow-2xl scale-[1.03] z-10" 
                  : "border-[#e5e6e6]"
              }`}
            >
              <div>
                {/* Plan Badge / Title */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-extrabold tracking-tight">{plan.name}</h3>
                  {plan.popular && (
                    <span className="bg-[#e3ff8f] text-[#1f2223] text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                      Most Popular
                    </span>
                  )}
                </div>

                <p className={`text-[12.5px] mb-8 font-semibold leading-relaxed ${
                  plan.popular ? "text-[#fcb8c98a]" : "text-[#5f5e5a]"
                }`}>
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-[44px] font-black tracking-tight">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className={`text-[12px] font-bold ${
                      plan.popular ? "text-[#fcb8c98a]" : "text-[#888780]"
                    }`}>
                      / month {billingPeriod === "yearly" && "(billed annually)"}
                    </span>
                  )}
                </div>

                <div className={`h-[1px] mb-8 ${plan.popular ? "bg-[#2e3133]" : "bg-[#f2f3f3]"}`} />

                {/* Feature Checklist */}
                <ul className="flex flex-col gap-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-[12.5px] font-bold">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular ? "bg-[#e3ff8f] text-[#1f2223]" : "bg-[#1f2223] text-white"
                      }`}>
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Button
                variant={plan.buttonVariant}
                href="/login?tab=signup"
                className="w-full py-3.5 text-center mt-auto"
              >
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};
