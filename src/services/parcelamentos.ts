import pb from '@/lib/pocketbase/client'

export const getParcelamentos = () =>
  pb.collection('parcelamentos').getFullList({ sort: '-created' })

export const getParcelamento = (id: string) => pb.collection('parcelamentos').getOne(id)

export const createParcelamento = (data: any) =>
  pb.collection('parcelamentos').create({ ...data, usuario_id: pb.authStore.record?.id })

export const updateParcelamento = (id: string, data: any) =>
  pb.collection('parcelamentos').update(id, data)

export const deleteParcelamento = (id: string) => pb.collection('parcelamentos').delete(id)
