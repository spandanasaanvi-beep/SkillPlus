import { ArrowRight, BriefcaseBusiness, Building2, Radar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../data/translations';
import { Language } from '../types';

type LandingPageProps = {
  language: Language;
};

export default function LandingPage({ language }: LandingPageProps) {
  const t = translations[language];
  const benefits = [
    'Early detection',
    'District-level intelligence',
    'Forecasting',
    'Better training planning',
    'Data-driven capacity planning',
  ];

  return (
    <div className="space-y-8 py-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-10 px-6 py-10 md:grid-cols-2 md:px-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              SkillPlus
            </div>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{t.landingHeadline}</h1>
            <p className="max-w-lg text-lg text-slate-600">{t.landingSubhead}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-500">
                {t.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <Radar className="mb-4 h-9 w-9 text-blue-300" />
              <div className="text-3xl font-bold">42%</div>
              <div className="mt-2 text-sm text-slate-300">Demand uplift in priority sectors</div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-6 text-slate-800">
              <BriefcaseBusiness className="mb-4 h-9 w-9 text-blue-600" />
              <div className="text-3xl font-bold">18</div>
              <div className="mt-2 text-sm text-slate-600">Districts monitored</div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-6 text-slate-800 md:col-span-2">
              <Building2 className="mb-4 h-9 w-9 text-violet-600" />
              <div className="text-xl font-semibold">Problem</div>
              <p className="mt-2 text-sm text-slate-600">Training capacity can become disconnected from real labour demand when skill planning is not guided by timely market intelligence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">
        <div className="mb-6 text-xl font-semibold">Benefits</div>
        <div className="grid gap-3 md:grid-cols-5">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-200">
              {benefit}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
