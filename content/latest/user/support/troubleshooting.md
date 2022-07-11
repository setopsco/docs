---
weight: 10
HideCommandReplacement: true
---
# Troubleshooting

## Why is my app stuck in *pending or waiting for cluster resources*?

When creating or updating an app, SetOps tries to start the new app as a task.
Usually, you see a message, that the task is pending when requesting the app's status.

```shell
setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
```
```
...

Status

  2 of 3 desired tasks active
  1 pending or waiting for cluster resources

  If this persists for more than 5 minutes, see the documentation for further information.

...
```

Under some circumstances, the tasks are stuck in the *pending or waiting for cluster resources* state for longer than 5 minutes. To see why your task is stuck in this state, complete the following troubleshooting steps based on the issue you're having:

|Possible Causes| Solution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|The application does not start properly or has a failing Health Check| Have a look at the logs of your application, e.g. `setops -p <PROJECT> -s <STAGE> --app <APPNAME> log --all-health-checks`, and fix the errors if any.                                                                                                                                                                                                                                                                                                                                                         |
|The current SetOps environment cannot fulfill your resource request| Reduce the [resources requested]({{< relref "/latest/user/configuration/apps/resources" >}}) for your app. If the app can be started then slowly increase the resource limits to the limits your app requires. You could also keep the limits lower and increase the [scale of your app]({{< relref "/latest/user/configuration/apps/resources#scale" >}}). If it cannot be started with the increased resources and you really require the resources, contact the [SetOps Support](mailto:support@setops.co). |
|None of the above applies| Contact the [SetOps Support](mailto:support@setops.co).                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Why do I not see some logs?
Maybe because you're using the Solarized Dark Theme for xterm, e.g. with iTerm.

The standard Solarized Dark Theme for xterm has a broken value for the color _Black (Bright)_. Since _Black_ which is used for the terminal background and _Black (Bright)_ which we use for the muted logs are the identical color, log messages become invisible in this particular combination. There is now a patched color scheme for xterm [here](https://github.com/mbadolato/iTerm2-Color-Schemes/blob/master/schemes/Solarized%20Dark%20-%20Patched.itermcolors). You can also change the value for _Black (Bright)_ to a lighter value under Profiles → Colors. This should make the logs visible again.

## I'm using AppSignal and my Host Metrics are weird
When you're using [AppSignal](https://appsignal.com/) as a monitoring tool, you may wonder about the Host Metrics. It's possible, that the used and total memory does not meet the specified resources for your App. In this case, you may see the Metrics for the virtual machine the containers are running on and not the container Metrics. AppSignal's auto-detection for [Container Host Metrics](https://docs.appsignal.com/metrics/host-metrics/containers.html) is not that precise and they do their best to detect containers automatically. Until this bug is fixed, you need to set the [`running_in_container`](https://docs.appsignal.com/ruby/configuration/options.html#option-running_in_container) flag by yourself, e.g. as [Environment Variable]({{< relref "/latest/user/configuration/apps/environment" >}}) or in your `appsignal.yml`.
