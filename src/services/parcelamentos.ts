import pb from '@/lib/pocketbase/client'

export const getParcelamentosPaginated = async (
  page: number,
  perPage: number,
  searchTerm: string,
  situacaoFilter: string,
  statusEnvioFilter: string,
  orgaoFilter: string,
  metodoEnvioFilter: string,
  dateStart: string,
  dateEnd: string,
) => {
  const filters: string[] = []

  if (searchTerm) {
    filters.push(`(cnpj ~ "${searchTerm}" || empresa_nome ~ "${searchTerm}")`)
  }
  if (situacaoFilter && situacaoFilter !== 'Todas' && situacaoFilter !== 'Todos') {
    filters.push(`situacao = "${situacaoFilter}"`)
  }
  if (statusEnvioFilter && statusEnvioFilter !== 'Todos') {
    filters.push(`status_envio = "${statusEnvioFilter}"`)
    if (statusEnvioFilter === 'Pendente') {
      filters.push(`situacao = "Ativo"`)
    }
  }
  if (orgaoFilter && orgaoFilter !== 'Todos') {
    filters.push(`orgao = "${orgaoFilter}"`)
  }
  if (metodoEnvioFilter && metodoEnvioFilter !== 'Todos') {
    if (metodoEnvioFilter === 'Ambos') {
      filters.push(`metodo_envio ~ "Email"`)
      filters.push(`metodo_envio ~ "WhatsApp"`)
    } else {
      filters.push(`metodo_envio ~ "${metodoEnvioFilter}"`)
    }
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
  situacaoFilter?: string,
  statusEnvioFilter?: string,
) => {
  const getCount = async (filterStr: string) => {
    const filters: string[] = []
    if (filterStr) filters.push(filterStr)
    if (searchTerm) filters.push(`(cnpj ~ "${searchTerm}" || empresa_nome ~ "${searchTerm}")`)
    if (orgaoFilter && orgaoFilter !== 'Todos') filters.push(`orgao = "${orgaoFilter}"`)
    if (dateStart) filters.push(`data_adesao >= "${dateStart}"`)
    if (dateEnd) filters.push(`data_adesao <= "${dateEnd}"`)
    if (situacaoFilter && situacaoFilter !== 'Todas' && situacaoFilter !== 'Todos')
      filters.push(`situacao = "${situacaoFilter}"`)
    if (statusEnvioFilter && statusEnvioFilter !== 'Todos')
      filters.push(`status_envio = "${statusEnvioFilter}"`)

    const res = await pb.collection('parcelamentos').getList(1, 1, {
      filter: filters.join(' && '),
    })
    return res.totalItems
  }

  const [ativos, encerrados, rompidos, enviados, pendentes] = await Promise.all([
    getCount('situacao = "Ativo"'),
    getCount('situacao = "Encerrado"'),
    getCount('situacao = "Rompido"'),
    getCount('status_envio = "Enviado"'),
    getCount('status_envio = "Pendente" && situacao = "Ativo"'),
  ])

  return { ativos, encerrados, rompidos, enviados, pendentes }
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
  situacaoFilter: string,
  statusEnvioFilter: string,
  orgaoFilter: string,
  metodoEnvioFilter: string,
  dateStart: string,
  dateEnd: string,
) => {
  const filters: string[] = []

  if (searchTerm) {
    filters.push(`(cnpj ~ "${searchTerm}" || empresa_nome ~ "${searchTerm}")`)
  }
  if (situacaoFilter && situacaoFilter !== 'Todas' && situacaoFilter !== 'Todos') {
    filters.push(`situacao = "${situacaoFilter}"`)
  }
  if (statusEnvioFilter && statusEnvioFilter !== 'Todos') {
    filters.push(`status_envio = "${statusEnvioFilter}"`)
    if (statusEnvioFilter === 'Pendente') {
      filters.push(`situacao = "Ativo"`)
    }
  }
  if (orgaoFilter && orgaoFilter !== 'Todos') {
    filters.push(`orgao = "${orgaoFilter}"`)
  }
  if (metodoEnvioFilter && metodoEnvioFilter !== 'Todos') {
    if (metodoEnvioFilter === 'Ambos') {
      filters.push(`metodo_envio ~ "Email"`)
      filters.push(`metodo_envio ~ "WhatsApp"`)
    } else {
      filters.push(`metodo_envio ~ "${metodoEnvioFilter}"`)
    }
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
