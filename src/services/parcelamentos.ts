import pb from '@/lib/pocketbase/client'

export const getUserParcelamentos = (userId: string) => {
  return pb.collection('parcelamentos').getFullList({
    filter: `usuario_id = "${userId}"`,
    sort: '-updated',
  })
}

export const getParcelamentosPaginated = (page: number, perPage: number, options?: any) => {
  return pb.collection('parcelamentos').getList(page, perPage, options)
}

export const getParcelamentosStats = async (userId?: string) => {
  const filter = userId ? `usuario_id = "${userId}"` : ''
  const records = await pb.collection('parcelamentos').getFullList({ filter })

  const total = records.length
  const valorTotal = records.reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0)

  const emAndamento = records.filter((p) => {
    const qtde = Number(p.quantidade_parcelas) || 0
    const atual = Number(p.parcela_atual) || 0
    return atual < qtde
  }).length

  const concluidos = records.filter((p) => {
    const qtde = Number(p.quantidade_parcelas) || 0
    const atual = Number(p.parcela_atual) || 0
    return atual >= qtde && qtde > 0
  }).length

  return { total, valorTotal, emAndamento, concluidos, records }
}

export const deleteParcelamento = (id: string) => {
  return pb.collection('parcelamentos').delete(id)
}

export const getAllParcelamentosFiltered = (options?: any) => {
  return pb.collection('parcelamentos').getFullList(options)
}

export const createParcelamento = (data: any) => {
  const payload = { ...data }
  if (!payload.usuario_id && pb.authStore.record?.id) {
    payload.usuario_id = pb.authStore.record.id
  }
  return pb.collection('parcelamentos').create(payload)
}

export const updateParcelamento = (id: string, data: any) => {
  return pb.collection('parcelamentos').update(id, data)
}

export const getParcelamentoByCnpj = async (cnpj: string, userId?: string) => {
  const filter = userId ? `cnpj = "${cnpj}" && usuario_id = "${userId}"` : `cnpj = "${cnpj}"`
  try {
    return await pb.collection('parcelamentos').getFirstListItem(filter)
  } catch (error) {
    return null
  }
}

export const getParcelamento = (id: string) => {
  return pb.collection('parcelamentos').getOne(id)
}
