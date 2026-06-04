import { useState, useEffect } from 'react'
import MainOptions from './MainOptions'
import ChatInput from './ChatInput'

type Step = 'step1' | 'step1-out' | 'step3'
type OptionType = 'question' | 'document' | 'advisor' | 'enterprise'

interface WelcomeAnimationProps {
  onComplete: (option?: OptionType, messageText?: string) => void
}

export default function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const [step, setStep] = useState<Step>('step1')
  const [, setSelectedOption] = useState<OptionType | null>(null)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setStep('step1-out'), 2400))
    timers.push(setTimeout(() => setStep('step3'), 3200))

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleSelectOption = (option: OptionType) => {
    setSelectedOption(option)
    onComplete(option, undefined)
  }

  const handleInputSend = (text: string) => {
    if (text.trim()) {
      onComplete('question', text)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center gradient-bg">
      <div className="text-center px-6 select-none pointer-events-none">

        {/* Step 1: "Hola, soy SicoBot" */}
        {(step === 'step1' || step === 'step1-out') && (
          <div className={step === 'step1' ? 'animate-fade-in' : 'animate-fade-out'}>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
              Hola, soy <span className="text-brand-500">SicoBot</span>
            </h1>
          </div>
        )}

        {/* Step 3: Pantalla final completa */}
        {step === 'step3' && (
          <div className="space-y-8 w-full max-w-4xl">
            <div className="space-y-3 animate-fade-in">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
                <span className="text-slate-700">Asesor</span><span className="text-brand-500 font-bold">IA</span>
              </p>
              <p className="text-lg sm:text-xl font-medium text-slate-600 mt-2">
                En protocolo psicosocial CEAL-SM/SUSESO
              </p>
              <p className="text-lg sm:text-xl font-medium text-slate-600 mt-6">
                ¿Cómo puedo ayudarte?
              </p>
            </div>

            <div className="pointer-events-auto">
              <MainOptions onSelect={handleSelectOption} />
            </div>

            {/* Chat input — siempre visible */}
            <div className="w-full max-w-2xl mx-auto pointer-events-auto">
              <ChatInput
                onSend={handleInputSend}
                disabled={false}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
