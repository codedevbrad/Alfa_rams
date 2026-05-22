import { useCallback, useEffect, useState } from 'react'
import type { OpenAiStatus } from '@shared/rams/ai-generate'
import type { InboxMessageDetail } from '@shared/email/inbox'
import type { EmailSenderDto } from '@shared/email/senders'
import { useAppNavigation } from '@renderer/navigation/context'
import { useInboxDetailSteps } from '@renderer/systems/email/useInboxDetailSteps'
import { useInboxReplyDraft } from '@renderer/systems/openai/useInboxReplyDraft'
import { useInboxEmailAnalysis } from '@renderer/systems/openai/useInboxEmailAnalysis'
import { useSendInboxReply } from '@renderer/systems/email/useSendInboxReply'
import { InboxDetailStepper } from './InboxDetailStepper'
import { InboxDetailViewStep } from './InboxDetailViewStep'
import { InboxDetailAnalyzeStep } from './InboxDetailAnalyzeStep'
import { InboxDetailReplyStep } from './InboxDetailReplyStep'

interface InboxDetailProps {
  detail: InboxMessageDetail | null
  loading: boolean
  gmailConnected: boolean
  senders: EmailSenderDto[]
  onFulfilled: () => void
  onSent: () => void
}

export function InboxDetail({
  detail,
  loading,
  gmailConnected,
  senders,
  onFulfilled,
  onSent
}: InboxDetailProps): React.JSX.Element {
  const { navigate } = useAppNavigation()
  const [openAiStatus, setOpenAiStatus] = useState<OpenAiStatus>({ configured: false })
  const [replyBody, setReplyBody] = useState('')
  const [instructions, setInstructions] = useState('')
  const [senderId, setSenderId] = useState<number | ''>('')

  const { step, setStep, analysis, setAnalysis, applyAnalysisToInstructions } =
    useInboxDetailSteps(detail?.gmailMessageId)
  const { analysing, error: analyseError, analyze } = useInboxEmailAnalysis()
  const { drafting, error: draftError, draft } = useInboxReplyDraft()
  const { sending, error: sendError, send } = useSendInboxReply()

  useEffect(() => {
    void window.api.rams.getOpenAiStatus().then(setOpenAiStatus)
  }, [])

  useEffect(() => {
    setReplyBody('')
    setInstructions('')
    setSenderId('')
    if (senders.length > 0) {
      setSenderId(senders[0].id)
    }
  }, [detail?.gmailMessageId, senders])

  const isFulfilled = detail?.workflowStatus === 'fulfilled'

  const handleOpenSettings = useCallback((): void => {
    navigate('settings')
  }, [navigate])

  const handleAnalyze = useCallback(async (): Promise<void> => {
    if (!detail) return
    const result = await analyze(detail.gmailMessageId)
    if (result) setAnalysis(result)
  }, [detail, analyze, setAnalysis])

  const handleContinueToReply = useCallback((): void => {
    if (analysis) {
      setInstructions(applyAnalysisToInstructions())
    }
    setStep(3)
  }, [analysis, applyAnalysisToInstructions, setStep])

  const handleDraft = useCallback(async (): Promise<void> => {
    if (!detail) return
    const body = await draft(detail.gmailMessageId, instructions || undefined)
    if (body) setReplyBody(body)
  }, [detail, draft, instructions])

  const handleSend = useCallback(async (): Promise<void> => {
    if (!detail || !replyBody.trim()) return
    const ok = await send(
      detail.gmailMessageId,
      replyBody.trim(),
      senderId === '' ? undefined : senderId
    )
    if (ok) onSent()
  }, [detail, replyBody, send, senderId, onSent])

  const handleFulfill = useCallback(async (): Promise<void> => {
    if (!detail) return
    await window.api.email.markInboxFulfilled(detail.gmailMessageId)
    onFulfilled()
  }, [detail, onFulfilled])

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Loading message…</p>
  }

  if (!detail) {
    return <p className="p-6 text-sm text-slate-500">Select a message to view.</p>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <InboxDetailStepper
        step={isFulfilled ? 1 : step}
        locked={isFulfilled}
        onStepChange={setStep}
      />

      {step === 1 && (
        <InboxDetailViewStep
          detail={detail}
          locked={isFulfilled}
          onContinue={() => setStep(2)}
        />
      )}

      {step === 2 && !isFulfilled && (
        <InboxDetailAnalyzeStep
          openAiConfigured={openAiStatus.configured}
          analysing={analysing}
          error={analyseError}
          analysis={analysis}
          onOpenSettings={handleOpenSettings}
          onAnalyze={() => void handleAnalyze()}
          onContinue={handleContinueToReply}
        />
      )}

      {step === 3 && !isFulfilled && (
        <InboxDetailReplyStep
          openAiConfigured={openAiStatus.configured}
          gmailConnected={gmailConnected}
          senders={senders}
          instructions={instructions}
          replyBody={replyBody}
          senderId={senderId}
          drafting={drafting}
          draftError={draftError}
          sending={sending}
          sendError={sendError}
          onOpenSettings={handleOpenSettings}
          onInstructionsChange={setInstructions}
          onReplyBodyChange={setReplyBody}
          onSenderIdChange={setSenderId}
          onDraft={() => void handleDraft()}
          onSend={() => void handleSend()}
          onFulfill={() => void handleFulfill()}
        />
      )}
    </div>
  )
}
