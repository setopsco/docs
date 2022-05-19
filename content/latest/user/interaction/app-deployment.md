---
weight: 10
---
# App Deployment

This guide describes how to deploy an App with SetOps.

Apps run in Docker containers based on images stored in a Docker registry. We provide this registry for you. In the following, we assume that there is an Organization `<ORGANIZATION>`, a Project `<PROJECT>` and a Stage `<STAGE>` with an App named `<APPNAME>`.

Refer to the [Stages]({{< relref "/latest/user/configuration/stages" >}}) and [Apps]({{< relref "/latest/user/configuration/apps" >}}) Guides for instructions on how to create those.

## Image Registry {id=registry}

To run your App on SetOps, you need to provide a Docker image that contains everything the App needs to run: the base operating system, libraries, and your code.

You will use the SetOps Docker registry to make your images available to Apps.

Pushing an image is a two-step process, as outlined below. We assume you already built your image, and it is tagged `YOURIMAGE:latest`.

{{< hint info >}}
Before an image can be pushed to the Docker registry, you must create the App, and commit the Changeset with `changeset:commit`.
{{< /hint>}}

1. Tag your local image with the registry URL. The URL follows the format `api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:TAG`.

   ```shell
   docker tag YOURIMAGE:latest api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
   ```

   `latest` is the image tag to use at the SetOps Docker Registry. The value is not relevant to SetOps as you will use the image digest to identify the image for App Deployment. It may be practical to use Git commit SHAs for you to identify images, for example.

1. Push the image to the SetOps Docker Registry.

   ```shell
   docker push api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
   ```
   ```
   The push refers to repository [api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>]
   [...]
   web_1: digest: sha256:2b51cdaabcdc9c35b36e998ec81d2ed8507def0e4709a4d5003414e727e67fa9 size: 1993
   ```

   Take note of the `sha256:[...]` digest value since this is required for creating a Release (see below).

## Releases {id=releases}

Every App has a list of **Releases** and an **Active Release**.

A Release is an alias for a specific App revision. It is identified by a number (e.g. `2`) and a Docker image digest (e.g. `sha256:f3e7[...]9cd8`). All App status commands will always use the App Release to identify which revision a task is running on.

### List Releases

You can get a list of existing Releases for an App with `release`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> release
```
```                                                                         1 ↵
+----+-------------------------------------------------------------------------+
| ID |                                 DIGEST                                  |
+----+-------------------------------------------------------------------------+
|  1 | sha256:cfafdd9d2083d7352ff7b17870616766d8fd9a28bbffa66b14209d71f055e013 |
|  2 | sha256:b652b6fe388c8320d02dfcdcace99b59fcda6773a11f89d444174c9d70e3ab79 |
+----+-------------------------------------------------------------------------+
```

### Create Releases

To create a new Release, run `release:create DIGEST`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:create sha256:2b51cdaabcdc9c35b36e998ec81d2ed8507def0e4709a4d5003414e727e67fa9
```
```
ReleaseID:   3
Digest:      sha256:2b51cdaabcdc9c35b36e998ec81d2ed8507def0e4709a4d5003414e727e67fa9
```

This added the command to create a Release to your current Changeset. It will not be available until you run `changeset:commit`.


### Acivate Release

Deploying an application means updating the App's Active Release. To do so, run `release:activate RELEASE`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:activate 3
```
```
Active Release:   3
```

Check your Changeset with `changeset:info`:

```shell
setops -p <PROJECT> -s <STAGE> changeset:info
```
```
Created At:   2020-11-10T09:05:34Z

+--------------------+-----------------------------------------------------------------------------------------+
|        NAME        |                                        ARGUMENTS                                        |
+--------------------+-----------------------------------------------------------------------------------------+
| app:release:create | map[name:web                                                                            |
|                    | release_digest:sha256:2b51cdaabcdc9c35b36e998ec81d2ed8507def0e4709a4d5003414e727e67fa9] |
| app:release:set    | map[name:web                                                                            |
|                    | release_id:3]                                                                           |
+--------------------+-----------------------------------------------------------------------------------------+
```

This Changeset will create a new Release and set the created Release with ID 3 active.

Use `changeset:commit` to activate your changes:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```
```
Created At:   2020-09-02T14:53:59Z

+--------------------+-----------------------------------------------------------------------------------------+
|        NAME        |                                        ARGUMENTS                                        |
+--------------------+-----------------------------------------------------------------------------------------+
| app:release:create | map[name:web                                                                            |
|                    | release_digest:sha256:2b51cdaabcdc9c35b36e998ec81d2ed8507def0e4709a4d5003414e727e67fa9] |
| app:release:set    | map[name:web                                                                            |
|                    | release_id:3]                                                                           |
+--------------------+-----------------------------------------------------------------------------------------+

◢ Initializing…
[...]
◤ Planning…
[...]
◣ Applying… (17/28)
[...]
Commit successful!
```

