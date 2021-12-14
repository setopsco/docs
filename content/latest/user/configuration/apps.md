---
weight: 30
---
# Apps
{{< hint info >}}
💡 You can replace the default values of the commands for `PROJECT`, `STAGE` and `APPNAME` in the form on the right side! A standard pattern might be `myproject`, `production` and `web` (see [concepts]({{< relref "/latest/user/concepts" >}})).
{{< /hint >}}

An **App** is a task that the SetOps platform runs. A stage may have many Apps. Apps are always assumed
to be long-running. They run on our container-based platform using an image you provide. For example, web applications
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

Run `changeset:commit` to commit the Changeset.

[Read more on Changesets here.]({{< relref "/latest/user/configuration/changesets" >}})

## Configuration Overview

An App can be configured with the following parameters. Newly created Apps are initialized with the indicated defaults.

These parameters are grouped into the following configuration topics:

- `container`
- `network`
- `resources`
- `env`

| Command | Subcommand | Valid Values | Default | Description |
|---|---|---|---|---|
| **Container** |
| [Command]({{< relref "#command" >}}) | `set`, `unset` | bash command string | `[]` | Command that is used to start the App, e.g. `bundle exec rails server` |
| [Entrypoint]({{< relref "#entrypoint" >}}) | `set`, `unset` | bash command string | `[]` | Defines the entrypoint that is used for the evaluation of commands e.g. `/bin/sh -c` |
| [Container Health Check]({{< relref "#container-health-check" >}}) | `set`, `unset` | see paragraph | - | Defines how the health of the App will be checked. |
| **Resource** |
| [CPU]({{< relref "#cpu" >}}) | `set` | see paragraph | `128` | Assigns the amount of vCPU units (1024 = 1 vCPU) to an App. |
| [Memory]({{< relref "#memory" >}}) | `set` | see paragraph | `256` | Assigns the memory size (megabytes) to an App. |
| [Scale]({{< relref "#scale" >}}) | `set` | `0..16` | 1 | Defines how many instances of the App should be created. |
| **Network** |
| [Protocol]({{< relref "#protocol" >}}) | `set` | `http`, `tcp` | `http` | Determines the protocol that is used to connect to the App. |
| [Public]({{< relref "#public" >}}) | `set` | `true`, `false` | `false` | Defines if the App is publicly accessible. |
| [Port]({{< relref "#port" >}}) | `set` | `1..65535` | `5000` | Defines a custom port the application listens to internally. |
| [Network Health Check]({{< relref "#network-health-check" >}}) | `set`, `unset` | see paragraph | - | Defines how the health of the App will be checked. |
| **Environment** |
| [ENVs]({{< relref "#environment-variables" >}}) | `set`, `unset`, `show` | `key=value` | `[]` | Allows to define, modify and delete Environment Variables for an App. |

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
-- Interval:         5
-- Timeout:          5
-- Retries:         10
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
## Container Parameters
### Command

Every App has a command with which the container is started. If you don't set a command for an app, the default command specified in the *Dockerfile* (or in the upstream Docker image) is used. The command in SetOps works just like the [`CMD` directive in a *Dockerfile*](https://docs.docker.com/engine/reference/builder/#cmd).

You can configure your App with a command by running `container:set command -- my awesome command --flag flagvalue`.


```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set command -- bundle exec puma -b tcp://127.0.0.1:9292
```
```
Command:   [bundle exec puma -b tcp://127.0.0.1:9292]
```

If you run the command again SetOps will overwrite your last command for this App.

{{< hint info >}}
Make sure to type `--` in front of your command value so that the CLI knows your to use everything after the dashes as the command value and not try to use it as flags and parameters. Ensure to place all flags and parameters, e.g. `-s` and `-p`, before `--`.
{{< /hint >}}

In order to delete a command use `container:unset command`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:unset command
```

### Entrypoint

The entrypoint of an App is used to configure the executable binary to start the container with. For example, when developing a Rails app, the entrypoint could be `["/usr/bin/bundle", "exec"]`, with:

- `["rails server"]` as a command for the `web` app
- `["rake jobs:work"]` as a command for the `worker` app.

The entrypoint in SetOps works just like the [`ENTRYPOINT` directive in a *Dockerfile*](https://docs.docker.com/engine/reference/builder/#entrypoint).

The entrypoint for an App can be configured with `container:set entrypoint -- my awesome entrypoint --with flag`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set entrypoint -- bundle exec rails console
```
The current entrypoint is overridden with the new input if you run the command again.

