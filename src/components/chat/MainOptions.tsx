type OptionId = 'question' | 'document' | 'advisor' | 'enterprise'

interface MainOptionsProps {
  onSelect: (option: OptionId) => void
}

const OPTIONS: Array<{
  id: OptionId
  icon: string
  title: string
  description: string
  bg: string
  border: string
  hover: string
}> = [
  {
    id: 'question',
    icon: '❓',
    title: 'Tengo una pregunta',
    description: 'Accede a nuestra base de conocimiento sobre el protocolo psicosocial',
    bg: 'bg-blue-50/50',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100/50 hover:border-blue-300',
  },
  {
    id: 'document',
    icon: '📄',
    title: 'Necesito un documento',
    description: 'Descarga documentos, plantillas y guías',
    bg: 'bg-green-50/50',
    border: 'border-green-200',
    hover: 'hover:bg-green-100/50 hover:border-green-300',
  },
  {
    id: 'advisor',
    icon: '🔐',
    title: 'Soy asesor',
    description: 'Accede a contenido exclusivo para asesores',
    bg: 'bg-purple-50/50',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100/50 hover:border-purple-300',
  },
  {
    id: 'enterprise',
    icon: '🏢',
    title: 'Soy empresa',
    description: 'Quiero contratar un servicio (asesoría especialista, actividades presenciales, talleres, etc.)',
    bg: 'bg-amber-50/50',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-100/50 hover:border-amber-300',
  },
]

export default function MainOptions({ onSelect }: MainOptionsProps) {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`
              text-left rounded-xl border p-6 cursor-pointer
              transition-all duration-200
              hover:shadow-lg hover:-translate-y-0.5
              active:scale-[0.98]
              ${opt.bg} ${opt.border} ${opt.hover}
            `}
          >
            <span className="text-3xl block mb-3">{opt.icon}</span>
            <p className="font-semibold text-lg text-slate-800 leading-snug mb-1.5">
              {opt.title}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {opt.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
