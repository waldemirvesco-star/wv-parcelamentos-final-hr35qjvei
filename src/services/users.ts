import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Standard User'
  active: boolean
  created: string
  updated: string
}

export const getUsers = async (): Promise<User[]> => {
  return pb.collection('users').getFullList({ sort: '-created' })
}

export const createUser = async (data: Partial<User> & { password?: string }) => {
  return pb.collection('users').create({
    ...data,
    emailVisibility: true,
    passwordConfirm: data.password,
  })
}

export const updateUser = async (id: string, data: Partial<User>) => {
  return pb.collection('users').update(id, data)
}

export const deleteUser = async (id: string) => {
  return pb.collection('users').delete(id)
}
