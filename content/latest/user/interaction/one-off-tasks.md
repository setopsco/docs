---
weight: 20
title: "One-Off Tasks"
---
# One-Off Tasks

You will use One-Off Tasks to run certain commands on a one-time basis. For example, you could use this to run database migrations or to debug your App.

A One-Off Task starts a new container for an App with a certain Release. By default, this will be the [Active Release]({{< relref "/latest/user/interaction/app-deployment#releases" >}}) for the App, but it can be overridden.

{{< hint warning >}}
A One-Off Task can run up to 24h and will be terminated when it exceeds this limit.
{{</ hint >}}

## Start a background task

Start a One-Off Task with `task:run -- COMMAND`. SetOps will create the One-Off Task and start streaming its logs. The Task will continue running until the process exits, or until you run `task:stop ID`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- echo "Hello World"
# 2020-11-11 14:22:13 Hello World
```

One-Off tasks can be configured with the following parameters.
- `--release RELEASEID` run a one- off task for a specific release
- `--cpu CPUVALUE --memory MEMORYVALUE` run a task with a specific resource configuration (see [App Resources]({{< relref "/latest/user/configuration/apps#resources" >}}) for valid values)
- `--entrypoint "list,of,commands"` overwrite the container entrypoint for the task

The following snippet is an example for a command using all configuration options.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run --release 1 --cpu 256 --memory 512 --entrypoint "/bin/bash,-c" -- echo "Hello World"
# 2020-11-11 14:22:13 Hello World
```

You can run detached background tasks with the `--detached` flag.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run --detached -- echo "rake db:migrate"
```

Now you can see the list of all running tasks with the `task` command:
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task
```
You can stop running tasks with the `task:stop` command.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:stop ID
```
## Interactive one-off tasks with tmate {id=tmate}

Interactive One-Off Tasks allow you to debug your application on SetOps, for example with a  [REPL console](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop).
SetOps native support for this feature is currently experimental. We still recommend using [tmate](https://tmate.io) to connect to one-off tasks started with the SetOps CLI, which is outlined in this section. Refer to [native interactive one-off-tasks](#native-interactive-one-off-tasks) for the experimental but native method.

### Setup your app image

Add the `tmate` CLI to your App image. For example, when building your image, you could add `tmate` to your `bin/` directory.

Most easily, you can download the `static-linux-amd64` version from the [latest tmate release](https://github.com/tmate-io/tmate/releases/tag/2.4.0) and extract it into the `bin/` directory with this snippet:

```shell
# apt-get install -y --no-install-recommends curl ca-certificates xz-utils
curl -sSL -o- https://github.com/tmate-io/tmate/releases/download/2.4.0/tmate-2.4.0-static-linux-amd64.tar.xz | \
  tar -xJf - -C bin --strip-components=1 tmate-2.4.0-static-linux-amd64/tmate
