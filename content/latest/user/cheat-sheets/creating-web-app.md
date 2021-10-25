---
weight: 20
---
# Commands for creating a Web App

{{< hint info >}}
💡 You can replace the default values of the commands for `PROJECT`, `STAGE` and `APPNAME` in the form on the right side! A standard pattern might be `myproject`, `production` and `web` (see [concepts]({{< relref "/latest/user/concepts" >}})).
{{< /hint >}}

We recommend creating shortcuts for the commands `setops` and `setops -p <PROJECT> -s <STAGE>`. See our best practices for setting an [Alias]({{< relref "/latest/user/best-practices/alias" >}}).

## Create Project and Stage
```shell
setops project:create <PROJECT>
setops -p <PROJECT> stage:create <STAGE>
```

## Create App for Project

```shell
setops -p <PROJECT> -s <STAGE> app:create <APPNAME>
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set public true
setops -p <PROJECT> -s <STAGE> changeset:commit
```

## Set Container Settings

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set entrypoint launcher
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set command -- bundle exec puma --config config/puma.rb
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set health-check --interval 5 --timeout 5 --retries 10 --start-period 5 -- /bin/sh -c 'curl -s http://localhost:5000/.well-known/health-check | grep ok'
setops -p <PROJECT> -s <STAGE> changeset:commit
```
## Check status
```shell
setops -p <PROJECT> -s <STAGE> changeset:info      # shows not committed changesets -> useful before committing changes

setops -p <PROJECT> -s <STAGE> app:info <APPNAME>  # shows ENVs, domain, releases, status, resources and container stuff
```

## Set Environment Variables (ENV) for App
See best practices for [migrating ENV variables]({{< relref "/latest/user/best-practices/migrate-environment-variables" >}}).
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set APPLICATION_PORT=5000
setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set RAILS_ENV=production
setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set RAILS_LOG_TO_STDOUT=true
setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set SECRET_KEY_BASE=foobar1234#
setops -p <PROJECT> -s <STAGE> changeset:commit
```
## Create Services for App
We create the services `database` (postgresql11), `store` (S3) and `queue` (Redis) for our project and link it to our app `web`.

```shell
setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
setops -p <PROJECT> -s <STAGE> service:create queue --type redis6 --plan cache.t2.micro
setops -p <PROJECT> -s <STAGE> service:create store --type s3

setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key DATABASE_URL
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create queue --env-key REDIS_URL
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create store --env-key S3_DATA_URL
setops -p <PROJECT> -s <STAGE> changeset:commit
```

## Create Release for App
First, you need to build a docker image for your application. Then push it to the SetOps docker image registry. Look at best practices for [building an Image]({{< relref "/latest/user/best-practices/build-image" >}})
```shell
setops registry:login
docker tag [MYAPP] api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
docker push api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:create sha256:[...]
setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:activate 1
setops -p <PROJECT> -s <STAGE> changeset:commit
```
## Check Running App
```shell
setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
```

## Check Health Status
If `RUNNING` & `HEALTHY` :white_check_mark: Now you can open the website at:
`https://<APPNAME>.<STAGE>.<PROJECT>.$YOURDOMAIN/`
e.g. `https://web.staging.myproject.setopsapps.net/`

## Logs
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log -f
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log -f | egrep -v '/.well-known/health-check'  # to filter out Health Check logs
```

## One-Off Tasks
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- echo "Hello World"
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- bundle exec rake db:migrate
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- tmate -F
```

## Get S3 Data URL from App {id=get-s3-url}
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- printenv | grep S3_DATA_URL
```

## Upload Database & S3 Data
See [Backup & Restore]({{< relref "/latest/user/interaction/backup-restore" >}}) for further information.
```shell
setops -p <PROJECT> -s <STAGE> --service <SERVICE> backup
setops -p <PROJECT> -s <STAGE> --service <SERVICE> backup:upload </path/to/my/backup>
setops -p <PROJECT> -s <STAGE> --service <SERVICE> backup            # copy the ID of the latest Backup
setops -p <PROJECT> -s <STAGE> --service <SERVICE> backup:restore <ID>
```

## Add Worker and other App-Container
If your application uses background tasks like `delayed-job`, `sidekiq`, or `clockwork`, you need to create a separate App for that.

1. Create the app (`worker` might be a good name)
1. Set container settings (Health Check is not needed if the app is private)
1. Set all required ENV (you can copy them from `web`)
1. Link required services (like database or queue)
1. Create and activate a release (with the same digest as for `web`)
