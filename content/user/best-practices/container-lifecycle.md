---
weight: 40
HideCommandReplacement: true
---

# Container Lifecycle

## Container Termination

When a task is stopped, a `SIGTERM` signal is sent to each container’s entry process, usually **PID 1**. After a timeout has lapsed, the process will be sent a `SIGKILL` signal. There is currently a delay between the delivery of `SIGTERM` and `SIGKILL` signals of **1 minute**. Processes that don’t exit before the timeout expires will be terminated abruptly upon receipt of the `SIGKILL` signal. The timeout might be higher in future versions of SetOps but will never be lower than **1 minute**.

{{< hint info >}}
Ensure your process runs with PID 1 and handels signals correctly. Processes can spawn child processes, and in so doing, become the parent of those children. When a process is stopped by a stop signal like `SIGTERM`, the parent process is responsible for gracefully shutting down its children and then itself. If the parent is not designed to do that, child processes could be terminated abruptly, causing 5xx or lost work. Within a container, the process that’s specified in the Dockerfile’s ENTRYPOINT and CMD directives, also known as the entry process, will be the parent of all other processes in your container.

See this [blog post](https://aws.amazon.com/blogs/containers/graceful-shutdowns-with-ecs/) by AWS for more details and examples.
{{< /hint >}}
