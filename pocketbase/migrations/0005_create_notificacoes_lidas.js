migrate(
  (app) => {
    const collection = new Collection({
      name: 'notificacoes_lidas',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'parcelamento_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('parcelamentos').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo_alerta',
          type: 'select',
          required: true,
          values: ['Vencido', 'Proximo'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_notificacoes_lidas_unique ON notificacoes_lidas (usuario_id, parcelamento_id, tipo_alerta)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('notificacoes_lidas')
    app.delete(collection)
  },
)
