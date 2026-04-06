import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Status = 'Ativo' | 'Encerrado' | 'Enviado' | 'Pendente'

export interface HistoryLog {
  id: string
  data: string
  campo: string
  valorAnterior: string
  novoValor: string
}

export interface Installment {
  id: string
  cnpj: string
  empresa: string
  orgao: string
  parcelasAtuais: number
  parcelasTotais: number
  status: Status
  valorTotal: number
  dataInicio: string
  numeroProcesso?: string
  metodoEnvio?: string
  site?: string
  senha?: string
  historico?: HistoryLog[]
}

const initialData: Installment[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    empresa: 'Tech Solutions LTDA',
    orgao: 'Receita Federal',
    parcelasAtuais: 12,
    parcelasTotais: 60,
    status: 'Ativo',
    valorTotal: 150000,
    dataInicio: '2023-01-15',
    numeroProcesso: '12345.678901/2023-12',
    metodoEnvio: 'Portal e-CAC',
    site: 'https://cav.receita.fazenda.gov.br',
    senha: 'senha-super-secreta',
    historico: [
      {
        id: 'h1',
        data: '2023-06-10T10:00:00Z',
        campo: 'Parcela Atual',
        valorAnterior: '11',
        novoValor: '12',
      },
    ],
  },
  {
    id: '2',
    cnpj: '98.765.432/0001-10',
    empresa: 'Comercial Silva',
    orgao: 'PGFN',
    parcelasAtuais: 60,
    parcelasTotais: 60,
    status: 'Encerrado',
    valorTotal: 45000,
    dataInicio: '2019-05-20',
  },
  {
    id: '3',
    cnpj: '45.678.901/0001-23',
    empresa: 'Indústria ABC',
    orgao: 'Secretaria da Fazenda',
    parcelasAtuais: 0,
    parcelasTotais: 24,
    status: 'Pendente',
    valorTotal: 80000,
    dataInicio: '2024-04-10',
  },
  {
    id: '4',
    cnpj: '33.444.555/0001-66',
    empresa: 'Serviços XYZ',
    orgao: 'Receita Federal',
    parcelasAtuais: 1,
    parcelasTotais: 12,
    status: 'Enviado',
    valorTotal: 12000,
    dataInicio: '2024-03-01',
  },
  {
    id: '5',
    cnpj: '11.222.333/0001-44',
    empresa: 'Logística Express',
    orgao: 'PGFN',
    parcelasAtuais: 5,
    parcelasTotais: 48,
    status: 'Ativo',
    valorTotal: 250000,
    dataInicio: '2023-11-10',
  },
  {
    id: '6',
    cnpj: '99.888.777/0001-55',
    empresa: 'Consultoria Prime',
    orgao: 'Receita Federal',
    parcelasAtuais: 36,
    parcelasTotais: 36,
    status: 'Encerrado',
    valorTotal: 90000,
    dataInicio: '2020-02-15',
  },
]

interface InstallmentContextData {
  installments: Installment[]
  addInstallment: (installment: Omit<Installment, 'id'>) => void
  updateInstallment: (id: string, data: Partial<Installment>, log?: Omit<HistoryLog, 'id'>) => void
  removeInstallment: (id: string) => void
}

const InstallmentContext = createContext<InstallmentContextData | undefined>(undefined)

export const InstallmentProvider = ({ children }: { children: ReactNode }) => {
  const [installments, setInstallments] = useState<Installment[]>(initialData)

  const addInstallment = (installment: Omit<Installment, 'id'>) => {
    const newInstallment = { ...installment, id: Math.random().toString(36).substr(2, 9) }
    setInstallments((prev) => [newInstallment, ...prev])
  }

  const updateInstallment = (
    id: string,
    data: Partial<Installment>,
    log?: Omit<HistoryLog, 'id'>,
  ) => {
    setInstallments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data }
          if (log) {
            updated.historico = [
              { ...log, id: Math.random().toString(36).substr(2, 9) },
              ...(item.historico || []),
            ]
          }
          return updated
        }
        return item
      }),
    )
  }

  const removeInstallment = (id: string) => {
    setInstallments((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <InstallmentContext.Provider
      value={{ installments, addInstallment, updateInstallment, removeInstallment }}
    >
      {children}
    </InstallmentContext.Provider>
  )
}

export default function useInstallmentStore() {
  const context = useContext(InstallmentContext)
  if (!context) {
    throw new Error('useInstallmentStore must be used within an InstallmentProvider')
  }
  return context
}
