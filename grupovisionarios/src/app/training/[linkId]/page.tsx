'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { 
  GraduationCap, 
  Play, 
  BookOpen, 
  CheckCircle,
  Clock,
  Users,
  Download,
  Lock,
  Star,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

// Mock data - In real app this would be fetched from API
const mockTrainingData = {
  user: {
    name: 'Juan Pérez',
    level: 'PREMIUM',
    progress: 75,
    completedModules: 18,
    totalModules: 24
  },
  modules: [
    {
      id: 1,
      title: 'Fundamentos del Marketing de Afiliados',
      description: 'Aprende los conceptos básicos y la terminología esencial',
      duration: '45 min',
      progress: 100,
      locked: false,
      type: 'video',
      lessons: [
        { title: 'Introducción al Marketing de Afiliados', duration: '15 min', completed: true },
        { title: 'Tipos de Programas de Afiliados', duration: '20 min', completed: true },
        { title: 'Comisiones y Estructuras de Pago', duration: '10 min', completed: true }
      ]
    },
    {
      id: 2,
      title: 'Estrategias de Reclutamiento',
      description: 'Técnicas efectivas para encontrar y convencer referidos',
      duration: '60 min',
      progress: 80,
      locked: false,
      type: 'video',
      lessons: [
        { title: 'Identificación de Prospects', duration: '20 min', completed: true },
        { title: 'Técnicas de Persuasión', duration: '25 min', completed: true },
        { title: 'Manejo de Objeciones', duration: '15 min', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Marketing Digital para Afiliados',
      description: 'Uso de redes sociales y marketing online',
      duration: '90 min',
      progress: 60,
      locked: false,
      type: 'interactive',
      lessons: [
        { title: 'Marketing en Redes Sociales', duration: '30 min', completed: true },
        { title: 'Creación de Contenido Atractivo', duration: '30 min', completed: true },
        { title: 'Publicidad Pagada', duration: '30 min', completed: false }
      ]
    },
    {
      id: 4,
      title: 'Liderazgo y Gestión de Equipos',
      description: 'Desarrolla tu equipo de afiliados exitosamente',
      duration: '75 min',
      progress: 0,
      locked: true,
      type: 'video',
      lessons: [
        { title: 'Principios de Liderazgo', duration: '25 min', completed: false },
        { title: 'Motivación de Equipos', duration: '25 min', completed: false },
        { title: 'Resolución de Conflictos', duration: '25 min', completed: false }
      ]
    }
  ],
  resources: [
    {
      title: 'Guía de Inicio Rápido',
      description: 'PDF con pasos esenciales para comenzar',
      type: 'pdf',
      size: '2.5 MB'
    },
    {
      title: 'Plantillas de Email',
      description: 'Emails prediseñados para reclutamiento',
      type: 'templates',
      size: '856 KB'
    },
    {
      title: 'Presentación de Ventas',
      description: 'Slides para presentar la oportunidad',
      type: 'presentation',
      size: '4.2 MB'
    }
  ],
  achievements: [
    { title: 'Primer Módulo Completado', unlocked: true, date: '2024-11-15' },
    { title: 'Especialista en Reclutamiento', unlocked: true, date: '2024-12-01' },
    { title: 'Mentor Digital', unlocked: false, requiredProgress: 80 },
    { title: 'Líder de Equipos', unlocked: false, requiredProgress: 100 }
  ]
}

export default function TrainingPage() {
  const params = useParams()
  const linkId = params.linkId as string
  const [isLoading, setIsLoading] = useState(true)
  const [training, setTraining] = useState(mockTrainingData)
  const [selectedModule, setSelectedModule] = useState<number | null>(null)

  useEffect(() => {
    // Simulate API call to get training data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [linkId])

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5" />
      case 'interactive':
        return <Target className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <BookOpen className="w-5 h-5 text-red-500" />
      case 'templates':
        return <Users className="w-5 h-5 text-blue-500" />
      case 'presentation':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      default:
        return <Download className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando capacitación...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Centro de Capacitación de {training.user.name}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Nivel {training.user.level} • {training.user.progress}% Completado
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{training.user.completedModules} de {training.user.totalModules} módulos</span>
              <span>{training.user.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${training.user.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{training.user.completedModules}</p>
              <p className="text-gray-600">Módulos Completados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {training.modules.reduce((acc, module) => 
                  acc + parseInt(module.duration.split(' ')[0]) * (module.progress / 100), 0
                ).toFixed(0)} min
              </p>
              <p className="text-gray-600">Tiempo de Estudio</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {training.achievements.filter(a => a.unlocked).length}
              </p>
              <p className="text-gray-600">Logros Desbloqueados</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Training Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Módulos de Capacitación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {training.modules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                      module.locked ? 'opacity-60 bg-gray-50' : 'hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          module.locked ? 'bg-gray-200 text-gray-400' : 
                          module.progress === 100 ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {module.locked ? <Lock className="w-5 h-5" /> : 
                           module.progress === 100 ? <CheckCircle className="w-5 h-5" /> :
                           getModuleIcon(module.type)}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {module.duration}
                            </span>
                            {!module.locked && (
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${module.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">{module.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!module.locked && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                            >
                              {selectedModule === module.id ? 'Ocultar' : 'Ver Lecciones'}
                            </Button>
                            <Button
                              variant={module.progress === 100 ? 'secondary' : 'primary'}
                              size="sm"
                            >
                              {module.progress === 100 ? 'Revisar' : 'Continuar'}
                            </Button>
                          </>
                        )}
                        {module.locked && (
                          <Button variant="ghost" size="sm" disabled>
                            <Lock className="w-4 h-4 mr-2" />
                            Bloqueado
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Lessons Dropdown */}
                    {selectedModule === module.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pl-16 space-y-2"
                      >
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div 
                            key={lessonIndex}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              {lesson.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                              )}
                              <span className="text-sm">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-600" />
                  Recursos Descargables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {training.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        {getResourceIcon(resource.type)}
                        <div>
                          <p className="font-medium text-gray-900">{resource.title}</p>
                          <p className="text-sm text-gray-600">{resource.description}</p>
                          <p className="text-xs text-gray-500">{resource.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Logros y Certificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {training.achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        achievement.unlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500'
                      }`}>
                        {achievement.unlocked ? <Star className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                          {achievement.title}
                        </p>
                        {achievement.unlocked && achievement.date && (
                          <p className="text-xs text-gray-600">
                            Desbloqueado: {new Date(achievement.date).toLocaleDateString('es-CO')}
                          </p>
                        )}
                        {!achievement.unlocked && achievement.requiredProgress && (
                          <p className="text-xs text-gray-500">
                            Requiere {achievement.requiredProgress}% de progreso
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="pt-6 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h2 className="text-2xl font-bold mb-2">
                ¡Continúa tu Capacitación!
              </h2>
              <p className="text-blue-100 mb-6">
                Cada módulo completado te acerca más a alcanzar tus metas financieras
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard" passHref>
                  <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                    Ir al Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                  Continuar Capacitación
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
} 