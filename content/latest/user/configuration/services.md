---
weight: 40
---
# Services

{{< hint info >}}
💡 You can replace the default values of the commands for `PROJECT`, `STAGE` and `APPNAME` in the form on the right side! A standard pattern might be `myproject`, `production` and `web` (see [concepts]({{< relref "/latest/user/concepts" >}})).
{{< /hint >}}

A **Service** is an additional component such as a PostgreSQL. Services provide additional functionality and can be linked to be used in Apps.

{{< hint warning >}}
Like when working with Apps, the management and configuration of Services create Changesets. These Changesets have to be committed in order for the changes to take effect. Note that a Changeset is not bound to a specific entity. It can contain both Service and App-related changes at the same time.
{{</ hint >}}

## Services Overview

Services are managed with the `service` command. It supports these subcommands:

- [`service:create`]({{< relref "#create" >}}) generates a changeset command for a new Service
- [`service:destroy`]({{< relref "#delete" >}}) generates a changeset command to delete a Service
- [`service`]({{< relref "#list" >}}) lists all Services on a Stage
- [`service:info`]({{< relref "#show" >}}) displays detailed information about a Service
- [`link:create|destroy`]({{< relref "#links" >}}) manages Links between an App and a Service
- [`service:option set|unset`]({{< relref "#options" >}}) manages Service Options

We currently support the Service types described in the table below. Refer to the details section for each Service type for specific information on how to create and use this Service.

<!---

!!!! When adding a service, also add it to the backup & restore format reference. !!!!

-->

