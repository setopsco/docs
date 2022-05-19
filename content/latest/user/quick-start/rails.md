---
weight: 10
---
# Getting Started with Rails

![Rails sample app](rails-sample-app.png)

In this tutorial, you will deploy the sample application from Michael Hartl's book [Ruby on Rails Tutorial: Learn Web Development with Rails](https://www.railstutorial.org). It's a simple micro-blogging application that lets you create posts and follow other users. It leverages a PostgreSQL database and stores file uploads in an S3 Object Store. We will explain all the necessary SetOps commands that we need to deploy the application. You can find a summary of all commands [at the end]({{< relref "#commands-summary" >}}).

## Prepare your Code

1. Get started by getting the code. The code is originally hosted at [_mhartl/sample_app_6th_ed_](https://github.com/mhartl/sample_app_6th_ed), but for convinience, we recommend using our fork at [_setopsco/rails-sample-app_](https://github.com/setopsco/rails-sample-app)

   This will provide you with a verified version, and all necessary adjustments towards a [Twelve-Factor App](https://12factor.net) have already been made.

   ```shell
   git clone https://github.com/setopsco/rails-sample-app
   ```

## Build your Image
You need to build an image of your application to deploy it with SetOps. We have included a `Dockerfile` with the Rails sample app. You can use our `Dockerfile` for your own apps, too.

2. Build the image using `docker build`.

   ```shell
   docker build --pull -t sample-app:latest .
   ```

   {{< hint info >}}
   💡if you're not sure about building App Images, have a quick look at our best practices for [building an image]({{< relref "/latest/user/best-practices/build-image" >}}).
   {{< /hint >}}

## Prepare your SetOps Environment
At first, you need to choose a name for `project`, `stage`, and `app`. You can edit them in the form in the top right corner.

3. Now we're ready to deploy this app to SetOps. Start by creating a [Project]({{< relref "/latest/user/configuration/stages" >}}).

   ```shell
   setops project:create <PROJECT>
   ```

4. Create a [Stage]({{< relref "/latest/user/configuration/stages" >}}) for your project.

   ```shell
   setops -p <PROJECT> stage:create <STAGE>
   ```

   {{< hint info >}}
   `project` and `stage` must only contain lowercase letters `a-z` and numbers `0-9` and start with a lowercase letter. The length of `project` has to be between 3 and 20 characters and the length of `stage` between 3 and 12. It also has to start with a lowercase letter. A valid example is `parkscheibe` & `staging`.
   {{< /hint >}}

5. Create the [App]({{< relref "/latest/user/configuration/apps" >}}) _web_.

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

   Next, we need to change the default [resources]({{< relref "/latest/user/configuration/apps#resource-parameters" >}}) for a container since Rails' memory consumption is higher:
   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> resource:set memory 512
   ```

   To get the Rails app started inside the container, we need to set a `command`:
   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set command -- bundle exec puma
   ```

   Let's also configure a [container Health Check]({{< relref "/latest/user/configuration/apps#container-health-check" >}}), which is executed in the container and checks if our app is healthy.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set health-check -- /bin/sh -c 'curl -s http://localhost:$PORT/.well-known/health-check | grep ok'
   ```
   {{< hint info >}}
   The Health Check command must be installed within the App's Docker image. For example, when using `sh` and `curl` for the Health Check command, make sure the `curl` binary and a `shell` is present in the image. In case the container is not `HEALTHY`, check the logs and test your image.
   {{< /hint >}}

   The Health Check path deviates from the default path (`/`), so you need to adjust the [network Health Check]({{< relref "/latest/user/configuration/apps#network-health-check" >}}) as well.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set health-check-path '/.well-known/health-check'
   ```

   Last, you need to set a `SECRET_KEY_BASE` for Rails.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set SECRET_KEY_BASE=$(openssl rand -hex 64)
   ```

6. Create the [Services]({{< relref "/latest/user/configuration/services" >}}) the App needs.

   First, create a [PostgreSQL Service]({{< relref "/latest/user/configuration/services#postgresql" >}}) and link it to the App `<APPNAME>`.

   ```shell
   setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key DATABASE_URL
   ```

   Next, create a [S3 Object Store Service]({{< relref "/latest/user/configuration/services#s3" >}}) and link it to the App `<APPNAME>`.

   ```shell
   setops -p <PROJECT> -s <STAGE> service:create store --type s3 --plan default
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create store --env-key S3_DATA_URL
   ```

   {{< hint info >}}
   The name for services must only contain lowercase letters `a-z` and numbers `0-9` and dashes `-`. The name must be between 3 and 18 characters long and start with a lowercase letter.
   {{< /hint >}}

7. Commit your [Changeset]({{< relref "/latest/user/configuration/changesets" >}}).

   ```shell
   setops -p <PROJECT> -s <STAGE> changeset:commit
   ```

## Deploy your Image

8. Push the image you created earlier to the SetOps [Image Registry]({{< relref "/latest/user/interaction/app-deployment#registry" >}}).

   ```shell
   docker tag sample-app:latest api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
   docker push api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
   ```

   ```
   [...]
   web: digest: sha256:0f7d58c45f7d97013c209b2603f2d098fd0ccfefb2ee738bcbce154491d2426c size: 3245
   ```

9. Create a [release]({{< relref "/latest/user/interaction/app-deployment#releases" >}}) and deploy it.

     ```shell
     setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:create sha256:0f7d58c45f7d97013c209b2603f2d098fd0ccfefb2ee738bcbce154491d2426c
     setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:activate 1
     setops -p <PROJECT> -s <STAGE> changeset:commit
     ```

10. Verify your app is running and its health status is `HEALTHY`.

      ```shell
      setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
      ```

11. We will also need to initialize the database schema and load some sample data from the seeds (`db/seeds.rb`).

      Run `rake db:schema:load db:seed` to load the database schema and populate it with seed data:

      ```shell
      setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- env DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rake db:schema:load db:seed
      ```

12. Open the application in your browser.

      Copy the domain in format `web.staging.project.$YOURDOMAIN`.

      ```shell
      setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
      ```

      You can log in with the sample user defined in `db/seeds.rb`: the username is `example@railstutorial.org` with password `foobar`.

Enjoy!

## Commands Summary
If you don’t want explanations for all the commands, you can use these snippets for a fast start. Choose a name for `project`, `stage`, and `app` first. You can edit them in the form in the top right corner.
{{< details "Rails Sample App Blueprint" >}}

   ### Build Image
   While building the image you can already start configuring the App.
   ```shell
   git clone https://github.com/setopsco/rails-sample-app
   cd rails-sample-app
   docker build --pull -t sample-app:latest .
   ```
   ### Configure App
   ```shell
   setops project:create <PROJECT>
   setops -p <PROJECT> stage:create <STAGE>
   setops -p <PROJECT> -s <STAGE> app:create <APPNAME>
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> resource:set memory 512
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set port 3000
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set public true
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set command -- bundle exec puma
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set health-check -- /bin/sh -c 'curl -s http://localhost:$PORT/.well-known/health-check | grep ok'
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set health-check-path '/.well-known/health-check'
   setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key DATABASE_URL
   setops -p <PROJECT> -s <STAGE> service:create store --type s3 --plan default
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create store --env-key S3_DATA_URL
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set SECRET_KEY_BASE=$(openssl rand -hex 64)
   setops -p <PROJECT> -s <STAGE> changeset:commit
   ```

   ### Push App to SetOps Registry
   ```shell
   docker tag sample-app:latest api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
   docker push api.setops.co/<ORGANIZATION>/<PROJECT>/<STAGE>/<APPNAME>:latest
   ```

   ### Deploy App
   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:create <SHA FROM PUSH>
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:activate 1
   setops -p <PROJECT> -s <STAGE> changeset:commit
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- env DISABLE_DATABASE_ENVIRONMENT_CHECK=1 bundle exec rake db:schema:load db:seed
   ```

   ### Destroy Stage & Project
   ```shell
   setops -p <PROJECT> stage:destroy <STAGE> --force
   setops project:destroy <PROJECT> --force
   ```
{{< /details >}}
