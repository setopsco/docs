---
weight: 10
---
# Apps
{{< hint info >}}
💡 You can replace the default values of the commands for `PROJECT`, `STAGE` and `APPNAME` in the form on the right side! A standard pattern might be `myproject`, `production` and `web` (see [concepts]({{< relref "/latest/user/concepts" >}})).
{{< /hint >}}

An **App** is a task that the SetOps platform runs. A stage may have many Apps. Apps are always assumed
to be long-running. Each of these containers are called a **Task**. For example, web applications
will usually have a task named `web` for the application server, and possibly a task named `job` for running background jobs. Apps are assumed to be stateless – they persist user data by accessing services.

Let's create an app named `<APPNAME>` on the stage `<STAGE>` with `app:create <APPNAME>`:

```shell
setops -p <PROJECT> -s <STAGE> app:create <APPNAME>
```

{{< hint info >}}
The name for apps must only contain lowercase letters `a-z` and numbers `0-9` and dashes `-`. The name must be between 3 and 16 characters long and start with a lowercase letter.
{{< /hint >}}

Note that your new app `<APPNAME>` doesn't show up when you run `app`:

```shell
setops -p <PROJECT> -s <STAGE> app
```
```
+------+
| NAME |
+------+
+------+
```

The reason for this is that the `app:create` command did not change anything immediately. It was added to your current Changeset instead. Commands such as `app` or `info` always display the view of your stage the last time anyone successfully committed a changeset.

Run `setops -p <PROJECT> -s <STAGE> changeset:commit` to commit the Changeset.

[Read more on Changesets here.]({{< relref "/latest/user/configuration/changesets" >}})

## Configuration Overview

An App can be configured with the following parameters. Newly created Apps are initialized with the indicated defaults.

These parameters are grouped into the following configuration topics:

- `container`
- `network`
- `resources`
- `env`
- `domains`

| Command                                                                                                     | Subcommand | Valid Values | Default | Description |
|-------------------------------------------------------------------------------------------------------------|---|---|---|---|
| **Container**                                                                                               |
| [Command]({{< relref "/latest/user/configuration/apps/container#command" >}})                               | `set`, `unset` | bash command string | `[]` | Command that is used to start the App, e.g. `bundle exec rails server` |
| [Entrypoint]({{< relref "/latest/user/configuration/apps/container#entrypoint" >}})                         | `set`, `unset` | bash command string | `[]` | Defines the entrypoint that is used for the evaluation of commands e.g. `/bin/sh -c` |
| [Container Health Check]({{< relref "/latest/user/configuration/apps/container#container-health-check" >}}) | `set`, `unset` | see paragraph | - | Defines how the health of the App will be checked. |
| **Network**                                                                                                 |
| [Protocol]({{< relref "/latest/user/configuration/apps/network#protocol" >}})                               | `set` | `http`, `tcp` | `http` | Determines the protocol that is used to connect to the App. |
| [Public]({{< relref "/latest/user/configuration/apps/network#public" >}})                                   | `set` | `true`, `false` | `false` | Defines if the App is publicly accessible. |
| [Port]({{< relref "/latest/user/configuration/apps/network#port" >}})                                       | `set` | `1..65535` | `5000` | Defines a custom port the application listens to internally. |
| [Network Health Check]({{< relref "/latest/user/configuration/apps/network#network-health-check" >}})       | `set`, `unset` | see paragraph | - | Defines how the health of the App will be checked. |
| **Resource**                                                                                                |
| [CPU]({{< relref "/latest/user/configuration/apps/resources#cpu" >}})                                       | `set` | see paragraph | `128` | Assigns the amount of vCPU units (1024 = 1 vCPU) to an App. |
| [Memory]({{< relref "/latest/user/configuration/apps/resources#memory" >}})                                 | `set` | see paragraph | `256` | Assigns the memory size (megabytes) to an App. |
| [Scale]({{< relref "/latest/user/configuration/apps/resources#scale" >}})                                   | `set` | `0..16` | 1 | Defines how many instances of the App should be created. |
| **Environment**                                                                                             |
| [ENVs]({{< relref "/latest/user/configuration/apps/environment" >}})                                        | `set`, `unset`, `show` | `key=value` | `[]` | Allows to define, modify and delete Environment Variables for an App. |
| **Domains**                                                                                                 |
| [Domains]({{< relref "/latest/user/configuration/apps/domains" >}})                                         | `create`, `destroy` | see paragraph | - | Allows the configuration of custom domains. |

To perform these configurations, you can refer to the following sections.

{{< hint warning >}}
Please note, that, like the creation of an App, also changes in the configuration of an App are added to a changeset
and have to be committed in order to become live. You will not be able to see your changes e.g. in
`app:info <APPNAME>` directly unless you commit them with `changeset:commit`.
{{< /hint >}}

{{< details "Example Workflow" >}}
```shell
# Example: Add a command to an existing app

# Set a command to an existing app
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set command -- bundle exec puma -b tcp://127.0.0.1:9292
Name:      <APPNAME>
Command:   [bundle exec puma -b tcp://127.0.0.1:9292]

# app:info does not list the change yet, since they are not committed
setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
Name:      <APPNAME>
Command:   []

# Commit the current changeset
setops -p <PROJECT> -s <STAGE> changeset:commit

# Now app:info shows the changes made
setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
Name:      <APPNAME>
Command:   [bundle exec puma -b tcp://127.0.0.1:9292]
```
{{< /details >}}

You can always display the present configuration of your App by running `app:info <APPNAME>`:

```shell
setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
```
```
Name:       <APPNAME>
Command:    [bundle exec rackup --host 0.0.0.0 --port 5000]
Scale:      1
Protocol:   http
Private:    false
Health Check:
-- Command:         [curl -f http://localhost]
-- Interval:        10
-- Timeout:         10
-- Retries:          5
-- Start Period:    15
Resources:
-- CPU:      256
-- Memory:   512
ENVs:
-- RACK_ENV   production                 (The Rack environment)
-- WHO_AM_I   parkscheibe/statging/web   (Project/Environment/App)
CustomDomains:
+---------------+---------+-----------+
|    ADDRESS    | PRIMARY | VALIDATED |
+---------------+---------+-----------+
| www.zwei.beer | true    | false     |
| zwei.beer     | false   | false     |
+---------------+---------+-----------+
Active Release: 1

Status

   ACTIVE 1 / 1 running tasks (0 pending)

Tasks

   ID                                 Release   Last Status   Health Status   Started At             Stopped At
   5b01a0618f294c4ea3de397f7db6c642   1         RUNNING       UNKNOWN         2020-10-13T09:49:51Z   -
```

## Going further

[Configure Container Settings]({{< relref "/latest/user/configuration/apps/container" >}}) for your new App.