Have a look at `app:ps <APPNAME>`:

```shell
setops -p <PROJECT> -s <STAGE> app:ps <APPNAME>
```
```
Status

   ACTIVE 2 / 2 running tasks (0 pending)

Tasks

   ID                                 Release   Last Status    Health Status   Started At             Stopped At
   a886b0f4af704ec58a17a8f914de3e71   2         DEPROVISIONING HEALTHY         2020-10-30T18:48:45Z   -
   cfc921d7431d4157a061b96244ecc8d0   3         RUNNING        HEALTHY         2020-11-05T11:49:13Z   -
```

Deploying the App is in progress. The task with Release ID 2 has been successfully replaced by a Task with Release ID 3.

The SetOps Container Runtime will ensure that the new task is working as intended before it is served any traffic. This means both the [Container Health Check]({{< relref "apps#container-health-check" >}}) and the [Network Health Check]({{< relref "apps#network-health-check" >}}) need to pass before the failover is initiated. The failover is seamless and does not incur any downtime of your app.

### Run Migrations

If you're about to deploy a new release of a web application with migrations, you usually need to run them before the new code gets deployed. For this reason, the deployment step is separated into two steps, `release:create` and `release:activate`. Once you created a release, it is already possible to run a One-Off Task with the specific release, without the need of activating it. To run migrations in the previous example (active release is `2`), follow these steps:˚˚
1. `setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:create DIGEST`
1. `setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run --release 3 -- db:migrate`
1. `setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:activate 3`


For further information see [One-Off Tasks]({{< relref "one-off-tasks#create-a-background-task" >}}).

## Runtime Status

Once the App is deployed, you can view its current runtime status by running `app:ps <APPNAME>`:

```shell
setops -p <PROJECT> -s <STAGE> app:ps <APPNAME>
```
```
Status

   ACTIVE 2 / 3 running tasks (1 pending)

Tasks

   ID         Release   Last Status   Health Status   Started At                  Stopped At
   4fb2b352   3         RUNNING       HEALTHY         2020-10-15T12:01:40+02:00   -
   596160b8   3         RUNNING       HEALTHY         2020-10-15T12:01:40+02:00   -
   2b70102c   3         PENDING       UNKNOWN         2020-10-15T12:01:40+02:00   -
```

The **Status** section describes the number of active, desired and pending tasks.

When the App is running correctly, the number of desired tasks and running tasks should be equal. Note that not active tasks are not automatically pending. Thus, pending does not have to be equal to the difference between desired and active tasks.

Your App will usually have one task per instance. The number of instances can be configured via `scale` in the [App configuration]({{< relref "/latest/user/configuration/apps#scale" >}}).

The **Tasks** section lists specific information for each individual task:

* **ID**: Unique identifier for this task, for example for querying logs
* **Release**: Release identifier as described in [Releases]({{< relref "#releases" >}})
* **Last Status**: Container runtime status, can be one of:
  * `PROVISIONING` – additional steps are performed before a task can be launched, e.g. network interface provisioning
  * `PENDING` – waiting on the container agent to take further action
  * `ACTIVATING` – need to perform additional steps after the task is launched but before the task can transition to the `RUNNING` state
  * `RUNNING` – task is successfully running
  * `DEACTIVATING` – need to perform additional steps before the task is stopped, e.g. load balancer target group de-registration
  * `STOPPING` – waiting on the container agent to take further action
  * `DEPROVISIONING` – need to perform additional steps after the task has stopped but before the task transitions to the STOPPED state
  * `STOPPED` – task has been successfully stopped
* **Health Status**: [Container Health Check]({{< relref "/latest/user/configuration/apps#container-health-check" >}}) status, can be one of:
  * `HEALTHY` – container Health Check has passed successfully
  * `UNHEALTHY` – container Health Check has failed
  * `UNKNOWN` – container Health Check is being evaluated or there is no container Health Check defined
* **Started At**: when the task was started
* **Stopped At**: when the task was stopped (for terminating tasks, optional)
