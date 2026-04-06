import pb from '@/lib/pocketbase/client'

const buildFilters = (
  search?: string,
  status?: string,
  orgao?: string,
  metodoEnvio?: string,
  dataInicio?: string,
  dataFim?: string,
) => {
  const filters: string[] = []

  if (status && status !== 'Todos') filters.push(`status = '${status}'`)
  if (orgao && orgao !== 'Todos') filters.push(`orgao = '${orgao}'`)
  if (metodoEnvio && metodoEnvio !== 'Todos') filters.push(`metodo_envio ~ '${metodoEnvio}'`)
  if (dataInicio) filters.push(`data_adesao >= '${dataInicio}'`)
  if (dataFim) filters.push(`data_adesao <= '${dataFim}'`)
  if (search) filters.push(`(cnpj ~ '${search}' || empresa_nome ~ '${search}')`)

  return filters.join(' && ')
}

export const getParcelamentosPaginated = async (
  page: number,
  perPage: number = 10,
  search?: string,
  status?: string,
  orgao?: string,
  metodoEnvio?: string,
  dataInicio?: string,
  dataFim?: string,
) => {
  const filter = buildFilters(search, status, orgao, metodoEnvio, dataInicio, dataFim)

  return pb.collection('parcelamentos').getList(page, perPage, {
    sort: '-created',
    filter,
  })
}

export const getAllParcelamentosFiltered = async (
  search?: string,
  status?: string,
  orgao?: string,
  metodoEnvio?: string,
  dataInicio?: string,
  dataFim?: string,
) => {
  const filter = buildFilters(search, status, orgao, metodoEnvio, dataInicio, dataFim)

  return pb.collection('parcelamentos').getFullList({
    sort: '-created',
    filter,
  })
}

export const getParcelamentosStats = async (
  search?: string,
  orgao?: string,
  metodoEnvio?: string,
  dataInicio?: string,
  dataFim?: string,
  statusFilter?: string,
) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .replace('T', ' ')

  const baseFilter = buildFilters(search, undefined, orgao, metodoEnvio, dataInicio, dataFim)

  const applyStatus = (status: string, extra?: string) => {
    let f = `status = '${status}'`
    if (baseFilter) f += ` && (${baseFilter})`
    if (extra) f += ` && (${extra})`
    return f
  }

  const buildStatFilter = (status: string, extra?: string) => {
    if (statusFilter && statusFilter !== 'Todos' && statusFilter !== status) {
      return "id = '0'"
    }
    return applyStatus(status, extra)
  }

  const [ativos, encerrados, enviados, pendentes] = await Promise.all([
    pb.collection('parcelamentos').getList(1, 1, { filter: buildStatFilter('Ativo') }),
    pb.collection('parcelamentos').getList(1, 1, { filter: buildStatFilter('Encerrado') }),
    pb.collection('parcelamentos').getList(1, 1, {
      filter: buildStatFilter(
        'Enviado',
        `(created >= '${startOfMonth}' || updated >= '${startOfMonth}')`,
      ),
    }),
    pb.collection('parcelamentos').getList(1, 1, { filter: buildStatFilter('Pendente') }),
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
