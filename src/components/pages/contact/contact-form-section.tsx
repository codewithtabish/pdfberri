"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Make sure this path is correct for your custom button
import { UploadIcon, ShieldCheckIcon, LoaderIcon, CheckCircleIcon } from "@/components/general/icons/pdf-icons";

export function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 md:p-10">
      <h2 className="text-2xl font-bold text-foreground">Send us a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Fill out the form below and we'll get back to you as soon as possible.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
            <input
              id="name"
              type="text"
              required
              placeholder="Your name"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
          <select
            id="subject"
            required
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a subject</option>
            <option value="support">Technical Support</option>
            <option value="feedback">Feedback</option>
            <option value="business">Business Inquiry</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
          <textarea
            id="message"
            rows={5}
            required
            placeholder="How can we help you?"
            className="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || isSuccess}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderIcon className="size-4 animate-spin" />
              Sending...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircleIcon className="size-4" />
              Message Sent!
            </>
          ) : (
            <>
              <UploadIcon className="size-4 rotate-45" />
              Send message
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-4" />
          <span>Your information is secure and encrypted.</span>
        </div>
      </form>
    </section>
  );
}