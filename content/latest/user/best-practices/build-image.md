---
weight: 30
HideCommandReplacement: true
---
# Build Docker Image

{{< hint info >}}
SetOps chooses not to provide its own Continuous Delivery feature, but to build upon existing, reliable, and trusted tools. This means we don't build Docker images for you. To deploy your application, you need to build a runnable image first.
{{< /hint >}}

{{< details "Ruby on Rails Applications (Buildpacks)" >}}
For a Ruby on Rails application, we recommend [Cloud Native Buildpacks](https://buildpacks.io/) for creating the App image. Install the [pack CLI](https://buildpacks.io/docs/tools/pack/) first.

### Use `.env.build` for Building an Image
Rails applications will usually need some _ENVs_ during the build step, otherwise, the build will fail. Our best practice so far is to use a `.env.build` with all required _ENVs_ and use it in your build command as follows:
```shell
pack build [MYAPP] --builder heroku/buildpacks:18 --env-file=".env.build"
```

### Required _ENVs_ for the Build Step
We came up with a certain set of required _ENVs_  in our applications. You have to check whether your app has the same _ENVs_ or uses the same logic.

```env
DATABASE_URL=postgres:///
DATABASE_URL_WITHOUT_DB_NAME=postgres:///
RAILS_ENV=staging
SECRET_KEY_BASE=qwer
SEND_MAILS_VIA_SMTP=false
SMTP_FROM=invalid@some.domain
SMTP_URL_HOST=some.domain
USE_HTTP_BASIC_AUTH=false
S3_DATA_URL=s3://ACCESS_KEY:SECRET_KEY@host.invalid/bucket?region=eu-central-1
```
{{< /details >}}
<br>
{{< details "Docker Image (Dockerfile)" >}}
You can use any Docker Image created by others and published in a Docker registry. Just download the Image, tag and push it to your SetOps Docker registry.

### Build your own Docker Image
If you're developing an application, you can create your own [Docker Image](https://docs.docker.com/get-started/overview/#docker-registries). To do this with Docker, you need a Dockerfile. Check out Docker's [Image-building best practices](https://docs.docker.com/get-started/09_image_best/) and [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/).

{{< hint info >}}
You can overwrite the last `CMD` command of your Dockerfile at the SetOps App level. See App's [Command Reference]({{< relref "apps#command" >}}) for further information.
{{< /hint >}}
{{< /details >}}

## Going further
Read more about deploying an image in the [App Deployment Section]({{< relref "app-deployment" >}}).
