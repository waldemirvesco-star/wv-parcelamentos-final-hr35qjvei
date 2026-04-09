migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('historico_alteracoes')
    collection.listRule = "@request.auth.id != ''"
    collection.viewRule = "@request.auth.id != ''"
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('historico_alteracoes')
    collection.listRule = "@request.auth.id != '' && usuario_id = @request.auth.id"
    collection.viewRule = "@request.auth.id != '' && usuario_id = @request.auth.id"
    app.save(collection)
  },
)
