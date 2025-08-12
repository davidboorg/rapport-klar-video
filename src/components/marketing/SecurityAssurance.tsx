import React from "react";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { ShieldCheck, Lock, Server, FileLock } from "lucide-react";

export default function SecurityAssurance() {
  return (
    <ModernCard variant="glass" className="p-8">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-green-400" aria-hidden="true" />
          Security & Compliance
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
          <li className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-green-400 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Private storage with RLS</p>
              <p className="text-slate-400 text-sm">Files saved in private buckets with strict Row Level Security and signed URLs only.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Server className="w-5 h-5 text-green-400 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">EU-hosted infrastructure</p>
              <p className="text-slate-400 text-sm">Supabase storage/functions in the EU. No public exposure of sensitive docs.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <FileLock className="w-5 h-5 text-green-400 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Least-privilege access</p>
              <p className="text-slate-400 text-sm">Signed, time-limited links for downloads. No open buckets.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">GDPR-first design</p>
              <p className="text-slate-400 text-sm">Data minimization, audit logs via Edge Functions, and revocable access.</p>
            </div>
          </li>
        </ul>
      </ModernCardContent>
    </ModernCard>
  );
}
