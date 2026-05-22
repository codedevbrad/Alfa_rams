import type { InboxEmailAnalysis } from '@shared/email/inbox'
import { InboxOpenAiBanner } from './InboxOpenAiBanner'

interface InboxDetailAnalyzeStepProps {
  openAiConfigured: boolean
  analysing: boolean
  error: string | null
  analysis: InboxEmailAnalysis | null
  onOpenSettings: () => void
  onAnalyze: () => void
  onContinue: () => void
}

type TriageLevel = 'low' | 'medium' | 'high'

function triageBadgeStyles(
  level: TriageLevel,
  labels: { high: string; medium: string; low: string }
): { badge: string; label: string } {
  if (level === 'high') {
    return {
      badge: 'bg-red-950/80 text-red-200 border-red-800/60',
      label: labels.high
    }
  }
  if (level === 'medium') {
    return {
      badge: 'bg-amber-950/80 text-amber-200 border-amber-800/60',
      label: labels.medium
    }
  }
  return {
    badge: 'bg-slate-800/80 text-slate-300 border-slate-600/60',
    label: labels.low
  }
}

function urgencyStyles(urgency: InboxEmailAnalysis['urgency']): {
  badge: string
  ring: string
  label: string
} {
  const { badge, label } = triageBadgeStyles(urgency, {
    high: 'High priority',
    medium: 'Medium priority',
    low: 'Low priority'
  })
  const ring =
    urgency === 'high'
      ? 'ring-red-900/40'
      : urgency === 'medium'
        ? 'ring-amber-900/40'
        : 'ring-slate-700/40'
  return { badge, ring, label }
}

function conversionStyles(
  probability: InboxEmailAnalysis['conversionProbability']
): { badge: string; label: string } {
  return triageBadgeStyles(probability, {
    high: 'High conversion',
    medium: 'Medium conversion',
    low: 'Low conversion'
  })
}

function AnalysisSection({
  title,
  description,
  children,
  variant = 'default'
}: {
  title: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'warning'
}): React.JSX.Element {
  const styles =
    variant === 'accent'
      ? 'border-violet-800/50 bg-violet-950/20'
      : variant === 'warning'
        ? 'border-amber-800/50 bg-amber-950/20'
        : 'border-slate-700/80 bg-slate-900/50'
  const titleColor =
    variant === 'accent'
      ? 'text-violet-300'
      : variant === 'warning'
        ? 'text-amber-300'
        : 'text-slate-400'
  return (
    <section className={`rounded-xl border p-5 ${styles}`}>
      <header className="mb-4 border-b border-slate-700/60 pb-3">
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${titleColor}`}>
          {title}
        </h3>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </header>
      <div className="text-sm leading-relaxed text-slate-200">{children}</div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }): React.JSX.Element {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-slate-300">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function AnalysisResults({ analysis }: { analysis: InboxEmailAnalysis }): React.JSX.Element {
  const urgency = urgencyStyles(analysis.urgency)
  const conversion = conversionStyles(analysis.conversionProbability)

  return (
    <div className="flex flex-col gap-8">
      <section
        className={`rounded-xl border border-slate-600/80 bg-gradient-to-br from-slate-800/80 to-slate-900/90 p-6 ring-1 ${urgency.ring}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-400/90">
              Intent
            </p>
            <p className="mt-3 text-base font-medium leading-snug text-slate-100">
              {analysis.intent}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 self-start">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${urgency.badge}`}
            >
              {urgency.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${conversion.badge}`}
            >
              {conversion.label}
            </span>
          </div>
        </div>
      </section>

      <AnalysisSection
        title="Assessment"
        description="Commercial triage based on the email content"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Likely project type
            </dt>
            <dd className="mt-1.5 text-slate-200">{analysis.likelyProjectType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Estimated project value
            </dt>
            <dd className="mt-1.5 text-slate-200">{analysis.estimatedProjectValueRange}</dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-slate-700/60 pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/90">
            Recommended next action
          </p>
          <p className="mt-2 text-slate-200">{analysis.recommendedNextAction}</p>
        </div>
      </AnalysisSection>

      <AnalysisSection title="Summary" description="What the sender is asking or informing you about">
        <p className="text-slate-300">{analysis.summary}</p>
      </AnalysisSection>

      {analysis.keyPoints.length > 0 && (
        <AnalysisSection title="Key points" description="Facts and requests stated in the email">
          <BulletList items={analysis.keyPoints} />
        </AnalysisSection>
      )}

      {analysis.redFlags.length > 0 && (
        <AnalysisSection
          title="Red flags"
          description="Risks or concerns to be aware of before proceeding"
          variant="warning"
        >
          <BulletList items={analysis.redFlags} />
        </AnalysisSection>
      )}

      {analysis.missingInformation.length > 0 && (
        <AnalysisSection
          title="Missing information"
          description="Details you may need before drafting a reply"
        >
          <BulletList items={analysis.missingInformation} />
        </AnalysisSection>
      )}

      <AnalysisSection
        title="Suggested reply focus"
        description="Use this when generating your draft on the next step"
        variant="accent"
      >
        <p className="text-slate-200">{analysis.suggestedReplyFocus}</p>
      </AnalysisSection>
    </div>
  )
}

export function InboxDetailAnalyzeStep({
  openAiConfigured,
  analysing,
  error,
  analysis,
  onOpenSettings,
  onAnalyze,
  onContinue
}: InboxDetailAnalyzeStepProps): React.JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
        <InboxOpenAiBanner configured={openAiConfigured} onOpenSettings={onOpenSettings} />

        <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-5">
          <p className="text-sm leading-relaxed text-slate-400">
            Analyse the email with AI for commercial triage (project type, value range, conversion
            likelihood), intent and key facts, red flags, and what the reply should cover. Results
            appear in sections below.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onAnalyze()}
              disabled={analysing || !openAiConfigured}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {analysing ? 'Analysing…' : 'Analyse with AI'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        {analysis ? (
          <AnalysisResults analysis={analysis} />
        ) : (
          !analysing && (
            <p className="text-center text-sm text-slate-500">
              Run analysis to see assessment, intent, summary, and reply guidance.
            </p>
          )
        )}

        {analysing && !analysis && (
          <p className="text-center text-sm text-slate-400">Analysing message…</p>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-700 px-6 py-5">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
        >
          Continue to reply
        </button>
      </div>
    </div>
  )
}
