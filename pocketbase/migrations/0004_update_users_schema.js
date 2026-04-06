migrate(
  (app) => {
    // 1. Update users collection schema
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['Admin', 'Standard User'],
          required: true,
        }),
      )
    }

    if (!users.fields.getByName('active')) {
      users.fields.add(
        new BoolField({
          name: 'active',
        }),
      )
    }

    // Update API Rules for users
    users.listRule = "@request.auth.role = 'Admin' || id = @request.auth.id"
    users.viewRule = "@request.auth.role = 'Admin' || id = @request.auth.id"
    users.createRule = "@request.auth.role = 'Admin'"
    users.updateRule = "@request.auth.role = 'Admin' || id = @request.auth.id"
    users.deleteRule = "@request.auth.role = 'Admin'"

    app.save(users)

    // 2. Update parcelamentos collection rules for shared visibility
    const parcelamentos = app.findCollectionByNameOrId('parcelamentos')
    parcelamentos.listRule = "@request.auth.id != ''"
    parcelamentos.viewRule = "@request.auth.id != ''"
    app.save(parcelamentos)

    // 3. Set default values for existing users
    // PocketBase Bool fields default to false, we want existing users to be active
    app
      .db()
      .newQuery(
        "UPDATE users SET active = 1, role = 'Standard User' WHERE role IS NULL OR role = ''",
      )
      .execute()

    // 4. Elevate seed user to Admin
    try {
      const admin = app.findAuthRecordByEmail('users', 'wv@wvcontabil.com.br')
      admin.set('role', 'Admin')
      admin.set('active', true)
      app.save(admin)
    } catch (_) {
      // Ignore if seed user doesn't exist
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (users.fields.getByName('role')) {
      users.fields.removeByName('role')
    }
    if (users.fields.getByName('active')) {
      users.fields.removeByName('active')
    }

    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'

    app.save(users)

    const parcelamentos = app.findCollectionByNameOrId('parcelamentos')
    parcelamentos.listRule = "@request.auth.id != '' && usuario_id = @request.auth.id"
    parcelamentos.viewRule = "@request.auth.id != '' && usuario_id = @request.auth.id"
    app.save(parcelamentos)
  },
)
