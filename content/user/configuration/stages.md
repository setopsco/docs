---
weight: 10
title: "Projects and Stages"
---
# Project and Stages

{{< hint info >}}
💡 You can replace the default values of the commands for `PROJECT`, `STAGE` and `APPNAME` in the form on the right side! A standard pattern might be `myproject`, `production` and `web` (see [concepts]({{< relref "/user/concepts" >}})).
{{< /hint >}}

## Project

A **Project** acts as a namespace for your application. It has a unique name, i.e. *myproject* or *parkscheibe*, and stages are nested under a project.

{{< hint info >}}
The naming convention for a `project` must only contain lowercase letters a-z and numbers 0-9 and start with a lowercase letter. The length of `project` has to be between 3 and 20 characters.
{{< /hint >}}

### List Projects

Run `setops project` to list all Projects:
```shell
setops project
```
```
+----------------+
|      NAME      |
+----------------+
| parkscheibe    |
| project1       |
+----------------+
```

You can also get detailed information about a Project with `project:info <PROJECT>`:
```shell
setops project:info <PROJECT>
```
```
Name:         <PROJECT>
Created At:   2020-10-23T16:46:29+02:00
Created By:   admin@setops.co
```
### Create a Project

Run `project:create <PROJECT>` to create a Project. The Project creation is committed automatically. Thus, you can directly use the newly created Project e.g. for creating stages.

```shell
setops project:create <PROJECT>
```
```
Name:         <PROJECT>
Created At:   2020-10-23T16:46:29+02:00
Created By:   karl.ranseier@setops.co

[Commit progress...]
```

### Delete a Project

Run `project:destroy <PROJECT> --force` to delete a Project. Like the Project creation also the deletion of a Project is committed automatically.

{{< hint info >}}
Since the Project deletion is an irreversible action, it has to be approved by adding `--force` to the command.
{{</ hint >}}

```shell
setops project:destroy <PROJECT>
```
```
🔴 This command deletes all resources for the current project. This cannot be undone. Please rerun the command with --force to confirm.
```
```
setops project:destroy <PROJECT> --force
Name:         <PROJECT>
Created At:   2020-10-23T16:46:29+02:00
Created By:   karl.ranseier@setops.co

[Commit progress...]
```

## Stage

A **Stage** a self-contained deployment environment. It is tied to a project and has a unique name, i.e. *staging* or *production*. A given stage is completely isolated from all other stages, which means that it does not share any resources or data with them.

For example, for a project called *parkscheibe*, it might make sense to create two stages:

* `staging` – for Q&A before new features are merged into master
* `production` – the environment your customers get to see

{{< hint info >}}
The naming convention for a `stage` must only contain lowercase letters `a-z` and numbers `0-9` and start with a lowercase letter. The length of `stage` has to be between 3 and 12 characters. It also has to start with a lowercase letter. A valid example is `staging`.
{{< /hint >}}

### List Stages

Run `setops -p <PROJECT> stage` to list all Stages for a Project:

```shell
setops -p <PROJECT> stage
```
```
+---------------+
|     NAME      |
+---------------+
|staging        |
|production     |
+---------------+
```

You can also get detailed information about a Stage with `stage:info <STAGE>`:

```shell
setops -p <PROJECT> stage:info <STAGE>
```
```
Name:         <STAGE>
Created At:   2020-10-23T16:46:29+02:00
Created By:   admin@setops.co
```

### Create a Stage

Run `stage:create <STAGE>` to create a Stage. The stage creation is committed automatically. Thus, you can directly use the newly created stage e.g. for pushing images.

```shell
setops -p <PROJECT> stage:create <STAGE>
```
```
Name:         <STAGE>
Created At:   2020-07-20T13:06:17+02:00
Created By:   karl.ranseier@setops.co

[Commit progress...]
```

Look at the [Apps]({{< relref "/user/configuration/apps" >}}) guide to learn how to deploy your application.

### Delete a Stage

Run `stage:destroy <STAGE> --force` to delete a Stage. Like the stage creation also the deletion of a stage is committed automatically.

