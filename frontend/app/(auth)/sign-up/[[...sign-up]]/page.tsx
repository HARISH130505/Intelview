import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-dark-900/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-2xl",
              headerTitle: "text-white font-display",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-dark-800 border border-white/[0.08] text-white hover:bg-dark-700",
              formFieldInput: "bg-dark-800 border border-white/[0.08] text-white placeholder:text-slate-500 rounded-xl",
              formButtonPrimary: "bg-brand-500 hover:bg-brand-600 rounded-xl font-semibold",
              footerActionLink: "text-brand-400 hover:text-brand-300",
              formFieldLabel: "text-slate-300",
              dividerLine: "bg-white/[0.08]",
              dividerText: "text-slate-500",
            },
          }}
        />
      </div>
    </div>
  );
}
