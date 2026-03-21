import { useState } from 'react'
import { Send } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card variant="soft-purple" className="p-8 text-center">
        <div className="size-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Send className="size-6 text-success" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">¡Mensaje enviado!</h3>
        <p className="text-sm text-text-secondary">
          Te responderemos lo antes posible. Revisa tu correo electrónico.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="glass" className="p-6 md:p-8">
      <h3 className="text-lg font-bold text-text-primary mb-1">Escríbenos</h3>
      <p className="text-sm text-text-secondary mb-6">
        Completa el formulario y te responderemos en menos de 24 horas.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-text-primary mb-1.5">
            Nombre
          </label>
          <input
            id="contact-name"
            type="text"
            required
            placeholder="Tu nombre"
            className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-text-primary mb-1.5">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-text-primary mb-1.5">
            Mensaje
          </label>
          <textarea
            id="contact-message"
            required
            rows={4}
            placeholder="¿En qué podemos ayudarte?"
            className="w-full px-4 py-3 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Enviar mensaje
          <Send className="size-4" />
        </Button>
      </form>
    </Card>
  )
}
