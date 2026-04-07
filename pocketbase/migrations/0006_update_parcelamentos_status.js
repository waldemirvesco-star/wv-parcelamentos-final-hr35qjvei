migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('parcelamentos')

    col.fields.add(
      new SelectField({
        name: 'situacao',
        values: ['Ativo', 'Encerrado', 'Rompido'],
        maxSelect: 1,
      }),
    )

    col.fields.add(
      new SelectField({
        name: 'status_envio',
        values: ['Enviado', 'Pendente'],
        maxSelect: 1,
      }),
    )

    app.save(col)

    const records = app.findRecordsByFilter('parcelamentos', '1=1', '', 10000, 0)
    for (let record of records) {
      const oldStatus = record.get('status')
      let situacao = 'Ativo'
      let statusEnvio = 'Pendente'

      if (oldStatus === 'Encerrado') {
        situacao = 'Encerrado'
        statusEnvio = 'Enviado'
      } else if (oldStatus === 'Enviado') {
        situacao = 'Ativo'
        statusEnvio = 'Enviado'
      } else if (oldStatus === 'Pendente' || oldStatus === 'Ativo') {
        situacao = 'Ativo'
        statusEnvio = 'Pendente'
      }

      record.set('situacao', situacao)
      record.set('status_envio', statusEnvio)
      app.saveNoValidate(record)
    }

    col.fields.removeByName('status')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('parcelamentos')

    col.fields.add(
      new SelectField({
        name: 'status',
        values: ['Ativo', 'Encerrado', 'Enviado', 'Pendente'],
        maxSelect: 1,
      }),
    )

    app.save(col)

    const records = app.findRecordsByFilter('parcelamentos', '1=1', '', 10000, 0)
    for (let record of records) {
      const situacao = record.get('situacao')
      const statusEnvio = record.get('status_envio')

      if (situacao === 'Encerrado') {
        record.set('status', 'Encerrado')
      } else if (statusEnvio === 'Enviado') {
        record.set('status', 'Enviado')
      } else {
        record.set('status', 'Ativo')
      }
      app.saveNoValidate(record)
    }

    col.fields.removeByName('situacao')
    col.fields.removeByName('status_envio')
    app.save(col)
  },
)
