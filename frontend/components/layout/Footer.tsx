import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-dark-950/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-display font-bold text-xl text-white">
                Intel<span className="gradient-text">view</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI-Powered Interview Intelligence Platform. Transform scattered experiences into actionable intelligence.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: [
                { label: "Company Explorer", href: "/companies" },
                { label: "Question Bank", href: "/questions" },
                { label: "Interview Reports", href: "/reports" },
                { label: "Global Search", href: "/search" },
              ],
            },
            {
              title: "AI Tools",
              links: [
                { label: "Resume Analyzer", href: "/resume" },
                { label: "Study Planner", href: "/planner" },
                { label: "Mock Interview", href: "/mock-interview" },
                { label: "Dashboard", href: "/dashboard" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="gradient-divider mt-10 mb-6" />

        <div className="flex items-center justify-center">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Intelview. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