```

Should you build the App image with a `Dockerfile` you can use one of the snippets below:

* For Ubuntu / Debian-based images:

  ```docker
  RUN apt-get update \
   && apt-get install -y --no-install-recommends curl tar xz-utils ca-certificates \
   && curl -sSL -o- https://github.com/tmate-io/tmate/releases/download/2.4.0/tmate-2.4.0-static-linux-amd64.tar.xz | \
    tar -xJf- -C bin --strip-components=1 tmate-2.4.0-static-linux-amd64/tmate \
   && chmod +x /bin/tmate
  ```

* For Alpine-based images:

  ```docker
  RUN apk add --update curl tar xz ca-certificates \
   && curl -sSL -o- https://github.com/tmate-io/tmate/releases/download/2.4.0/tmate-2.4.0-static-linux-amd64.tar.xz | \
    tar -xJf- -C bin --strip-components=1 tmate-2.4.0-static-linux-amd64/tmate \
   && chmod +x /bin/tmate
  ```

Ensure your App's active release contains tmate.

{{< hint warning >}}
**Make sure that the user in the app image can use a shell.**
When an image is using a non-root user (via the `USER` command) or modifying the user's shell, tmate might not be able to open a shell for you and end up in a continues restart loop:
```
...
Session shell restarted
Session shell restarted
Session shell restarted
...
```
Refer to your base image's documentation on how to set a valid shell for a user.
{{</ hint >}}

### Create a tmate session

Launch a new one-off task with tmate using `task:run`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- tmate -F
```
```
ID:   55a9b03b765446ecb954ccedfc9ea25b

Starting Task...

2021-03-17 09:58:34 [system] Task status is PROVISIONING, desired status is RUNNING
2021-03-17 09:58:43 [system] Task status is PENDING, desired status is RUNNING
2021-03-17 09:59:03 [system] Task status is RUNNING, desired status is RUNNING
2021-03-17 09:59:03 [app] To connect to the session locally, run: tmate -S /tmp/tmate-1000/mPMdig attach
2021-03-17 09:59:03 [app] Connecting to ssh.tmate.io...
2021-03-17 09:59:03 [app] <APPNAME> session read only: https://tmate.io/t/ro-AaNRnjaTqUMueFppUt2L2RRaK
2021-03-17 09:59:03 [app] ssh session read only: ssh ro-AaNRnjaTqUMueFppUt2L2RRaK@lon1.tmate.io
2021-03-17 09:59:03 [app] <APPNAME> session: https://tmate.io/t/pjE268N8gc85vWvsfccmLg6Lb
2021-03-17 09:59:03 [app] ssh session: ssh pjE268N8gc85vWvsfccmLg6Lb@lon1.tmate.io
```

You can use any link to connect to the task.

{{< hint warning >}}
**The tmate session will continue running until you stop it manually.**
When you're finished, do not forget to stop the task.
```shell
tmate kill-server
```
{{</ hint >}}

## Native interactive one-off tasks

{{< hint warning >}}
**Please note: Native Interactive One-Off Tasks are an experimental feature with some shortcomings, explained below. Refer to [one-off tasks with tmate](#tmate) for the stable method.**
{{</ hint >}}

SetOps now supports native interactive one-off tasks. This allows you to use a shell, or a REPL (read-eval-print loop) console, for example.

There are some prerequisites for interactive one-off tasks:

* You need to install the AWS `session-manager-plugin` binary. [See their documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html) for instructions on how to install the tool. Note that it is also [available on Homebrew](https://formulae.brew.sh/cask/session-manager-plugin): `brew install session-manager-plugin`
* Your App image needs to have a `sleep` executable. When using standard images, this is usually not an issue since they come with a base system. However, in minimalistic Docker base images, such as [distroless](https://github.com/GoogleContainerTools/distroless), there is no `sleep` command present, and it can therefore not be used as an image for interactive one-off task.

You can start the interactive one-off task like this:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run --interactive -- bash
```

```
ID:   a89e769cf35f4e4f89c1d107dafaa94f

Starting Task...

2021-05-28 14:19:41 [system] Task status is PROVISIONING, desired status is RUNNING
2021-05-28 14:19:49 [system] Task status is PENDING, desired status is RUNNING
2021-05-28 14:19:54 [system] Task status is RUNNING, desired status is RUNNING
You can connect to the session with the following command:

  session-manager-plugin [...]
```

Run the `session-manager-plugin` command in a new terminal to access your interactive session. Note that the command can only be used once, and you must connect to the session before a timeout of one minute.

{{< hint warning >}}
**The task will continue running for 24 hours, or until you stop it manually.**
That is to ensure any work you started in your session is not interrupted. When you're finished, do not forget to stop the task.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:stop ID
```
{{</ hint >}}

Once you created an interactive session and stoped the shell so the task is still running, you can attach to the running task with the `task:attach` command.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:attach ID -- bash
```

Interactive One-Off Tasks currently come with some **limitations, which is why we consider them an experimental feature**:

* the command is run by the `root` user, regardless of which user your Docker image specifies
* the entrypoint is not executed, which might prevent proper shell initialization (for example, it might not spawn the same programming language environment).

You're happily invited to test the feature and use it if it suits your needs. Make sure to report issues to the SetOps team. Refer to [one-off tasks with tmate](#tmate) for the stable method.