| Type | Plan(s) | Options | Link |
|------|---------|---------|-------|
| [`postgresql11`]({{< relref "#postgresql" >}}) | `shared` | [`extensions`]({{< relref "#postgresql-extensions" >}}) | Environment Variable |
| [`postgresql13`]({{< relref "#postgresql" >}}) | [RDS PostgreSQL node type](https://aws.amazon.com/de/rds/postgresql/pricing/) | [`extensions`]({{< relref "#postgresql-extensions" >}}), [`min_storage`, `max_storage`]({{< relref "#postgresql-storage" >}}) | Environment Variable |
| [`s3`]({{< relref "#s3" >}}) | not required | `blockPublicAccess` | Environment Variable |
| [`redis6`]({{< relref "#redis6" >}}) | [ElastiCache for Redis Node Type](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheNodes.SupportedTypes.html) | None | Environment Variable |
| [`volume`]({{< relref "#volume" >}}) | not required | None | Path |
| [`elasticsearch7`]({{< relref "#elasticsearch7" >}}) | see [below]({{< relref "#elasticsearch7-plan" >}}) | [`storage`]({{< relref "#elasticsearch7-storage" >}})| Environment Variable |
| [`mongodb4`]({{< relref "#documentdb4" >}}) | see [below]({{< relref "#documentdb4-plan" >}}) | [`scale`]({{< relref "#documentdb4-scale" >}}) | Environment Variable |

## Create a Service {id=create}

You can create a Service by executing the command `service:create SERVICENAME --type SERVICETYPE --plan SERVICEPLAN`.

The Service's Type describes the technology, such as `postgresql11`, while the Plan influences the behavior of the service, e.g. `shared` for a cost-efficient PostgreSQL database on a shared instance.

```shell
setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
```

{{< hint info >}}
The name for services must only contain lowercase letters `a-z` and numbers `0-9` and dashes `-`. The name must be between 3 and 18 characters long and start with a lowercase letter.
{{< /hint >}}

## Delete a Service {id=delete}

In order to delete a service use `service:destroy SERVICENAME`.

```shell
setops -p <PROJECT> -s <STAGE> service:destroy database
```

## List all Services on a Stage {id=list}

You can list all Services on a Stage with `service`.

```shell
setops -p <PROJECT> -s <STAGE> service
```
```
+-----------+
|   NAME    |
+-----------+
| database  |
| database2 |
+-----------+
```

## Show information about a Service {id=show}

To show all data regarding a specific Service use `service:info SERVICENAME`.

```shell
setops -p <PROJECT> -s <STAGE> service:info database
```
```
Name:   database
Type:   postgresql11
Plan:   shared
Links:
-- web   (DATABASE_URL)
Options:
-- extensions   uuid-ossp
```

## Configure Services

You can configure your Service with Links and Options.

{{< hint info >}}
Once the Changeset has been committed, the configuration of a Service can be displayed with the `service:info SERVICENAME` command. If you want to check your changes before committing use `changeset:info`.
{{</ hint >}}

### Manage Links for a Service {id=links}

A Service must be linked to an App to make use of it. Links can be created in two ways, depending on the service type:

* **Environment Variable**: the App is provided with an Environment Variable describing how to access the service
* **Path**: the service (volume) gets mounted into the App container at a user-specified path

To find out, which to choose for a specific service, see the [services overview](#services-overview) table. The specifics of all supported Service types are discussed in the [*Service Specifics* section](#service-specifics) below.

#### Link with Environment Variable {id=link-env}

The command to create a Link is `link:create <SERVICE> --env-key SERVICEADDRESS`.

Create a link between the service `database` and the app `<APPNAME>` with the environment variable key `DATABASE_URL`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key DATABASE_URL
```

#### Link with Path {id=link-path}

The command to create a Link is `link:create <SERVICE> --path PATH`.

Create a Link between the service `data` and the app `<APPNAME>` with the mount path `/data`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create data --path /data
```

You can remove a Link by running `link:destroy <SERVICE>`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:destroy data
```

### Manage Options for a Service {id=options}

Options represent additional parameters that you can configure your Service with. Valid options depend on the particular service type. Please refer to the service-specific documentation for more details. Option values are strings with an expected format, so you have to make sure the syntax matches the expected input outlined in the documentation. To set an option, run `option:set OPTIONNAME OPTIONVALUE`.

```shell
setops -p <PROJECT> -s <STAGE> --service database option:set extensions uuid-ossp
```

Options can be removed with the `option:unset OPTIONNAME` command.

```shell
setops -p <PROJECT> -s <STAGE> --service database option:unset extensions
```

### Manage Scheduled Backups for a Service {id=scheduled-backups}

The Scheduled Backup feature allows you to configure when to backup a given Service. We recommend configuring a backup schedule for every Service you create to ensure you have timely access to a backup when the need arises.

To configure a Scheduled Backup, use the command below:

```shell
setops -p <PROJECT> -s <STAGE> --service database backup:schedule --hour 3
```

This configures the `database` service to run a backup every night around 3am UTC. You can specify the `--hour` parameter multiple times. Optionally, you may add the `--weekday` parameter one or more times. This lets the Scheduled Backup run only on the given weekdays at the specified hour(s).

The backup runs at a random minute in the specified hour(s) for load balancing reasons.

A Scheduled Backup can also be removed from a service:

```shell
setops -p <PROJECT> -s <STAGE> --service database backup:unschedule
```

Last, commit the Changeset to activate the changes:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

## Service Specifics {id=service-specifics}

### PostgreSQL {id=postgresql}

The `postgresql11` & `postgresql13` Services provide a PostgreSQL database with a dedicated user. The Service is linked [with environment variables](#link-env).

Your database user will own the database and all objects within the database.

#### Plan {id=postgresql-plan}

With the `shared` plan (only supported for type `postgresql11`), this database is provisioned in a database cluster shared between Apps. All databases are created with a unique database user to ensure data separation. Using the `shared` plan is a cost-efficient way to add a database to an App.

If you require a dedicated database instance for compliance, performance or reliability, the type must currently be set to `postgresql13` and the plan value can be set to any valid [RDS PostgreSQL node type](https://aws.amazon.com/elasticsearch-service/pricing/). `db.t3.micro` is a sensible default for small workloads. To enable the _Multi-AZ_ feature, which keeps a hot standby instance in a second availability zones for higher reliability, add `.ha` at the end of the node type: e.g. `db.t3.micro.ha` for the _Multi-AZ_ version of `db.t3.micro`. Using plans with `.ha` doubles the cost of the database instance.

#### Create a database

To create a PostgreSQL database, first create the Service:

```shell
setops -p <PROJECT> -s <STAGE> service:create database --type postgresql11 --plan shared
```

#### Link Service to App

If you were to commit the Changeset at this point, the database would be created, but your Apps won't be able to use it.

To fix this, your app needs to know the credentials and the hostname of the database. SetOps uses Environment Variables to provide your App with this information. Create a Link between the App and the Service to do this:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create database --env-key DATABASE_URL
```

Last, commit the Changeset:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

When this is done, the `<APPNAME>` App will be deployed with the Environment Variable `DATABASE_URL`. The format is as follows:

```
DATABASE_URL=postgresql://username:password@shared.something.eu-central-1.rds.amazonaws.com:5432/databasename
```

#### Configure extensions for your database {id=postgresql-extensions}

The PostgreSQL service supports user-configurable database extensions. See AWS' RDS documentation for a complete list. Extensions are configured as Service options:

```shell
setops -p <PROJECT> -s <STAGE> --service database option:set extensions uuid-ossp,postgis
```

The option value is a comma-separated list of extension names. The extensions will be active as soon as you commit the Changeset. You can update the list of enabled extensions by simply setting the option again.

To remove all extensions from your database, unset the option:

```shell
setops -p <PROJECT> -s <STAGE> --service database option:unset extensions
```

If your database is still dependent on a particular extension, it may not be possible for it to be deactivated. In the future, we will implement a feature to let you know about this.

#### Configure storage (non-shared plans only) {id=postgresql-storage}

When using a dedicated database instance (`plan` is not `shared`), the following `options` are available:

`min_storage` sets the amount of storage in gigabytes. The minimum and default is currently `20` gigabytes. You can set this option to a higher value whenever you need more space.

```shell
setops -p <PROJECT> -s <STAGE> --service database option:set min_storage 50
```

You can also activate storage autoscaling by setting `max_storage` to a higher value than `min_storage`. With storage autoscaling enabled, when the database instance is running out of free space it automatically scales up your storage.

```shell
setops -p <PROJECT> -s <STAGE> --service database option:set max_storage 1000
```

Storage modification for an autoscaling-enabled database instance is triggered when these factors apply:

* Free available space is less than 10 percent of the allocated storage.
* The low-storage condition lasts at least five minutes.
* At least six hours have passed since the last storage modification.

The additional storage is in increments of whichever of the following is greater:

* 5 GiB
* 10 percent of currently allocated storage
* Storage growth prediction for 7 hours change in the past hour.

{{< hint warning >}}
To receive alerts when PostgreSQL runs out of storage, make sure to set up [notifications]({{< relref "/latest/user/configuration/notifications" >}}) properly.
{{< /hint >}}

Last, after changing at least one of the values commit the Changeset:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

#### Delete a database

```shell
setops -p <PROJECT> -s <STAGE> service:destroy database
```

{{< hint warning >}}
Deleting a `postgresql11` Service is a **destructive action**. When you commit the `service:destroy` command you will lose access to the database and all objects within it. Think carefully before deleting the Service!

If you accidentally deleted the service, please reach out to us as we *MAY* be able to recover data – but this is just a last resort.
{{< /hint >}}

### S3 Object Store {id=s3}

The `s3` Service provides an [S3-API](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html) compatible object store bucket. The `plan` value is not required for this service. The Service is linked [with environment variables](#link-env).

SetOps will create a dedicated user authorized for all API actions for the bucket. By default all objects within the bucket will have their Access Control List (ACL) set to private, i.e., the objects will not be able to be read or modified with unauthorized, public requests. You can set the option `blockPublicAccess` (defaults to `true`) to `false` to allow setting public object access via ACL. Please make sure, that you really want to do this since it increases the risk of exposing private data. Bucket level ACL modification is not supported.

#### Create a S3 Bucket

To create an S3 bucket, first create the Service:

```shell
setops -p <PROJECT> -s <STAGE> service:create store --type s3 --plan default
```

#### Link Service to App

If you were to commit the Changeset at this point, the bucket would be created, but your Apps won’t be able to use it.

To fix this, your app needs to know the credentials and the hostname of the bucket. SetOps uses Environment Variables to provide your App with this information. Create a Link between the App and the Service to do this:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create store --env-key S3_DATA_URL
```

(Optional - not advised) If you need to make an object public via ACL, add the `blockPublicAccess` option to enable it:

```shell
setops -p <PROJECT> -s <STAGE> --service store option:set blockPublicAccess false
```

Last, commit the Changeset:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

When this is done, the `<APPNAME>` App will be deployed with the Environment Variable `S3_DATA_URL`. The format is as follows:

```
S3_DATA_URL=s3://ACCESS_KEY_URL_ENCODED:SECRET_KEY_URL_ENCODED@bucket-name?region=eu-central-1&endpoint=https%3A%2F%2Fs3.eu-central-1.amazonaws.com
```

{{< hint notice >}}
The AWS Access Key ID (the *username*), and the AWS Secret Access Key (the *password*) are URI-encoded because they may contain special characters. Make sure to decode them in your app.

In Ruby this can be done with `CGI.unescape`:

```ruby
s3_url = URI.parse(ENV['S3_DATA_URL'])
secret_access_key = CGI.unescape(s3_url.password)
```
{{< /hint >}}

#### Delete a S3 Bucket

Finally, you can delete a S3 Service:

```shell
setops -p <PROJECT> -s <STAGE> service:destroy store
```

{{< hint warning >}}
Deleting an `s3` Service is a **destructive action**. When you commit the `service:destroy` command you will lose access to the bucket and all objects within it. Think carefully before deleting the Service!

If you accidentally deleted the service, please reach out to us as we *MAY* be able to recover data – but this is just a last resort.
{{< /hint >}}

### Redis {id=redis6}

The `redis6` Service provides a [Redis](https://redis.io/) instance. The `plan` value can be set to any valid [ElastiCache for Redis Node Type](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheNodes.SupportedTypes.html), but `cache.t3.micro` is a sensible default. All `redis6` service instances run Redis v6. The Service is linked [with environment variables](#link-env).

SetOps will create a dedicated Redis instance for the service and authorize your user for access to that instance. Note that your App will need to use the [`AUTH` command](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/auth.html) when it connects to the instance.

[In-Transit Encryption (TLS)](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/in-transit-encryption.html) will be activated for the Redis instance. The Environment Variable injected into your App by the Service's Link will have the `rediss://` protocol to reflect this (unencrypted Redis connections use `redis://`).

#### Create a Redis Instance

To create a Redis instance, first create the Service:

```shell
setops -p <PROJECT> -s <STAGE> service:create queue --type redis6 --plan cache.t3.micro
```

#### Link Service to App

If you were to commit the Changeset at this point, the Redis instance would be created, but your Apps won’t be able to use it.

To fix this, your app needs to know the credentials and the hostname of the database. SetOps uses Environment Variables to provide your App with this information. Create a Link between the App and the Service to do this:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create queue --env-key REDIS_URL
```

Last, commit the Changeset:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

When this is done, the `<APPNAME>` App will be deployed with the Environment Variable `REDIS_URL`. The format is as follows:

```
REDIS_URL=rediss://:AUTHTOKEN@master.parkscheibe-staging-somenumber.something.euc1.cache.amazonaws.com:6379
```

`master.parkscheibe-staging-somenumber.something.euc1.cache.amazonaws.com` is the hostname you need to configure your Redis API client to use. The `AUTH` token is encoded in the password value of the Environment Variable.

#### Delete a Redis Service

Finally, you can delete a Redis Service:

```shell
setops -p <PROJECT> -s <STAGE> service:destroy queue
```

{{< hint warning >}}
Deleting a `redis6` Service is a **destructive action**. When you commit the `service:destroy` command you will lose access to the Redis instance and all data within it. Think carefully before deleting the Service!
{{< /hint >}}

### Volume {id=volume}

The `volume` Service provides a persistent storage volume. The volume is created when you create the Service, and it can be used by any number of apps simultaneously. The Service is linked [with a path](#link-path).

#### Create a Volume

To create a volume, first create the Service:

```shell
setops -p <PROJECT> -s <STAGE> service:create data --type volume
```

#### Link Service to App

If you were to commit the Changeset at this point, the volume would be created, but your Apps won't be able to use it.

To fix this, your App needs to be linked with the Service so that it becomes available at a path you specify. Create a Link between the App and the Service to do this:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create data --path /data
```

You can optionally add the `--read-only` flag to make the volume read-only for this App Link. Other apps can still be linked with read-write access.

Last, commit the Changeset:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

When this is done, the `<APPNAME>` App will be deployed with the linked volume at the specified path.

#### Delete a Volume

Finally, you can delete a `volume` Service:

```shell
setops -p <PROJECT> -s <STAGE> service:destroy data
```

{{< hint warning >}}
Deleting a `volume` Service is a **destructive action**. When you commit the `service:destroy` command you will lose access to the volume and all files within it. Think carefully before deleting the Service!

If you accidentally deleted the service, please reach out to us as we *MAY* be able to recover data – but this is just a last resort.
{{< /hint >}}

#### File Permissions

All files and directories on the volume will per default be owned by root (UID 0), not by the user who created them. However, any user can still create, modify, and delete files and directories on the volume. This might seem confusing when you're working with the volume as it is not how files and directories behave on your local filesystem. However, it allows for maximum interoperability since you don't need to configure the users and groups used by your App images.

Note that the term "user" in this section refers to an UNIX user account, not a SetOps account.

This is how it looks from a terminal. `/vol` is the mount path of a volume service.

```
user@host:/vol$ touch test
user@host:/vol$ ls -al
total 12
drwxr-xr-x 2 root root 6144 Apr 27 06:08 .
drwxr-xr-x 1 root root 4096 Apr 27 06:07 ..
-rw-r--r-- 1 root root    0 Apr 27 06:08 test
```

You can still use `chown`, `chmod` etc. to change file and directory permissions, which will be persisted across container restarts. However, they are not verified and any user may read and write to the volume.

Effectively, this means that all Apps which link with a Volume Service gain full access to the linked volume. You can use the `--read-only` flag to prohibit a certain app from writing to the volume.

### Elasticsearch 7 {id=elasticsearch7}

The `elasticsearch7` Service provides an Elasticsearch cluster with version 7.

To create a volume, first create the Service:

```
setops -p <PROJECT> -s <STAGE> service:create search1 --type elasticsearch7 --plan db.small
```

#### Plan {id=elasticsearch7-plan}

The value for `--plan` is composed of three to four parts:

* First, the [instance type](https://aws.amazon.com/elasticsearch-service/pricing/) (as in hardware generation, e.g. `t3`).
* Second, the [instance size](https://aws.amazon.com/elasticsearch-service/pricing/) (as in CPU and RAM resources, e.g. `medium`).
* Third, `elasticsearch`.
* Last, a modifier for an *optional* high-availability setup (e.g. `sharded` or `ha`).

This a valid `--plan` value: `t3.medium.elasticsearch`. For highly-available deployment, you could use `t3.medium.elasticsearch.ha`.

For most basic use cases, `t3.small.elasticsearch` will do the job just fine. Using high-availability deployments is really justified only if your App is also developed and deployed with high availability in mind. In all other cases, you will just end up paying for more resources than your App can practically make use of.

Sharded setups deploy Elasticsearch Service instances in two [Availability Zones](https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-managedomains-multiaz.html) (rather than one). Highly-available (`ha`) configurations utilize three Elasticsearch [Master Nodes](https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-managedomains-dedicatedmasternodes.html) in different [Availability Zones](https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-managedomains-multiaz.html).

#### Storage {id=elasticsearch7-storage}

The Elasticsearch service is provisioned with 10 GB of storage initially. You can set the `storage` option to increase the size:

```shell
setops -p <PROJECT> -s <STAGE> --service search1 option:set storage 30
```

Note that the valid range for the `storage` option is between 1 GB and 1024 GB.

#### Link Service to App

If you were to commit the Changeset at this point, the Elasticsearch service would be created, but your Apps won't be able to use it.

To fix this, your App needs to be linked with the Service so that it knows the credentials for the Elasticsearch service. SetOps uses Environment Variables to provide your App with this information. Create a Link between the App and the Service to do this:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create search1 --env-key ELASTICSEARCH_URL
```

Last, commit the Changeset:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

When this is done, the `<APPNAME>` App will be deployed with the Environment Variable `ELASTICSEARCH_URL`. The format is as follows:

```
https://user:password@somehost.eu-central-1.es.amazonaws.com:443
```

Your App needs to authenticate itself using HTTP Basic Auth with the credentials from the Environment Variable. The traffic to the Elasticsearch Service needs to be TLS-encrypted (`https`).

#### Delete Service

Finally, you can delete an `elasticsearch7` Service:

```shell
setops -p <PROJECT> -s <STAGE> service:destroy search1
```

{{< hint warning >}}
Deleting an `elasticsearch7` Service is a **destructive action**. When you commit the `service:destroy` command you will lose access to the service and all stored data. Think carefully before deleting the Service!

If you accidentally deleted the service, please reach out to us as we *MAY* be able to recover data – but this is just a last resort.
{{< /hint >}}

### DocumentDB 4 {id=documentdb4}

The `mongodb4` Service provides an [AWS DocumentDB (with MongoDB Compatibility)](https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html) cluster. The SetOps DocumentDB service targets MongoDB API version 4.0.

AWS DocumentDB provides a subset of the full MongoDB API. This means that there are certain differences on how MongoDB and DocumentDB works, and which APIs it supports:

* There are some [functional differences](https://docs.aws.amazon.com/documentdb/latest/developerguide/functional-differences.html) between DocumentDB and MongoDB.
* DocumentDB [supports a subset of MongoDB APIs](https://docs.aws.amazon.com/documentdb/latest/developerguide/mongo-apis.html).
* DocumentDB [enforces different naming constraints](https://docs.aws.amazon.com/documentdb/latest/developerguide/limits.html#limits-naming_constraints) than MongoDB.

This means you need to verify that your application works with DocumentDB. When it does, DocumentDB provides certain benefits:

* It's a highly-available, fault-tolerant, and scalable service.
* It has a lower cost, compared to other hosted MongoDB offerings.

We plan to introduce an additional SetOps Service for full MongoDB compatibility in a future SetOps version.

To create a DocumentDB cluster, first create the Service:

```
setops -p <PROJECT> -s <STAGE> service:create mongo1 --type mongodb4 --plan db.t3.medium
```

#### Plan {id=documentdb4-plan}

See the table below for valid `--plan` values.

| Plan | vCPU | Memory |
|------|------|--------|
|`db.t3.medium`|2|4 GiB|
|`db.r5.large`|2|16 GiB|
|`db.r5.xlarge`|4|32 GiB|
|`db.r5.2xlarge`|8|64 GiB|

For most basic use cases, `db.t3.medium` will do the job just fine. You can control the level of reliability (i.e., high availability) with the [`scale` option]({{< relref "#mongodb4-scale" >}})

#### Scale {id=documentdb4-scale}

Initially, the MongoDB cluster is created with one replica, which is also the primary instance. You can set the `scale` option to any number between 0 and 14. Any number greater than 1 will provision a multi-node cluster with one primary instance and *n-1* replicas. The follower instances can be used to increase read throughput. The endpoint your App receives is the *Cluster endpoint*, which allows the MongoDB client to discover all instances in the cluster. You can specify the read behavior by configuring the MongoDB client ([Read Preference](https://docs.mongodb.com/manual/core/read-preference/)).

#### Link Service to App

If you were to commit the Changeset at this point, the MongoDB service would be created, but your Apps won't be able to use it.

To fix this, your App needs to be linked with the Service so that it knows the credentials for the MongoDB service. SetOps uses Environment Variables to provide your App with this information. Create a Link between the App and the Service to do this:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> link:create mongo1 --env-key MONGODB_URL
```

Last, commit the Changeset:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```

When this is done, the `<APPNAME>` App will be deployed with the Environment Variable `MONGODB_URL`. The format is as follows:

```
mongodb://username:password@somehost.eu-central-1.docdb.amazonaws.com:27017/?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

Your App needs to authenticate itself with the credentials from the Environment Variable.

#### In-Transit Encryption

Traffic to the MongoDB Service needs to be encrypted. The CA certificates for the encrypted connection can be downloaded from https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem. The path to the downloaded CA bundle needs to be specified in the `ssl_ca_cert` client option.

For example, add a line in the `Dockerfile` used to build your App image:

```dockerfile
ADD https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem /app/rds-combined-ca-bundle.pem
```

Next, you include the certificate bundle the MongoDB Ruby client initialization:

```ruby
mongo = Mongo::Client.new(ENV['MONGODB_URL'], ssl_ca_cert: '/app/rds-combined-ca-bundle.pem')
```

For Java apps, the `rds-combined-ca-bundle.pem` does not work since it contains two certs with the same alias. Instead, use the RDS root certificate. Add this to your `Dockerfile`:

```dockerfile
# the combined bundle does not work with Java since it contains two certs with the same alias
ADD https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem /tmp/rds-ca-2019-root.pem

RUN $JAVA_HOME/bin/keytool \
    -import \
    -trustcacerts \
    -keystore $JAVA_HOME/lib/security/cacerts \
    -storepass changeit \
    -noprompt \
    -file /tmp/rds-ca-2019-root.pem
```



#### Delete Service

Finally, you can delete an `mongodb4` Service:

```shell
setops -p <PROJECT> -s <STAGE> service:destroy mongo1
```

{{< hint warning >}}
Deleting an `mongodb4` Service is a **destructive action**. When you commit the `service:destroy` command you will lose access to the service and all stored data. Think carefully before deleting the Service!

If you accidentally deleted the service, please reach out to us as we *MAY* be able to recover data – but this is just a last resort.
{{< /hint >}}

## Going further

[Monitor your App]({{< relref "/latest/user/configuration/notifications" >}}) with Notifications.
