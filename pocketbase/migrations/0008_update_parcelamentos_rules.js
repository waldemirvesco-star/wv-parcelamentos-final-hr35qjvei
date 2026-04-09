migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('parcelamentos')
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != ''"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('parcelamentos')
    col.updateRule = "@request.auth.id != '' && usuario_id = @request.auth.id"
    col.deleteRule = "@request.auth.id != '' && usuario_id = @request.auth.id"
    app.save(col)
  },
)
