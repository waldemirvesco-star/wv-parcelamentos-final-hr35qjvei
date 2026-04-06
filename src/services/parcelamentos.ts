import pb from '@/lib/pocketbase/client'

export const getUserParcelamentos = (userId: string) => {
  return pb.collection('parcelamentos').getFullList({
    filter: `usuario_id = "${userId}"`,
    sort: '-updated',
  })
}
