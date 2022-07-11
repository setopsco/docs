---
weight: 40
---
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