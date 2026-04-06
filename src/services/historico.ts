import pb from '@/lib/pocketbase/client'

export const getHistorico = (parcelamentoId: string) =>
  pb.collection('historico_alteracoes').getFullList({
    filter: `parcelamento_id = "${parcelamentoId}"`,
    sort: '-created',
    expand: 'usuario_id',
  })

export const createHistorico = (data: any) =>
  pb.collection('historico_alteracoes').create({ ...data, usuario_id: pb.authStore.record?.id })
