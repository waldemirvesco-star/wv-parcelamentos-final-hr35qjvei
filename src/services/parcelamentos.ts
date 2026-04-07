import pb from '@/lib/pocketbase/client'

export const getParcelamentosPaginated = async (
  page: number,
  perPage: number,
  searchTerm: string,
  statusFilter: string,
  orgaoFilter: string,
  metodoEnvioFilter: string,
  dateStart: string,
  dateEnd: string,
) => {
  const filters: string[] = []

  if (searchTerm) {
    filters.push(`(cnpj ~ "${searchTerm}" || empresa_nome ~ "${searchTerm}")`)
  }
  if (statusFilter && statusFilter !== 'Todos') {
    filters.push(`status = "${statusFilter}"`)
  }
  if (orgaoFilter && orgaoFilter !== 'Todos') {
    filters.push(`orgao = "${orgaoFilter}"`)
  }
  if (dateStart) {
    filters.push(`data_adesao >= "${dateStart}"`)
  }
  if (dateEnd) {
    filters.push(`data_adesao <= "${dateEnd}"`)
  }

  const result = await pb.collection('parcelamentos').getList(page, perPage, {
    filter: filters.length > 0 ? filters.join(' && ') : '',
    sort: '-created',
  })

  return {
    items: result.items,
    totalPages: result.totalPages,
    totalItems: result.totalItems,
  }
}

export const getParcelamentosStats = async (
  searchTerm?: string,
  orgaoFilter?: string,
  metodoEnvioFilter?: string,
  dateStart?: string,
  dateEnd?: string,
  statusFilter?: string,
) => {
  const getCount = async (status: string) => {
    const filters: string[] = [`status = "${status}"`]
    if (searchTerm) filters.push(`(cnpj ~ "${searchTerm}" || empresa_nome ~ "${searchTerm}")`)
    if (orgaoFilter && orgaoFilter !== 'Todos') filters.push(`orgao = "${orgaoFilter}"`)
    if (dateStart) filters.push(`data_adesao >= "${dateStart}"`)
    if (dateEnd) filters.push(`data_adesao <= "${dateEnd}"`)
    if (statusFilter && statusFilter !== 'Todos' && statusFilter !== status) return 0

    const res = await pb.collection('parcelamentos').getList(1, 1, {
      filter: filters.join(' && '),
    })
    return res.totalItems
  }

  const [ativos, encerrados, enviados, pendentes] = await Promise.all([
    getCount('Ativo'),
    getCount('Encerrado'),
    getCount('Enviado'),
    getCount('Pendente'),
  ])

  return { ativos, encerrados, enviados, pendentes }
}

export const getDistributionByOrgao = async () => {
  const result = await pb.collection('parcelamentos').getFullList({
    fields: 'orgao',
  })

  const distribution: Record<string, number> = {}
  result.forEach((item) => {
    const orgao = item.orgao || 'Outros'
    distribution[orgao] = (distribution[orgao] || 0) + 1
  })

  return Object.entries(distribution).map(([orgao, value]) => ({ orgao, value }))
}

export const deleteParcelamento = async (id: string) => {
  return pb.collection('parcelamentos').delete(id)
}

export const getAllParcelamentosFiltered = async (
  searchTerm: string,
  statusFilter: string,
  orgaoFilter: string,
  metodoEnvioFilter: string,
  dateStart: string,
  dateEnd: string,
) => {
  const filters: string[] = []

  if (searchTerm) {
    filters.push(`(cnpj ~ "${searchTerm}" || empresa_nome ~ "${searchTerm}")`)
  }
  if (statusFilter && statusFilter !== 'Todos') {
    filters.push(`status = "${statusFilter}"`)
  }
  if (orgaoFilter && orgaoFilter !== 'Todos') {
    filters.push(`orgao = "${orgaoFilter}"`)
  }
  if (dateStart) {
    filters.push(`data_adesao >= "${dateStart}"`)
  }
  if (dateEnd) {
    filters.push(`data_adesao <= "${dateEnd}"`)
  }

  return pb.collection('parcelamentos').getFullList({
    filter: filters.length > 0 ? filters.join(' && ') : '',
    sort: '-created',
  })
}

export const createParcelamento = async (data: any) => {
  return pb.collection('parcelamentos').create(data)
}

export const getParcelamentoByCnpj = async (cnpj: string) => {
  try {
    return await pb.collection('parcelamentos').getFirstListItem(`cnpj = "${cnpj}"`)
  } catch (error) {
    return null
  }
}

export const getParcelamento = async (id: string) => {
  return pb.collection('parcelamentos').getOne(id)
}

export const updateParcelamento = async (id: string, data: any) => {
  return pb.collection('parcelamentos').update(id, data)
}

export const getUserParcelamentos = async (userId?: string) => {
  const options: any = {
    sort: '-created',
  }
  if (userId) {
    options.filter = `user = "${userId}"`
  }
  return pb.collection('parcelamentos').getFullList(options)
}
