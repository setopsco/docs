---
weight: 10
---
# Getting Started with Rails

![Rails sample app](rails-sample-app.png)

In this tutorial, you will deploy the sample application from Michael Hartl's book [Ruby on Rails Tutorial: Learn Web Development with Rails](https://www.railstutorial.org). It's a simple micro-blogging application that lets you create posts and follow other users. It leverages a PostgreSQL database and stores file uploads in an S3 Object Store.

## Prepare your Code

1. Get started by getting the code. You can use our fork at
   [_setopsco/sample_app_6th_ed_](https://github.com/setopsco/sample_app_6th_ed) or [_mhartl/sample_app_6th_ed_](https://github.com/mhartl/sample_app_6th_ed).

   Using our fork will provide you with a verified version. The repository includes a _setops_ branch in which all necessary adjustments
   for making the app a [Twelve-Factor App](https://12factor.net) were done already.

   ```shell
   git clone https://github.com/setopsco/sample_app_6th_ed
   ```

2. Check out the _setops_ branch or apply the diff from [the pull request](https://github.com/setopsco/sample_app_6th_ed/pull/1/files) to your code.

   ```shell
   git checkout --track origin/setops
   ```

## Build your Image
You need to build an image of your application to deploy it with SetOps. For this tutorial, we recommend using [Cloud Native Buildpacks](https://buildpacks.io) with its [`pack` CLI](https://buildpacks.io/docs/tools/pack/) which lets you build an image with ease. However, you can also use any other tool that creates a runnable image, such as Docker. Install the CLI and get started:

3. Let's use [Cloud Native Buildpacks](https://buildpacks.io) for creating the App's image.

   ```shell
   pack build sample-app --builder heroku/buildpacks:18 --env-file .env.build
   ```

   {{< hint info >}}
   💡if you're not sure about building App Images and what an `.env.build` file is, have a quick look at our best practices for [building an image]({{< relref "/user/best-practices/build-image" >}}).
   {{< /hint >}}

## Prepare your SetOps Environment
At first, you need to choose a name for `project`, `stage`, and `app`. You can edit them in the form in the top right corner.

4. Now we're ready to deploy this app to SetOps. Start by creating a [Project]({{< relref "/user/configuration/stages" >}}).

   ```shell
   setops project:create <PROJECT>
   ```

5. Create a [Stage]({{< relref "/user/configuration/stages" >}}) for your project.

   ```shell
   setops -p <PROJECT> stage:create <STAGE>
   ```

   {{< hint info >}}
   `project` and `stage` must only contain lowercase letters `a-z` and numbers `0-9` and start with a lowercase letter. The length of `project` has to be between 3 and 20 characters and the length of `stage` between 3 and 12. It also has to start with a lowercase letter. A valid example is `parkscheibe` & `staging`.
   {{< /hint >}}

6. Create the [App]({{< relref "/user/configuration/apps" >}}) _web_.

   ```shell
   setops -p <PROJECT> -s <STAGE> app:create <APPNAME>
   ```

   {{< hint info >}}
   The name for apps must only contain lowercase letters `a-z` and numbers `0-9` and dashes `-`. The name must be between 3 and 16 characters long and start with a lowercase letter.
   {{< /hint >}}

   We want it to be publicly reachable, so we set the network's [_public_ option]({{< relref "/user/configuration/apps#private" >}}) to _true_.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set public true
   ```

   Set the App's [container entrypoint]({{< relref "/user/configuration/apps#entrypoint" >}}) to `launcher` and the [container command]({{< relref "/user/configuration/apps#command" >}}) to the Puma webserver. Read the [buildpacks.io docs](https://buildpacks.io/docs/app-developer-guide/run-an-app/) to find out what `launcher` does and keep in mind that this entrypoint is buildpack specific.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set entrypoint launcher
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set command -- bundle exec puma -C config/puma.rb
   ```

   Next, we need to change the default resources for a container since Rails' memory consumption is higher:
   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> resource:set memory 512
   ```

   Let's also configure a [container Health Check]({{< relref "/user/configuration/apps#container-health-check" >}}), which is executed in the container and checks if our app is healthy.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> container:set health-check --interval 5 --timeout 5 --retries 10 --start-period 5 -- /bin/sh -c 'curl -s http://localhost:$PORT/.well-known/health-check | grep ok'
   ```

   The Health Check path deviates from the default path (`/`), so you need to adjust the [network Health Check]({{< relref "/user/configuration/apps#network-health-check" >}}) as well.

   ```shell
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> network:set health-check-path '/.well-known/health-check'
   ```

7. Create the [Services]({{< relref "/user/configuration/services" >}}) the App needs.

   First, create a [PostgreSQL Service]({{< relref "/user/configuration/services#postgresql" >}}) and link it to the App `<APPNAME>`.

   ```shell
   setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key DATABASE_URL
   ```

   Next, create a [S3 Object Store Service]({{< relref "/user/configuration/services#s3" >}}) and link it to the App `<APPNAME>`.

   ```shell
   setops -p <PROJECT> -s <STAGE> service:create store --type s3 --plan default
   setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create store --env-key S3_DATA_URL
   ```

   {{< hint info >}}
   The name for services must only contain lowercase letters `a-z` and numbers `0-9` and dashes `-`. The name must be between 3 and 18 characters long and start with a lowercase letter.
   {{< /hint >}}

8. Commit your [Changeset]({{< relref "/user/configuration/changesets" >}}).

   ```shell
   setops -p <PROJECT> -s <STAGE> changeset:commit
   ```

## Deploy your Image

9. Push the image you created earlier to the SetOps [Image Registry]({{< relref "/user/interaction/app-deployment#registry" >}}).

   First, log in to the Image Registry. Get your login command with `setops registry:login` and follow the instructions:

   ```shell
   setops registry:login
   [...]
   Run the following command to log into the Docker registry:

   printf YOURTOKEN | docker login -u setops --password-stdin zweitag.setops.net
   [...]
   ```

   Next, push the Docker image to the registry:

   ```shell
   docker tag sample-app:latest zweitag.setops.net/<PROJECT>/<STAGE>/<APPNAME>:latest
   docker push zweitag.setops.net/<PROJECT>/<STAGE>/<APPNAME>:latest
   ```

   ```
   [...]
   web: digest: sha256:0f7d58c45f7d97013c209b2603f2d098fd0ccfefb2ee738bcbce154491d2426c size: 3245
   ```

10. Create a [release]({{< relref "/user/interaction/app-deployment#releases" >}}) and deploy it.

      ```shell
      setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:create sha256:0f7d58c45f7d97013c209b2603f2d098fd0ccfefb2ee738bcbce154491d2426c
      setops -p <PROJECT> -s <STAGE> --app <APPNAME> release:activate 1
      setops -p <PROJECT> -s <STAGE> changeset:commit
      ```

11. Verify your app is running and its health status is `HEALTHY`.

      ```shell
      setops -p <PROJECT> -s <STAGE> app:info <APPNAME>
      ```

12. We will also need to initialize the database schema and load some sample data from the seeds (`db/seeds.rb`).

      Run `rake db:schema:load db:seed` to load the database schema and populate it with seed data:

      ```shell
      setops -p <PROJECT> -s <STAGE> --app <APPNAME> task:run -- env DISABLE_DATABASE_ENVIRONMENT_CHECK=1 rake db:schema:load db:seed
      ```

13. Open the application in your browser.

      Copy the domain in format `web.staging.project.$YOURDOMAIN`.

      ```shell
      setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
      ```

You can log in with the sample user defined in `db/seeds.rb` - `example@railstutorial.org` and password `foobar`.

Enjoy!
