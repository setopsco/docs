---
title: Hasura GraphQL Engine
weight: 30
---
# Hasura GraphQL API Engine

![Hasura](hasura.gif)

In this tutorial, you will deploy your own [Hasura GraphQL Engine](https://github.com/hasura/graphql-engine). We will explain all the necessary SetOps commands that we need to deploy the application. You can find a summary of all commands [at the end]({{< relref "#commands-summary" >}}).

## Prepare your SetOps Environment
{{< hint info >}}
💡 At first, you need to choose a name for `project`, `stage`, and `app`. You can edit them in the form in the top right corner.
{{< /hint >}}

1. Let's start by creating a [Project]({{< relref "/latest/user/configuration/stages" >}}).
   ```shell
   setops project:create <PROJECT>
   ```

1. Create a [Stage]({{< relref "/latest/user/configuration/stages" >}}) for your project.

   ```shell
   setops -p <PROJECT> stage:create <STAGE>
   ```

   {{< hint info >}}
   `project` and `stage` must only contain lowercase letters `a-z` and numbers `0-9` and start with a lowercase letter. The length of `project` has to be between 3 and 20 characters and the length of `stage` between 3 and 12. It also has to start with a lowercase letter. A valid example is `parkscheibe` & `staging`.
   {{< /hint >}}

1. Create the [App]({{< relref "/latest/user/configuration/apps" >}}) _web_.

   ```shell
   setops -p <PROJECT> -s <STAGE> app:create <APPNAME>
   ```

   {{< hint info >}}
   The name for apps must only contain lowercase letters `a-z` and numbers `0-9` and dashes `-`. The name must be between 3 and 16 characters long and start with a lowercase letter.
   {{< /hint >}}

   We want it to be publicly reachable, so we set the network's [_public_ option]({{< relref "/latest/user/configuration/apps#public" >}}) to _true_.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set public true
   ```
   The default exposed [port]({{< relref "/latest/user/configuration/apps#port" >}}) of the Server is `8080`, so let's change it:
   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set port 8080
   ```
   The Health Check path deviates from the default path (`/`), so you need to adjust the [network Health Check]({{< relref "/latest/user/configuration/apps#network-health-check" >}}) as well.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set health-check-path '/healthz'
   ```

   Last you need to set some [environment variables]({{< relref "latest/user/configuration/apps#environment-variables" >}}) to run the GraphQL Engine:
   ```Shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_ENABLE_CONSOLE=true
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_DEV_MODE=true
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_ENABLED_LOG_TYPES="startup, http-log, webhook-log, websocket-log, query-log"
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_ADMIN_SECRET=setopsftw
   ```
1. Create the [Services]({{< relref "/latest/user/configuration/services" >}}) the App needs.

   We need to create a [PostgreSQL Service]({{< relref "/latest/user/configuration/services#postgresql" >}}) and link it to the App `<APPNAME>`.

   ```shell
   setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key HASURA_GRAPHQL_DATABASE_URL
   ```

   Next we need to install the [PostgreSQL Extension]({{< relref "/latest/user/configuration/services#postgresql-extensions" >}}) `pgcrypto`:
   ```shell
   setops -p <PROJECT> -s <STAGE> --service database option:set extensions pgcrypto
   ```

1. Commit your [Changeset]({{< relref "/latest/user/configuration/changesets" >}}).

   ```shell
   setops -p <PROJECT> -s <STAGE> changeset:commit
   ```

## Deploy your Image
You need to build an image of the application to deploy it with SetOps. We use the Docker Image from [dockerhub](https://hub.docker.com/r/hasura/graphql-engine). You can use our `Dockerfile` for your own apps, too.

6. Pull and deploy your Image

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:deploy hasura/graphql-engine:latest
   ```

   {{< hint info >}}`release:deploy` executes all required steps to deploy a new image to SetOps. You can find more information about the distinct steps and how to run them isolated [here]({{< relref "/latest/user/interaction/app-deployment" >}}).{{< /hint >}}

7. Verify your app status is `RUNNING`.

      ```shell
      setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
      ```

8. Open the application in your browser.

     Copy the domain in format `web.staging.project.$YOURDOMAIN`.

     ```shell
     setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
     ```
     You can log in with the secret defined in the environment variable: `setopsftw`.

Enjoy!

## Commands Summary
If you don’t want explanations for all the commands, you can use these snippets for a fast start. Choose a name for `project`, `stage`, and `app` first. You can edit them in the form in the top right corner.
{{< details "OpenVSCode Server Blueprint" >}}
   ### Configure App
   ```shell
   setops project:create <PROJECT>
   setops -p <PROJECT> stage:create <STAGE>
   setops -p <PROJECT> -s <STAGE> app:create <APPNAME>
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set port 8080
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set public true
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set health-check-path '/healthz'
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_ENABLE_CONSOLE=true
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_DEV_MODE=true
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_ENABLED_LOG_TYPES="startup, http-log, webhook-log, websocket-log, query-log"
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set HASURA_GRAPHQL_ADMIN_SECRET=setopsftw
   setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key HASURA_GRAPHQL_DATABASE_URL
   setops -p <PROJECT> -s <STAGE> --service database option:set extensions pgcrypto
   setops -p <PROJECT> -s <STAGE> changeset:commit
   ```

   ### Pull and deploy App to SetOps Registry
   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:deploy hasura/graphql-engine:latest
   ```

   ### Destroy Stage & Project
   ```shell
   setops -p <PROJECT> stage:destroy <STAGE> --force
   setops project:destroy <PROJECT> --force
   ```
{{< /details >}}
