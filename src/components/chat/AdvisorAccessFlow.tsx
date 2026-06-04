import AdvisorPasswordModal from './AdvisorPasswordModal'

interface AdvisorAccessFlowProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AdvisorAccessFlow({
  isOpen,
  onClose,
  onSuccess,
}: AdvisorAccessFlowProps) {
  return (
    <AdvisorPasswordModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