{{< hint info >}}
Make sure to type `--` in front of your entrypoint value so that the CLI knows your to use everything after the dashes as the entrypoint value and not try to use it as flags and parameters. Ensure to place all flags and parameters, e.g. `-s` and `-p`, before `--`.
{{< /hint >}}

In case you want to remove an entrypoint completely, you may run `container:unset entrypoint`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:unset entrypoint
```

### Container Health Check

{{< hint info >}}
Check out the [Health Checks]({{< relref "/latest/user/configuration/apps#health-checks" >}}) section if you want to get more information about the difference between `container` and `network` Health Checks.
{{< /hint >}}

The Container Health Check configuration determines how the health of a container is monitored. The system periodically runs a command you specify inside your App's container. The command exit code determines the healthiness of the container. When it returns with exit code `0`, the check is deemed successful. Should it return with any other exit code, the check is failed and the container is unhealthy. After the given grace period specified by `interval`, `timeout`, `retries`, and `start-period`, the container will be terminated and replaced with a new one. It is recommended to set the `start-period` to a big enough value so that the app can start and warm up and the `interval`, `timeout` and `retries` to a low value so that downtimes are quickly detected.

The Container Health Check is **optional** (off by default), but highly recommended. It is configured with the required `command` parameter:

| Parameter | Valid Values | Default | Description |
|---|---|---|---|
| `command`  | any command, e.g. `["/bin/sh", "-c", "curl -s http://localhost:5000/healthz \| grep pong"]` | - | Specifies the command that is used to determine the App's health. |
| `interval`  | 1-30 | 5 | Determines the interval in which the App's health is checked in seconds.  |
| `timeout`  | 1-30 | 5 | Specifies the time in seconds the App has to respond in.  |
|  `retries`  | 1-30 | 1O | Configures the number of retries the health check will attempt before declaring the App not healthy.  |
| `start-period`  | 0-60 | 15 | Defines when the health check is attempted for the first time after starting the App.  |

The other 4 parameters are optional and defaults are used as shown above if ommited.

To configure the container health check, use `container:set health-check --interval INTERVAL --timeout TIMEOUT --retries RETRIES --start-period STARTPERIOD -- COMMAND`.

For an App with Protocol `http`, you could use `curl` (or `wget`) to verify the app server is running correctly:
```shell
setops -p <PROJECT> -s <STAGE> --app  <APPNAME> container:set health-check -- /bin/sh -c "curl -s http://localhost:5000/healthz | grep pong"
```
Or with its optional parameters:

```shell
setops -p <PROJECT> -s <STAGE> --app  <APPNAME> container:set health-check --interval 5 --timeout 5 --retries 10 --start-period 15 -- /bin/sh -c "curl -s http://localhost:5000/healthz | grep pong"
```
```
Health Check:
-- Command:         [/bin/sh -c curl -s http://localhost:5000/healthz | grep pong]
-- Interval:        5
-- Timeout:         5
-- Retries:         10
-- Start Period:    15
```

For an App with Protocol `tcp`, you could use `nc` (netcat) to verify the app server is running. Note this only checks whether the port is open, not if the app is doing something useful.

```shell
setops -p <PROJECT> -s <STAGE> --app  <APPNAME> container:set  health-check -- /bin/sh -c "echo '' | nc localhost 5000"
```
```
Health Check:
-- Command:         [/bin/sh -c echo '' | nc localhost 5000]
-- Interval:        5
-- Timeout:         5
-- Retries:         10
-- Start Period:    15
```

An existing container health check configuration can be overwritten by running the command again with different parameters.

{{< hint info >}}
Make sure to type `--` in front of your entrypoint value so that the CLI knows your to use everything after the dashes as the entrypoint value and not try to use it as flags and parameters. Ensure to place all flags and parameters, e.g. `-s`, before `--`.
{{< /hint >}}

{{< hint info >}}
The Health Check command must be installed within the App's Docker image. For example, when using `curl` for the Health Check command, make sure the `curl` binary is present in the image and the [`$PATH` environment variable](https://en.wikipedia.org/wiki/PATH_(variable)#Unix_and_Unix-like) is set correctly.
{{< /hint >}}

A container health check configuration can be deleted with `container:unset health-check`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:unset health-check
```

## Resource Parameters

### CPU
This resource configuration specifies how many CPU units will be reserved for the App to run.

1 vCPU has 1024 CPU units. The configured CPU units will be exclusively reserved for the App and will be available at all time. Additional CPU units might be available when the App tries to use more CPU units than reserved and when the load on the node, where the App container runs, is not fully utilised. So in general it is a good idea to start with a low number of CPU units for best resource utilisation which leads to lower costs.

The default for cpu is `128`.

CPU resources can only be set in multiples of `128`, e.g. `128`, `256`, `384` and so on. The minimum for this value is `128`. The maximum depends on the SetOps configuration and the container instances the task runs on. A hint that the requested resources cannot be fulfilled is that a task is stuck in the `provisioning` state. Try a smaller value if this happens.

CPU resources can be specified by executing
`resource:set cpu CPUVALUE`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> resource:set cpu 256
```
```
CPU:      256
```
Rerun the command in order to further modify the resource configuration for an App.

### Memory
This resource configuration specifies how many memory megabytes will be reserved for the App to run.

The configured memory will be exclusively reserved for the App. However, in contrast to the CPU configuration, this is also the maximum of memory what the App can allocate. If the App uses more memory than configured it might get killed.

The default for memory resources is `256`.

Memory resources can only be set in multiples of `128`, e.g. `128`, `256`, `384` and so on. The minimum is `128`. The maximum depends on the SetOps configuration and the container instances the task runs on. A hint that the requested resources cannot be fulfilled is that a task is stuck in the `provisioning` state. Try a smaller value if this happens.

Resources can be specified by executing
`resource:set memory MEMORYVALUE`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> resource:set memory 512
```
```
Memory:   512
```
Rerun the command in order to further modify the resource configuration for an App.

### Scale

The Scale value determines how many instances of the App are to be running simultaneously. The default value for Scale is 1. You can specify an integer value between 0 and 16. A Scale value of 0 means you do not want SetOps to run any container for this App. This may be useful to stop workers during deployments, for example.

In order to configure the Scale for an App, execute `resource:set scale VALUE`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> resource:set scale 2
```
The scale is a mandatory parameter. Thus, it can only be changed by running the `resource:set scale` command again, but not be removed.

{{< hint info >}}
We recommend setting the `scale` for a web App to at least `2` for reliability reasons. The second container will be served in a different availability zone. That several zones are down at the same time is less likely.
{{< /hint >}}

## Network Parameters
### Protocol {id=protocol}

The Protocol determines how the App can be accessed from the outside. Like Scale, Protocol also is a mandatory parameter. Therefore, it can be modified by subsequently running the `network:set protocol` command, but it can not be deleted from an App.

Valid values for Protocol are `http` and `tcp`. It defaults to `http`.

The Protocol value also determines how the App is reachable from the outside, and how it is checked for its health. The details are outlined in the table below.

| Protocol | Default Container Port | External Port | Health Check | Notes |
|----------|------------------------|---------------|--------------|-------|
| `http` | 5000 | 443 | 200-499 response on `/` | App runs a plain, unencrypted HTTP server - TLS is offloaded at Layer 7 Load Balancer |
| `tcp` | 5000 | 5000 | TCP connection can be established | App uses Layer 3 Load Balancer - no offloading |

{{< hint info >}}
Make sure your App binds to the address `0.0.0.0`. Some frameworks and application servers use the loopback address `127.0.0.1` (localhost) by default, but this does not allow external connections. You can also read the environment variable `PORT` to find out which port we expect your application to listen on.
{{< /hint >}}

To configure the Protocol, use `network:set protocol PROTOCOL`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set protocol http
```

{{< hint warning >}}
After committing your application for the first time, the protocol cannot be changed. If you need to change the protocol, you need to delete the app and create it again. Keep in mind that it can take some time for the new app to become broadly available due to DNS caching.
{{< /hint >}}

### Public

The Public flag specifies whether an App should be publicly reachable. If Public is set to `false`, no external traffic is ever routed to the app. Setting an App as private makes sense for apps working on background jobs, for example.

The Private mode of an App can be modified with `network:set public BOOL` where `BOOL` is either `true` or `false`.
The default value is `false`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set public true
```

Public cannot be deleted from an App since it is a mandatory parameter. Re-run the `network:set public` command in order to modify the value again.

{{< hint info >}}
When making an App public, external traffic reaches the App through a load balancer. When using the protocol `http`, the load balancer terminates TLS connections and forwards the requests to the App containers. It uses the *Least Outstanding Requests (LOR)* algorithm to select a target to forward the request to. This algorithm optimizes response times , though it has some risks to consider:

The main risk when using the LOR algorithm is causing a flood of requests when the load balancer adds a new target to the target group. This happens when the infrastructure creates a new App container due to a deployment or scaling, for example. If your app is under heavy load, and you scale your app, consider increasing the scale by more than one additional container to distribute initial load.

The other potential issue is that a failing target will often respond quicker than a healthy one. For example, your service might immediately respond with a 500 error if it’s not connected to the database. In this situation, the failing target will receive a higher proportion of requests, causing a much larger incident. So, it’s important to ensure that [container Health Checks](#container-health-check) are quick to react to a failing target. This might still result in some seconds of failed requests though, so it might also be worth introducing some artificial error latency.
{{< /hint >}}

### Port

Port allows you to specify a custom port the application listens to internally. For example, when you deploy a webserver that listens on port 4400, you can either set the app port to 4400 or - if possible - configure your webserver to listen on the default port 5000. Regardless whether you set the App port, the `PORT` environment variable will always contain the port SetOps expects your application to listen on.

{{< hint info >}}
Note, that the port option does not influence how your app can be accessed from the web. The external behavior can only be configured via [Network Protocol]({{< relref "#protocol" >}}).
{{< /hint >}}

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set port 4400
```

You can remove the custom port by running `network:unset port`. The app will then again default to port 5000.

### Network Health Check

{{< hint info >}}
Check out the [Health Checks]({{< relref "/latest/user/configuration/apps#health-checks" >}}) section if you want to get more information about the difference between `container` and `network` Health Checks.
{{< /hint >}}

The Network Health Check is a mandatory check for every App. Its implementation depends on the [Protocol](#protocol) setting:

* For protocol `http`, it's a HTTP request to a user-configurable path (defaults to `/`), with the expectation that the App responds with a certain HTTP status code range (defaults to `200-499`). The request goes to the App's [Port](#port).

* For protocol `tcp`, it's a connection check. It opens a TCP connection to the App's [Port](#port). The check is successful when the connection can be established. In this case, you may see invalid or erroneous connections in your App's logs, because from the application point of view, the Health Check looks like an invalid connection request.

#### Configure HTTP Network Health Check

The HTTP check can be customized in two ways: setting a path, and a range of acceptable HTTP response status codes.

To set the path, use `network:set health-check-path PATH`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set health-check-path /.well-known/health-check
```
```
Network:
   Health Check:
      Path:   /.well-known/health-check
```

Note that `PATH` needs to start with `/`. You should use `/healthz` instead of `healthz`, for example.

To revert to the default value for the path, use `network:unset health-check-path`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:unset health-check-path
```
```
Network:
   Health Check:
      Path:   /
```

To set the status code range, use `network:set health-check-status RANGE`. The range can be specified with comma-separated values with an optional range. The following are some examples of valid range values:

|value|status|
|----|-----|
| `200` | `200 OK` only |
| `200,204` | `200 OK` and `204 No Content` |
|`200-299,301`| `200` through `299` and `301` |

{{< hint warning >}}
Please note that although 200-499 is a valid port range for this option, all Health Check responses with HTTP status codes 400 and higher will currently lead to an availability alert if you have configured a [target]({{< relref "/latest/user/configuration/notifications#webhook" >}}). The app will still be available and work but the alert must be ignored. Therefore we recommend to always use a status code below 400 or a path without authorization if that causes a 401 or 403 response.
{{< /hint >}}

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set health-check-status 200,204
```
```
Network:
   Health Check:
      Status:   200,204
```

To revert to the default value for the status code range, use `network:unset health-check-status`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:unset health-check-status
```
```
Network:
   Health Check:
      Status:   200-499
```

## Health Checks

Your App's tasks are checked for their health continuously. This is one of the most important measures to provide a reliable experience to your users because it ensures the reliable operation of the software you're running on SetOps. When checks fail, the corresponding tasks are automatically restarted.

There are two types of checks:

* the [**Network Health Check**](#network-health-check) tests whether your App is responding to requests over the network

* the [**Container Health Check**](#container-health-check) tests your App's overall health by running a customizable command.

The Network Health Check is mandatory and enabled by default. However, it can be customized to work with how your App is laid out. The Container Health Check is optional.

{{< hint warning >}}
You can configure Health Checks for the [`http` protocol](#protocol) only. If you're using the [`tcp` protocol](#protocol), you can not configure a Health Check.
{{< /hint >}}

Both checks serve related but different purposes. It's important to understand the difference between the two to ensure your App runs reliably in case of faults:

* The [**Network Health Check**](#network-health-check) is used from the outside to determine whether to route traffic to your App. Ensure the App endpoint for this check is fast and reliable – the loadbalancer will send a request to this endpoint every second or so. When the Network Health Check fails on several subsequent retries, the task is restarted automatically.

* The [**Container Health Check**](#container-health-check) is a command run inside your App's container. This means you have full authority over what the command actually checks. When the Container Health Check fails after a user-configurable number of retries, the task is restarted automatically.

The check endpoint or command should perform a minimal set of checks to verify whether the App can serve traffic. It could check if the database connection works, for example. On the other hand, it should *not* check every linked service, or if a cronjob ran successfully – this might lead to undesired downtime, as such failures should not prevent the App from being accessible. For these kinds of checks, you should use another, non-critical monitoring method.

In the diagram below, you see how both types of checks interact with your App and how the Network Health Check differs from the Container Health Check.

![App Checks schematic](checks.png)

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

## Domains

You can see the Domains an App can be reached on with `domain`.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
```

### Private Domain

An App always has a private domain at `app.stage.project.$YOURDOMAIN.internal` (e.g. _web.staging.parkscheibe.setopsapps.internal_), only resolvable within the SetOps stage. The purpose of this domain is that Apps can reach each other without the need to be exposed to the internet.

### Public Default Domain

An App is also available via a public default domain at `app.stage.project.$YOURDOMAIN` (e.g. _web.staging.parkscheibe.setopsapps.net_), when the App is not [set to private](#private).

### Public Custom Domains

In addition to the default domain for your App, you can configure any number of public **Custom Domains** where the App should be reachable at. TLS certificates will be automatically maintained for your Custom Domains. Once you have set up the DNS records for the Custom Domain and it is validated, there is no maintenance needed from your side to monitor and renew TLS certificates.

See the list of Custom Domains with `domain`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
```
```
3 Domain(s) configured.


Domain setops.co
   Primary:     true
   Validated:   false

   ⏳ This domain has not yet been validated.
   After setting the validation records below, wait until they are visible on the DNS server.
   Then validate the domains via app:domain:validate command.
   The app will not be served at this domain until it is validated successfully.

   Custom Domain Record(s):
      Name:                 setops.co
      Type:                 CNAME
      Value:                web.production.project1.$YOURDOMAIN
      Alternative Type:     A
      Alternative Values:   1.2.3.4,4.3.2.1

   Validation Record(s):
      Name:    _bf54355ea06621c5c64f2c39af899101.setops.co.
      Type:    CNAME
      Value:   _5a892a6631c5d51bc87519faa60b8624.duyqrilejt.acm-validations.aws.


Domain web.production.project1.$YOURDOMAIN
   Primary:     false
   Validated:   true

   The default domain for this app.
   This domain cannot be deleted.


Domain web.production.project1.$YOURDOMAIN.internal
   Primary:     false
   Validated:   true

   The private domain for this app.
   This domain is only available from Apps and One-Off Tasks of this Stage.
```

The Custom Domain Records and Validation Records instruct you how to configure the DNS for the Custom Domain.

For a Custom Domain Record, there is a default record type and an optional alternative record type:

* The **default record type** should be used whenever possible. It is a `CNAME` (alias) record that points to a SetOps domain and provides the best interoperability and reliability.

* The **alternative record type** may be used when the default record is not applicable. This may happen with a domain APEX (e.g. `setops.co`), but should not happen with subdomains (e.g. `api.setops.co`). It is property of the DNS that `CNAME` records [can not be used for a domain APEX](https://www.isc.org/blogs/cname-at-the-apex-of-a-zone/). While some popular DNS providers have built features to work around this issue, some do not and this is when the alternative record must be used. `CNAME` records for APEX domains are sometimes called `ANAME` or `ALIAS` records. Refer to your DNS provider's documentation to learn more if and how they support this.

In order to create a Custom Domain, run `domain:create DOMAIN [--primary]`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain:create setops.co --primary
```
```
+-----------+---------+-----------+
|  ADDRESS  | PRIMARY | VALIDATED |
+-----------+---------+-----------+
| setops.co | true    | false     |
+-----------+---------+-----------+
```

Custom Domains can be deleted by running `domain:destroy DOMAIN`.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain:destroy setops.co
```

#### Primary Domain

An App can have any number of custom domains but only one **Primary Domain**. The Primary Domain is where your app will be served. Any other domain (custom domains or the default domain) will redirect to your Primary Domain.

{{< hint info >}}
Do not forget to add the `--primary` flag to `domain:create` as this value can not be changed later.

If you want to set an existing domain as the primary domain, remove it with `domain:destroy` and re-add it with `domain:create --primary` in the **same changeset** to avoid having to re-validate it.
{{< /hint >}}

#### Domain Validation

Custom Domains have to be **validated** to be used. With SetOps, all HTTP traffic is TLS-encrypted by default. The validation checks if the *Validation Record(s)* are present on the given Custom Domain for being able to issue TLS certificates for that domain.

The *Custom Domain Record(s)* does not have to be set at this moment. Setting it later enables zero downtime migrations to SetOps since the domain itself was already validated beforehand.

You can view the necessary configuration by running `domain` for the corresponding app.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
```
```
3 Domain(s) configured.


Domain setops.co
   Primary:     true
   Validated:   false

   ⏳ This domain has not yet been validated.
   After setting the validation records below, wait until they are visible on the DNS server.
   Then validate the domains via app:domain:validate command.
   The app will not be served at this domain until it is validated successfully.

   Custom Domain Record(s):
      Name:                 setops.co
      Type:                 CNAME
      Value:                web.production.project1.$YOURDOMAIN
      Alternative Type:     A
      Alternative Values:   1.2.3.4,4.3.2.1

   Validation Record(s):
      Name:    _bf54355ea06621c5c64f2c39af899101.setops.co.
      Type:    CNAME
      Value:   _5a892a6631c5d51bc87519faa60b8624.duyqrilejt.acm-validations.aws.

Domain web.production.project1.$YOURDOMAIN
   Primary:     false
   Validated:   true

   The default domain for this app.
   This domain cannot be deleted.


Domain web.production.project1.$YOURDOMAIN.internal
   Primary:     false
   Validated:   true

   The private domain for this app.
   This domain is only available from Apps and One-Off Tasks of this Stage.
```

After you have added the DNS records, validate your Custom Domain. Wait an appropriate time after setting the DNS records for the DNS servers to refresh.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain:validate setops.co
setops -p <PROJECT> -s <STAGE> changeset:commit
```

{{< hint warning >}}
Please note that **it may take several minutes to hours** until changes you made to your DNS records become visible for SetOps. In case the validation fails although you made the required changes try again after some time.

You can verify that the DNS records are set correctly with the [`dig` utility](https://en.wikipedia.org/wiki/Dig_(command)) on your local computer:

```shell
dig _bf54355ea06621c5c64f2c39af899101.setops.co. @1.1.1.1 +short
```

The command output should show the record you set earlier:

```
_5a892a6631c5d51bc87519faa60b8624.duyqrilejt.acm-validations.aws.
```

If `dig` does not print the expected value, double check your DNS settings and try again later, as DNS changes may take some time to propagate through the system.
{{< /hint >}}

## Going further

[Create a Service]({{< relref "/latest/user/configuration/services" >}}) for your new App.
