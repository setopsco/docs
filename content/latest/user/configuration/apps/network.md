---
weight: 30
---
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
Check out the [Health Checks]({{< relref "/latest/user/configuration/apps/network#health-checks" >}}) section if you want to get more information about the difference between `container` and `network` Health Checks.
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