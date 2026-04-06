migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'wv@wvcontabil.com.br')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('wv@wvcontabil.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'wv@wvcontabil.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