{{< hint info >}}
Since the stage deletion is an irreversible action, it has to be approved by adding `--force` to the command.
{{</ hint >}}

```shell
setops -p <PROJECT> stage:destroy <STAGE>
```
```
🔴 This command deletes all resources for the current stage. This cannot be undone. Please rerun the command with --force to confirm.
```
```
setops -p <PROJECT> stage:destroy <STAGE> --force
Name:         <STAGE>
Created At:   2020-11-09T17:40:56+01:00
Created By:   admin@setops.co

[Commit progress...]
```

## Invite or Remove Users

### Stage

When you create a Stage, you will initially be the only one with access to it.

You can check the permissions with `user`:

```shell
setops -p <PROJECT> -s <STAGE> user
```
```
+-------------------------+--------+
|          EMAIL          |  ROLE  |
+-------------------------+--------+
| admin@setops.co         | admin  |
| karl.ranseier@setops.co | member |
+-------------------------+--------+
```

Use `user:invite EMAIL` to invite another user:

```shell
setops -p <PROJECT> -s <STAGE> user:invite rick.astley@setops.co
```
```
Email:   rick.astley@setops.co
Role:    member

✅ Invited user rick.astley@setops.co for stage <STAGE> on project <PROJECT>.
```

Rick will now see the Stage too.

In case Rick has no SetOps account yet, he will receive an email with an
activation code and further informations on how to [sign up]({{< relref "installation#sign-up" >}})
for a new account.

`user:invite EMAIL` has an optional flag `--role ROLE`. Two roles are currently supported:

* `admin`: Full access to the Stage, including managing access permissions and deleting the Stage
* `member`: Access to Apps, Services, and Alert Targets on the Stage. Can not manage access permissions and delete the Stage

The role can be specified when the user is invited:

```shell
setops -p <PROJECT> -s <STAGE> user:invite rick.astley@setops.co --role admin
```
```
Email:   rick.astley@setops.co
Role:    admin

✅ Invited user rick.astley@setops.co for stage <STAGE> on project <PROJECT>.
```

A user can be removed from the Stage with `user:remove EMAIL`:

```shell
setops -p <PROJECT> -s <STAGE> user:remove rick.astley@setops.co
```
```
Email:   rick.astley@setops.co
Role:    admin

✅ Removed user rick.astley@setops.co from stage <STAGE> on project <PROJECT>.
```

### Project
User can also be invited to Projects. A user invited to a Project has access to all its stages. With role `admin` the user can also create and delete Stages on the Project and manage its users. For a detailed overview on the permissions of the different roles refer to the [Permission Table]({{< relref "#permission_table" >}}).

In order to invite a user to a project run the `user:invite` command and provide a `--project` flag only.
```shell
setops -p <PROJECT> user:invite rick.astley@setops.co --role admin
```
```
Email:   rick.astley@setops.co
Role:    admin

✅ Invited user rick.astley@setops.co for project <PROJECT>.
🔵 Receiving permission for the project allows the user to access all its stages.
```

{{< hint warning >}}
Adding a user to a Project provides access to all Stages on the Project. Make sure the user should have this right. Give away permission to individual Stages otherwise.
{{< /hint >}}

`user` and `user:remove` work for Projects identically as they do for Stages. If only a `--project` flag is provided the user command modify the Project instead of a single Stage.

### Permission table {id=permission_table}

| User | **See Project** | **See all Stages on Project**  | **See specific Stage**  | **Create Stage**  | **Destroy Stage**  | **Destroy Project** | See Users on Project | Manage users on Project* | See Users on Stage | Manage Users on Stage* |
|---|---|---|---|---|---|---|---|---|---|---|
|  Project `admin`      | X | X | X | X | X | X | X | X | X | X |
|  Project `member`  | X | X | X | - | - | - | X | - | X | - |
|  Stage `admin`        | X | - | X | - | X | - | - | - | X | X |
|  Stage `member`    | X | - | X | - | - | - | - | - | X | -

\* is allowed to run `user:invite` and `user:remove`

## Going further

[Learn about Changesets]({{< relref "changesets" >}}) to configure your Stage.
