---
weight: 20
---
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
Check out the [Health Checks]({{< relref "/latest/user/configuration/apps/container#health-checks" >}}) section if you want to get more information about the difference between `container` and `network` Health Checks.
{{< /hint >}}

The Container Health Check configuration determines how the health of a container is monitored. The system periodically runs a command you specify inside your App's container. The command exit code determines the healthiness of the container. When it returns with exit code `0`, the check is deemed successful. Should it return with any other exit code, the check is failed and the container is unhealthy. After the given grace period specified by `interval`, `timeout`, `retries`, and `start-period`, the container will be terminated and replaced with a new one. It is recommended to set the `start-period` to a big enough value so that the app can start and warm up and the `interval`, `timeout` and `retries` to a low value so that downtimes are quickly detected.

The Container Health Check is **optional** (off by default), but highly recommended. It is configured with the required `command` parameter:

| Parameter | Valid Values | Default | Description |
|---|---|---|---|
| `command`  | any command, e.g. `["/bin/sh", "-c", "curl -s http://localhost:5000/healthz \| grep pong"]` | - | Specifies the command that is used to determine the App's health. |
| `interval`  | 1-30 | 10 | Determines the interval in which the App's health is checked in seconds.  |
| `timeout`  | 1-30 | 10 | Specifies the time in seconds the App has to respond in.  |
|  `retries`  | 1-30 | 5 | Configures the number of retries the health check will attempt before declaring the App not healthy.  |
| `start-period`  | 0-60 | 15 | Defines when the health check is attempted for the first time after starting the App.  |

The other 4 parameters are optional and defaults are used as shown above if ommited.

To configure the container health check, use `container:set health-check --interval INTERVAL --timeout TIMEOUT --retries RETRIES --start-period STARTPERIOD -- COMMAND`.

For an App with Protocol `http`, you could use `curl` (or `wget`) to verify the app server is running correctly:
```shell
setops -p <PROJECT> -s <STAGE> --app  <APPNAME> container:set health-check -- /bin/sh -c "curl -s http://localhost:5000/healthz | grep pong"
```
Or with its optional parameters:

```shell
setops -p <PROJECT> -s <STAGE> --app  <APPNAME> container:set health-check --interval 10 --timeout 10 --retries 5 --start-period 15 -- /bin/sh -c "curl -s http://localhost:5000/healthz | grep pong"
```
```
Health Check:
-- Command:         [/bin/sh -c curl -s http://localhost:5000/healthz | grep pong]
-- Interval:        10
-- Timeout:         10
-- Retries:         5
-- Start Period:    15
```

For an App with Protocol `tcp`, you could use `nc` (netcat) to verify the app server is running. Note this only checks whether the port is open, not if the app is doing something useful.

```shell
setops -p <PROJECT> -s <STAGE> --app  <APPNAME> container:set  health-check -- /bin/sh -c "echo '' | nc localhost 5000"
```
```
Health Check:
-- Command:         [/bin/sh -c echo '' | nc localhost 5000]
-- Interval:        10
-- Timeout:         10
-- Retries:         5
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