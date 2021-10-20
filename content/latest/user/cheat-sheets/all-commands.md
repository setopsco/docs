---
weight: 10
---

#  List of all commands

## Project
```shell
project                         # list all (accessible) projects for this account
project:create
project:info <PROJECT>                  # detailed info about a project
project:destroy <PROJECT> --force
```
## Stage
scoped: `-p <PROJECT>`
```shell
stage                           # list all stages for this project
stage:create <STAGE>
stage:info <STAGE>              # detailed info about a stage
stage:destroy <STAGE> --force
```
## App
scoped: `-p <PROJECT> -s <STAGE>`
```shell
app                             # list all apps for this project/stage
app:create <APPNAME>
app:info <APPNAME>              # detailed info and hints regarding production readyness
app:destroy <APPNAME>
```

### Container
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
container                                         # list/show command (container settings for this app)
container:set command "/bin/bash"
container:set command -- sh -c "cd /srv; ./go.sh" # example with shell escaping; also see hint
container:set entrypoint -- "/docker-entrypoint.sh"
container:set health-check -- curl -l http://localhost
container:unset command|entrypoint|health-check    # sets option back to default value
```

### Resource
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
resource
resource:set cpu 128
resource:set memory 256
resource:set scale 5
resource:unset scale           # sets option back to default value
```

### Network
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
network                        # show network settings for this app
network:set protocol tcp
network:set public true
network:set port 5000
network:set health-check-path "/.well-known/health-check"
network:set health-check-status 200-499,501
network:unset protocol|public|port|health-check-path|healtcheck-status
```

### Environment Variables
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
env                                 # list all environment variables for this app
env:set FOO="bar" --description "My foo setting"
env:set FOO="bar baz"
env:set FOO                         # short form for environment:set foo true
env:unset KEY
```

### Domain
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
domain                                         # list all domains for this app
domain:create zwei.beer --primary              # short form for --primary true --static-ip true
domain:destroy zwei.beer
domain:validate zwei.beer
--domain D option:set static-ip true
--domain D option:set primary true             # sets all other domains to primary false
--domain D option:unset static-ip|primary      # sets option back to default value
```

### Task
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
task                               # list all tasks (running/exited)
task:info ID
task:run -- rails c                # interactive by default
task:run --detach -- rake db:migrate
task:run --interactive -- bash
task:attach ID -- bash
task:stop ID                       # stops a running task
```

### Release
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
release                            # list all releases
release:create sha256:ba2cc...     # returns automatic generated id
release:activate ID
```

### Logs
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME> `
```shell
log --task TASKID --limit --follow --after YYYY-MM-DDTHH:MM --before YYYY-MM-DDTHH:MM --all-health-checks --no-source
```

### Notification
scoped: `-p <PROJECT> -s <STAGE>`
```shell
notification
notification:create ops_my_genie --type webhook --target https://api.eu.opsgenie.com/v1/json/cloudwatch?apiKey=KEY
notification:destroy ops_my_genie
```

## Service
scoped: `-p <PROJECT> -s <STAGE> service`
```shell
service                                    # list all services for this stage
service:create db1 --type postgresql11 --plan shared
service:info db1
service:destroy db1
--service S option                         # Lists options for services
--service S option:set extensions postgis,pg_stat_statements,hstore
--service S option:unset extensions        # sets option back to default value
```

### Backup
scoped: `-p <PROJECT> -s <STAGE> --service S`
```shell
backup                         # list all existing (physical) backups and uploads and displays the schedule plan (if exists)
backup:info ID                 # get details about a backup or an uploaded file
backup:create
backup:destroy ID              # stops a running backup or deletes a previous backup/uploaded file
backup:download ID             # downloads a backup archive
backup:upload FILE             # uploads a (valid) file for restore
backup:restore ID
backup:schedule [--hour 3] [--day Mon]
backup:unschedule
```

### Link
scoped: `-p <PROJECT> -s <STAGE> --app <APPNAME>`
```shell
link                                              # list all links to services for this app
link:create <SERVICE> --env DATABASE_URL          # creates link between app and service
link:destroy <SERVICE>
```

## Changeset
scoped: `-p <PROJECT> -s <STAGE>`
```shell
changeset:info                 # gets details about a certain commit (current changeset for empty argument)
changeset:commit
changeset:discard
```

## User
scope: `-p <PROJECT>`
```shell
user                                      # list invited users for a stage (with their roles)
user:invite EMAIL --role member|admin     # invite a user (by email) to a project/stage (with an optional role)
user:remove                               # remove access rights for this scope (does not delete the user itself)
```

## Login
```shell
login
login:info
logout
```

## Signup
```shell
signup
```

## Other
```shell
completion          # Generates a shell completion script
version             # Prints version of the CLI
help|-h             # Shows help
```
