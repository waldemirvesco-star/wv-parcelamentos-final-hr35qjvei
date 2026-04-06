migrate(
  (app) => {
    const parcelamentosId = app.findCollectionByNameOrId('parcelamentos').id
    const historico = new Collection({
      name: 'historico_alteracoes',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        {
          name: 'parcelamento_id',
          type: 'relation',
          required: true,
          collectionId: parcelamentosId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'campo_alterado', type: 'text', required: true },
        { name: 'valor_anterior', type: 'text' },
        { name: 'valor_novo', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(historico)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('historico_alteracoes')
    app.delete(collection)
  },
)
