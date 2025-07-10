'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Heart, Star, Zap, Target, Users, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const values = [
  {
    id: 1,
    title: 'Integridad',
    icon: Heart,
    description: 'Actuamos con honestidad y transparencia en todas nuestras acciones',
    color: 'primary'
  },
  {
    id: 2,
    title: 'Excelencia',
    icon: Star,
    description: 'Buscamos la perfección en cada detalle y superamos las expectativas',
    color: 'accent'
  },
  {
    id: 3,
    title: 'Liderazgo',
    icon: Award,
    description: 'Inspiramos y guiamos a otros hacia el logro de metas extraordinarias',
    color: 'primary'
  },
  {
    id: 4,
    title: 'Innovación',
    icon: Zap,
    description: 'Abrazamos nuevas posibilidades y creamos soluciones disruptivas',
    color: 'accent'
  },
  {
    id: 5,
    title: 'Colaboración',
    icon: Users,
    description: 'Trabajamos juntos para lograr resultados extraordinarios',
    color: 'primary'
  },
  {
    id: 6,
    title: 'Perseverancia',
    icon: Target,
    description: 'Mantenemos la determinación ante los desafíos y obstáculos',
    color: 'accent'
  },
  {
    id: 7,
    title: 'Pasión',
    icon: Heart,
    description: 'Amamos lo que hacemos y eso se refleja en nuestros resultados',
    color: 'primary'
  },
  {
    id: 8,
    title: 'Responsabilidad',
    icon: Award,
    description: 'Asumimos las consecuencias de nuestras acciones y decisiones',
    color: 'accent'
  },
  {
    id: 9,
    title: 'Respeto',
    icon: Users,
    description: 'Valoramos la dignidad y diversidad de cada persona',
    color: 'primary'
  },
  {
    id: 10,
    title: 'Gratitud',
    icon: Star,
    description: 'Apreciamos y reconocemos las contribuciones de cada persona',
    color: 'accent'
  },
  {
    id: 11,
    title: 'Prosperidad',
    icon: Zap,
    description: 'Creamos abundancia y bienestar para todos los involucrados',
    color: 'primary'
  },
  {
    id: 12,
    title: 'Legado',
    icon: Target,
    description: 'Construimos algo que perdure y trascienda generaciones',
    color: 'accent'
  }
]

export default function ValuesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
            <div className="text-2xl font-display font-bold text-gradient">
              Grupo Visionarios
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Únete Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Nuestros{' '}
              <span className="text-gradient">12 Valores</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Los principios fundamentales que guían cada acción, decisión y relación 
              en Grupo Visionarios. Estos valores no son solo palabras, son la esencia 
              de quiénes somos y hacia dónde vamos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover="lift" className="h-full text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    value.color === 'primary' 
                      ? 'bg-primary-100' 
                      : 'bg-accent-100'
                  }`}>
                    <value.icon className={`h-8 w-8 ${
                      value.color === 'primary' 
                        ? 'text-primary-600' 
                        : 'text-accent-600'
                    }`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    value.color === 'primary' 
                      ? 'text-primary-700' 
                      : 'text-accent-700'
                  }`}>
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              ¿Te identificas con nuestros valores?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Si estos principios resuenan contigo, entonces eres uno de nosotros. 
              Únete a una comunidad que vive y respira estos valores cada día.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="xl" className="shadow-glow">
                  Únete a los Visionarios
                </Button>
              </Link>
              <a 
                href="https://wa.me/573001234567?text=Hola%2C%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20los%20valores%20de%20Grupo%20Visionarios" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="xl">
                  Conversemos por WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold mb-4">
              Grupo Visionarios
            </h3>
            <p className="text-gray-400 mb-4">
              Construyendo el futuro financiero de Colombia, un visionario a la vez.
            </p>
            <div className="border-t border-gray-800 pt-8 text-gray-400">
              <p>&copy; 2024 Grupo Visionarios. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 