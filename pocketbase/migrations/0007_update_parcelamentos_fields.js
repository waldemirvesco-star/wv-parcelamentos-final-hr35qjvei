migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('parcelamentos')

    if (!col.fields.getByName('dia_util_limite')) {
      col.fields.add(new NumberField({ name: 'dia_util_limite' }))
    }
    if (!col.fields.getByName('parcelas_totais')) {
      col.fields.add(new NumberField({ name: 'parcelas_totais' }))
    }
    if (!col.fields.getByName('data_limite_envio')) {
      col.fields.add(new TextField({ name: 'data_limite_envio' }))
    }
    if (!col.fields.getByName('data_ultimo_envio')) {
      col.fields.add(new TextField({ name: 'data_ultimo_envio' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('parcelamentos')

    col.fields.removeByName('dia_util_limite')
    col.fields.removeByName('parcelas_totais')
    col.fields.removeByName('data_limite_envio')
    col.fields.removeByName('data_ultimo_envio')

    app.save(col)
  },
)
