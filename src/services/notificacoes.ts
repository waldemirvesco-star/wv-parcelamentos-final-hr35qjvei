import pb from '@/lib/pocketbase/client'

export const getUserNotificacoesLidas = (userId: string) => {
  return pb.collection('notificacoes_lidas').getFullList({
    filter: `usuario_id = "${userId}"`,
  })
}

export const markNotificacaoAsRead = async (
  userId: string,
  parcelamentoId: string,
  tipoAlerta: 'Vencido' | 'Proximo',
) => {
  try {
    await pb.collection('notificacoes_lidas').create({
      usuario_id: userId,
      parcelamento_id: parcelamentoId,
      tipo_alerta: tipoAlerta,
    })
  } catch (e) {
    // Fail silently - either it already exists (unique constraint) or network error
  }
}

export const markAllNotificacoesAsRead = async (
  userId: string,
  notifications: Array<{ parcelamento_id: string; tipo: 'Vencido' | 'Proximo' }>,
) => {
  const promises = notifications.map((n) =>
    markNotificacaoAsRead(userId, n.parcelamento_id, n.tipo),
  )
  await Promise.allSettled(promises)
}
