migrate(
  (app) => {
    const parcelamentos = new Collection({
      name: 'parcelamentos',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        { name: 'cnpj', type: 'text', required: true },
        { name: 'empresa_nome', type: 'text', required: true },
        {
          name: 'orgao',
          type: 'select',
          values: ['Receita Federal', 'Estado SP', 'Prefeitura', 'PGFN', 'Secretaria da Fazenda'],
          maxSelect: 1,
        },
        { name: 'data_adesao', type: 'text' },
        { name: 'quantidade_parcelas', type: 'number' },
        { name: 'parcela_atual', type: 'number' },
        { name: 'numero_processo', type: 'text' },
        { name: 'site_url', type: 'url' },
        { name: 'senha_acesso', type: 'text' },
        { name: 'metodo_envio', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['Ativo', 'Encerrado', 'Enviado', 'Pendente'],
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
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(parcelamentos)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('parcelamentos')
    app.delete(collection)
  },
)
