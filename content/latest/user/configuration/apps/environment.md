---
weight: 50
---
## Environment Variables

The Environment Variables for an App can be managed via the `env` commands. Like in any other deployments, *ENV*
variables store and provide information that should not be included in the codebase. They can be used to configure the
App. Please consult the documentation of your App or respective technology used to determine what Environment Variables need to be configured.

### Set an Environment Variable

A new Environment Variable can be defined for an existing App by executing
`env:set ENVKEY=ENVVALUE [--description "ENVDESCRIPTION"]`. The parameter `description`
is optional and can be used to provide a short description of the Environemnt Variable and/or its effect on the App.

{{< hint info >}}
ENV keys must comply with the following naming conventions. A key must consist only of letters (a-z, A-Z), numbers (0-9) and underscores (_), starting with a letter or underscore, a total length of 1 to 256 characters and none of the reserved keywords (APP_ENV_ID, PORT, PORTS, PROTOCOL).
{{< /hint >}}

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set RACK_ENV=production --description "The Rack environment variable"
```
```
ENVs:
-- RACK_ENV=production   (The Rack environment variable)
```

You can overwrite the current value of an existing `ENV` variable by running this command again using the same `ENVKEY`.

### Show Environment Variables

Use `env` to list all Environment Variables for an App.

{{< hint warning >}}
`env` only lists committed Environment Variables. In order to use this command both the App and the
respective *ENV* have to be created and committed. If the App has been created but not committed, this command will
throw an `AppDoesNotExist` error. If the Environment Variable is not committed it will simply not show up in the response.
{{< /hint >}}

```shell
setops -s <STAGE> --app <APPNAME> env
```
```
Name:   <APPNAME>
ENVs:
-- RACK_ENV=production                 (The Rack environment variable)
-- DATABASE_URL=/path/to/my/database   (Address of the database)
```

### Unset an Environment Variable

Environment Variables can also be deleted. The command `env:unset ENVKEY` deletes
an * ENV* with the corresponding `ENVKEY` from the App.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:unset RACK_ENV
```