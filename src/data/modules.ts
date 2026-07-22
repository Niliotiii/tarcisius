import type { Module } from '@/types/quiz'
import { objetosLiturgicosQuestions } from '@/data/questions/objetos-liturgicos'
import { vestesLiturgicasInsigniasQuestions } from '@/data/questions/vestes-liturgicas-insignias'
import { temposLiturgicosQuestions } from '@/data/questions/tempos-liturgicos'
import { estruturaPartesMissaQuestions } from '@/data/questions/estrutura-partes-missa'

export const modules: Module[] = [
  {
    id: 'objetos-liturgicos',
    title: 'Objetos Litúrgicos',
    subtitle: 'Vasos sagrados, alfaias e paramentos do altar',
    description:
      'Teste seus conhecimentos sobre os objetos usados na Santa Missa: cálice, patena, turíbulo e muito mais.',
    status: 'available',
    questions: objetosLiturgicosQuestions,
  },
  {
    id: 'vestes-liturgicas-insignias',
    title: 'Vestes Litúrgicas e Insígnias',
    subtitle: 'Paramentos e cores dos ministros do altar',
    description:
      'Vestes, cores litúrgicas e insígnias usadas pelos ministros ordenados e acólitos.',
    status: 'available',
    questions: vestesLiturgicasInsigniasQuestions,
  },
  {
    id: 'tempos-liturgicos',
    title: 'Tempos Litúrgicos',
    subtitle: 'Cores e ciclos do ano litúrgico',
    description: 'Advento, Natal, Quaresma, Páscoa e Tempo Comum: cores e significados.',
    status: 'available',
    questions: temposLiturgicosQuestions,
  },
  {
    id: 'estrutura-partes-missa',
    title: 'Estrutura da Missa',
    subtitle: 'Ritos e partes da celebração eucarística',
    description: 'As partes que compõem a Santa Missa, do rito inicial ao rito final.',
    status: 'available',
    questions: estruturaPartesMissaQuestions,
  },
]
