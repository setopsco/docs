---
weight: 20
bookToC: false
---
# Concepts

The most important concepts you need to know about to use SetOps efficiently are **Project**, **Stages**, **Apps**, **Services** and **Changesets** and it's CLI.

## Project

A **Project** acts as a namespace for your application. It has a unique name, i.e. *myproject*, and stages are nested under a project.

## Stage

A **Stage** a self-contained deployment environment. It is tied to a project and has a unique name, i.e. *staging* or *production*. A given stage is completely isolated from all other stages, which means that it does not share any resources or data with them.

## App

An **App** is a task that the SetOps platform runs. A stage may have many apps. Apps are always assumed
to be long-running. They run on our container-based platform using an image you provide. For example, web applications
will usually have a task named `web` for the application server, and possibly a task named `job` for running background jobs. Apps are assumed to be stateless. They persist user data by accessing services.

## Service

A **Service** is an additional component such as databases for example. Services provide additional functionality and can be linked to apps that consume them.

## Changeset

A **Changeset** is a set of commands which change a stage. The SetOps workflow for changing anything on a stage works always the same: you add a set of commands to your changeset and commit it to make your change live (or you discard the changeset). Changesets work just like the Git staging area in your local repository: you add some files, then you commit.

Changesets are stored on the server per stage and per user. So a user can log in from multiple computers and edit the stored changeset as well as commit or discard it.

## Example

![SetOps Concepts Example](concepts.png)

In this example, there is a Stage with one App _web_ and two Services, _database_ and _store_. Let's say we want to create another App. This is done with a Changeset which, in this case, contains a Command to create the App and set its Scale to _2_. When the Changeset is committed, the Stage has the two Apps _web_ and _worker_ with the Services _database_ and _store_.


## CLI

The commandline interface (CLI) is the heart of SetOps. You can create, configure, deploy and manage your application with this single tool. The CLI commands follow a consistent and intuitive pattern.

There are:

- commands
- subcommands
- scope flags
- arguments

We separate commands from subcommands with a `:`. The scope flags have the same name as the belonging commands and define the scope for a lower-level command.

The following examples explain commands, subcommands, scope flags, and arguments:

```
setops --scope-flag command:subcomand argument

setops project:create myproject
setops --project myproject stage:create production
setops --project myproject --stage production app:create web
setops --project myproject --stage production --app web container:set port 3000
```
The command hierarchy looks like following:

```
setops
└─ project
     └─ stage
         ├─ app
             ├─ container
                 ├─ set
                 └─ unset
             ├─ network
             ├─ resource
             ├─ env
             ├─ domain
             ├─ task
             └─ log
         ├─ service
             ├─ link
             ├─ backup
             └─ option
         ├─ notification
         ├─ changeset
         └─ user
             ├─ invite
             └─ remove
```

The CLI nests every lower-level command with a scope flag. For example, let's take a look at the `container` command: It is nested below `setops` → `project` → `stage` → `app`. So to use `container:set`, you need to provide the following scope flags for this lower-level command:
```
setops --project myproject --stage production --app web container:set ARGUMENT
```

You can set all flags either in front or after the command; for a better readability of our documentation, we place scope flags at the start of the command.

This is a list of common subcommands:

- `create`
- `destroy`
- `info`
- `set`
- `unset`
- `commit`
- `discard`

We use these terms consistently for any resource: it is `app:create`, `app:destroy`, `service:create`, and `service:destroy`.

A command without a colon-separated subcommand is the list command, returning a list of all resources of this type.

## Going further

Follow a [Quick Start Guide]({{< relref "quick-start" >}}) to learn how to deploy your first App to SetOps or [learn more about Stages]({{< relref "configuration/stages" >}}).
