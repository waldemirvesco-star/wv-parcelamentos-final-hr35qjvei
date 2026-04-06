import pb from '@/lib/pocketbase/client'

export const getParcelamentosPaginated = async (
  page: number,
  perPage: number = 10,
  search?: string,
  status?: string,
) => {
  const filters: string[] = []

  if (status && status !== 'Todos') {
    filters.push(`status = '${status}'`)
  }

  if (search) {
    filters.push(`(cnpj ~ '${search}' || empresa_nome ~ '${search}')`)
  }

  return pb.collection('parcelamentos').getList(page, perPage, {
    sort: '-created',
    filter: filters.join(' && '),
  })
}

export const getParcelamentosStats = async () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .replace('T', ' ')

  const [ativos, encerrados, enviados, pendentes] = await Promise.all([
    pb.collection('parcelamentos').getList(1, 1, { filter: `status = 'Ativo'` }),
    pb.collection('parcelamentos').getList(1, 1, { filter: `status = 'Encerrado'` }),
    pb.collection('parcelamentos').getList(1, 1, {
      filter: `status = 'Enviado' && (created >= '${startOfMonth}' || updated >= '${startOfMonth}')`,
    }),
    pb.collection('parcelamentos').getList(1, 1, { filter: `status = 'Pendente'` }),
  ])

  return {
    ativos: ativos.totalItems,
    encerrados: encerrados.totalItems,
    enviados: enviados.totalItems,
    pendentes: pendentes.totalItems,
  }
}

export const getParcelamento = (id: string) => pb.collection('parcelamentos').getOne(id)

export const getParcelamentoByCnpj = async (cnpj: string) => {
  try {
    return await pb.collection('parcelamentos').getFirstListItem(`cnpj = "${cnpj}"`)
  } catch (err) {
    return null
  }
}

export const createParcelamento = (data: any) =>
  pb.collection('parcelamentos').create({ ...data, usuario_id: pb.authStore.record?.id })

export const updateParcelamento = (id: string, data: any) =>
  pb.collection('parcelamentos').update(id, data)

export const deleteParcelamento = (id: string) => pb.collection('parcelamentos').delete(id)
