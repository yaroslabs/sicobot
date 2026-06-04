import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import WelcomeAnimation from '../components/chat/WelcomeAnimation'
import ChatWindow from '../components/chat/ChatWindow'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

type Phase = 'animation' | 'chat'

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>('animation')
  const navigate = useNavigate()

  const handleAnimationComplete = useCallback(
    (option?: 'question' | 'document' | 'advisor' | 'enterprise') => {
      if (option === 'enterprise') {
        navigate('/contacto')
      } else if (option) {
        setPhase('chat')
      }
    },
    [navigate]
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden gradient-bg">
      <Header />

      <div className="flex flex-col flex-1 overflow-hidden pt-16">
        {phase === 'animation' ? (
          <WelcomeAnimation
            onComplete={(option) => handleAnimationComplete(option)}
          />
        ) : (
          <ChatWindow />
        )}
      </div>

      <Footer />
    </div>
  )
}
