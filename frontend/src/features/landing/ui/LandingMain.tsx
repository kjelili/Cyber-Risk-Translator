import { useApp } from '../../../app/context';
import { Button } from '../../../shared/ui';

const MODULES = [
  { icon: '🛡️', title: 'CROC Dashboard', desc: 'Unified dashboard aggregating all security modules into a single risk posture view.' },
  { icon: '💻', title: 'Endpoint Security', desc: 'Monitor EDR/AV coverage, patch status, and endpoint alerts across your infrastructure.' },
  { icon: '✅', title: 'Compliance', desc: 'Track ISO 27001, SOC2, NIST controls with gap analysis and evidence management.' },
  { icon: '💳', title: 'PCI DSS', desc: 'Full PCI DSS 12-requirement tracking with SAQ management and assessment workflows.' },
  { icon: '☁️', title: 'Cloud Security', desc: 'Monitor cloud posture across AWS, Azure, and GCP with misconfiguration detection.' },
  { icon: '🔧', title: 'DevSecOps', desc: 'Integrate SAST, DAST, SCA, and container scanning into your CI/CD pipelines.' },
  { icon: '⚡', title: 'Threat Protection', desc: 'Track IOCs, manage incidents, and correlate threat intelligence across your environment.' },
  { icon: '📦', title: 'Supply Chain Risk', desc: 'SBOM analysis, dependency vulnerability tracking, and license compliance monitoring.' },
  { icon: '🇪🇺', title: 'NIS2 Compliance', desc: 'NIS2 Directive compliance tracking with incident reporting and deadline management.' },
];

export function LandingMain() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-primary">
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <div className="mb-6 text-6xl font-bold md:text-7xl">
          <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
            Cybersecurity Risk Operation Centre
          </span>
        </div>
        <p className="mx-auto mb-4 max-w-2xl text-xl text-content-secondary">
          Enterprise-grade cyber risk management platform. Translate technical vulnerabilities
          into business intelligence across every security domain.
        </p>
        <p className="mx-auto mb-10 max-w-xl text-content-tertiary">
          From endpoint security to NIS2 compliance, manage your entire risk posture in one place.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" onClick={() => navigate('projects')} className="shadow-lg shadow-accent/25">
            Get Started
          </Button>
          <Button variant="secondary" size="lg" onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Features
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: '9', label: 'Security Modules' },
            { value: '100+', label: 'Compliance Controls' },
            { value: '< 1min', label: 'Report Generation' },
            { value: '24/7', label: 'Risk Monitoring' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface-card/50 p-5 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-accent">{s.value}</div>
              <div className="mt-1 text-xs text-content-tertiary">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-content-primary">
          Complete Security Coverage
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(m => (
            <div key={m.title} className="group rounded-xl border border-border bg-surface-card p-6 transition-all duration-200 hover:border-border-hover hover:shadow-lg hover:shadow-black/20">
              <div className="mb-3 text-3xl">{m.icon}</div>
              <h3 className="mb-2 text-base font-semibold text-content-primary">{m.title}</h3>
              <p className="text-sm leading-relaxed text-content-tertiary">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Before / After */}
      <div className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-2xl border border-border bg-surface-card p-8 md:p-12">
          <h2 className="mb-8 text-center text-2xl font-bold">Why CROC?</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 text-lg font-semibold text-status-danger">Without CROC</div>
              <ul className="space-y-3 text-sm text-content-secondary">
                <li className="flex gap-2"><span className="text-status-danger">✕</span> Scattered tools with no unified view</li>
                <li className="flex gap-2"><span className="text-status-danger">✕</span> 10-30 hours rewriting reports per engagement</li>
                <li className="flex gap-2"><span className="text-status-danger">✕</span> Executives see security as a cost center</li>
                <li className="flex gap-2"><span className="text-status-danger">✕</span> Manual compliance tracking in spreadsheets</li>
              </ul>
            </div>
            <div>
              <div className="mb-4 text-lg font-semibold text-status-success">With CROC</div>
              <ul className="space-y-3 text-sm text-content-secondary">
                <li className="flex gap-2"><span className="text-status-success">✓</span> Single pane of glass for all security operations</li>
                <li className="flex gap-2"><span className="text-status-success">✓</span> Automated report generation in seconds</li>
                <li className="flex gap-2"><span className="text-status-success">✓</span> Quantified financial risk for board decisions</li>
                <li className="flex gap-2"><span className="text-status-success">✓</span> Continuous compliance with audit evidence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pb-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-content-primary">
          Ready to unify your security operations?
        </h2>
        <Button size="lg" onClick={() => navigate('projects')}>
          Launch CROC Platform
        </Button>
      </div>
    </div>
  );
}
