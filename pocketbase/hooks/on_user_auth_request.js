onRecordAuthRequest((e) => {
  if (e.record && e.record.collection().name === 'users') {
    if (e.record.get('active') === false) {
      throw new UnauthorizedError('Esta conta foi desativada pelo administrador.')
    }
  }
  e.next()
}, 'users')
