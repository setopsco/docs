---
title: Backup & Restore
---

# Backup & Restore

SetOps supports backup and restore for [Services]({{< relref "/latest/user/configuration/services" >}}). This feature allows you to periodically backup your data, restore a service to an earlier snapshot and is useful to migrate your apps from and to SetOps. Detailed configuration and usage steps for all of these use cases are outlined below.

## List all backups

Use `backup` to view a list of backups for a given Service:

```shell
setops -p <PROJECT> -s <STAGE> --service <SERVICE> backup
```

```
+--------------------------------------+---------+----------------------+----------+
|                  ID                  | STATUS  |      CREATED AT      |   SIZE   |
+--------------------------------------+---------+----------------------+----------+
| 6a6fcd7a-7063-4cb4-a748-8f765eea39a2 | CREATED | 2021-04-23T12:03:10Z | 150.8 kB |
| 82a08f8e-3392-4211-ac55-6cd9c2884fa4 | CREATED | 2021-04-27T19:07:25Z |  75.3 MB |
+--------------------------------------+---------+----------------------+----------+
```

The list shows two backups. Every backup is identified by its ID.

A backup can be in one of three states:

- `CREATED`: the backup has been successfully created and is available for download and restore
- `CREATING`: the backup is currently being created, it can't be downloaded, restored, or deleted
- `RESTORING`: the backup is currently being restored, it can't be deleted

{{< hint info >}}
💡 Note that [Scheduled Backups](/docs/latest/user/configuration/services#scheduled-backups) will not appear in this list as `CREATING`. They will rather show as `CREATED` once they are done.
{{< /hint >}}

## Create a backup

Use `backup:create` to create a backup for a given Service, e.g. `database`:

```shell
setops -p <PROJECT> -s <STAGE> --service database backup:create
```
```
ID:       badbbc84-911b-4eb0-89be-bfc3cea5c6ff
Status:   CREATING
```

Note that the backup can only be downloaded or restored when it has the status `CREATED`. Use `backup` to check that it is `CREATED`.

{{< hint info >}}
💡 You can configure SetOps to automatically create backups of the Service. Refer to [the Services section](/docs/latest/user/configuration/services#scheduled-backups) to learn more.
{{< /hint >}}

## Restore a backup

This will show you how to restore a backup for a given Service.

For a restore, you have two options:

* [Restore an existing service](#restore-an-existing-service) (this will keeping the existing data and add the backup on top)
* [Restore to a new service](#restore-to-a-new-service) (you create a new service, upload & restore a backup, resulting in a fresh copy)

{{< hint info >}}
Restoring a backup **will not purge existing data** for the service. Existing data will be kept and the backup is restored
"on top" of it. See [Restore backup to a new Service](#restore-to-a-new-service) to learn how to import an earlier backup from SetOps or somewhere else.
{{< /hint>}}

### Restore an existing service

Use `backup:restore ID` to restore a backup for a given Service, e.g. `database`.

```shell
setops -p <PROJECT> -s <STAGE> --service database backup
```
```
+--------------------------------------+---------+----------------------+----------+
|                  ID                  | STATUS  |      CREATED AT      |   SIZE   |
+--------------------------------------+---------+----------------------+----------+
| e3e7ccb5-26ff-4946-ad5f-9c97118d77a3 | CREATED | 2021-07-15T16:01:53Z | 139.3 kB |
+--------------------------------------+---------+----------------------+----------+
```
```shell
setops -p <PROJECT> -s <STAGE> --service database backup:restore e3e7ccb5-26ff-4946-ad5f-9c97118d77a3
```
```
ID:           e3e7ccb5-26ff-4946-ad5f-9c97118d77a3
Status:       RESTORING
Created At:   2021-04-03T09:41:38Z
Size:         150.8 kB
```

When `backup` doesn't show the backup as `RESTORING`, the restore process has finished. A feature that allows you to view backup logs and receive notifications for successful or failed restores will be added in a future version.

### Restore to a new service

Restoring to a new service will create an identical replica of an existing service or custom backup you uploaded.

To achieve this, follow these steps:

1. Create a new Service with the same configuration as the existing one. See [Showing information about a Service]({{< relref "/latest/user/configuration/services#show" >}}) and [Create a new Service]({{< relref "/latest/user/configuration/services#create" >}}). Make sure to [commit your changes]({{< relref "/latest/user/configuration/changesets" >}}) before continuing.

1. [Download the backup](#download-a-backup) from the existing service.

1. [Upload the backup](#upload-a-backup) to the new service.

1. [Restore the backup](#restore-an-existing-service) to the new service.

1. [Link the new service]({{< relref "/latest/user/configuration/services#links" >}}) to your app(s). If you want to replace the old service, unlink the old service and link the new service with the same environment key.

## Upload a backup

Use `backup:upload FILE` to upload a backup to a given Servie, e.g. `database`:

```shell
setops -p <PROJECT> -s <STAGE> --service database backup:upload backup.psqlcustom
```
```
✅ backup.psqlcustom completed (1.47 mB) with ID b3263ac2-f6e0-4227-a3c7-f197603a386c
```
```shell
setops -p <PROJECT> -s <STAGE> --service database backup
```
```
+--------------------------------------+---------+----------------------+----------+
|                  ID                  | STATUS  |      CREATED AT      |   SIZE   |
+--------------------------------------+---------+----------------------+----------+
| b3263ac2-f6e0-4227-a3c7-f197603a386c | CREATED | 2021-07-15T16:01:53Z | 139.3 kB |
+--------------------------------------+---------+----------------------+----------+
```

You can use `--print-url` to get a command for uploading the file with an external tool. Add `--output plain` to only get the URL.

See [Backup Formats](#backup-formats) to learn how to create a valid backup archive.

## Download a backup

Use `backup:download ID` to download a backup for a given Service, e.g. `database`:

```shell
setops -p <PROJECT> -s <STAGE> --service database backup
```
```
+--------------------------------------+---------+----------------------+----------+
|                  ID                  | STATUS  |      CREATED AT      |   SIZE   |
+--------------------------------------+---------+----------------------+----------+
| 0b10bc93-5ae7-40ef-ba40-e5110ad2d467 | CREATED | 2021-07-15T16:01:53Z | 139.3 kB |
+--------------------------------------+---------+----------------------+----------+
```
```shell
setops -p <PROJECT> -s <STAGE> --service database backup:download 0b10bc93-5ae7-40ef-ba40-e5110ad2d467
```
```
ID:           0b10bc93-5ae7-40ef-ba40-e5110ad2d467
Status:       CREATED
Created At:   2021-04-03T10:55:53Z
Size:         150.8 kB

✅  0b10bc93-5ae7-40ef-ba40-e5110ad2d467.psqlcustom completed (150.8 kB) with ID 0b10bc93-5ae7-40ef-ba40-e5110ad2d467
```

The CLI will download the backup to the current directory. To overwrite existing files, add the `-f, --force` flag.

Instead of downloading the file with the `setops` CLI, you can use `--print-url` to get a command for downloading the file with an external tool. Add `--output plain` to only get the URL.

See [Backup Formats](#backup-formats) to learn how to use the downloaded backup.

## Delete a backup

Use `backup:destroy ID` to delete a backup for a given Service, e.g. `database`:

```shell
setops -p <PROJECT> -s <STAGE> --service database backup
```
```
+--------------------------------------+---------+----------------------+----------+
|                  ID                  | STATUS  |      CREATED AT      |   SIZE   |
+--------------------------------------+---------+----------------------+----------+
| 0b10bc93-5ae7-40ef-ba40-e5110ad2d467 | CREATED | 2021-07-15T16:01:53Z | 139.3 kB |
+--------------------------------------+---------+----------------------+----------+
```
```shell
setops -p <PROJECT> -s <STAGE> --service database backup:destroy 0b10bc93-5ae7-40ef-ba40-e5110ad2d467
```
```
ID:           0b10bc93-5ae7-40ef-ba40-e5110ad2d467
Status:       CREATED
Created At:   2021-04-02T10:21:00Z
Size:         150.8 kB
```

## Reference

### Backup Formats

| Service Type | Backup Format | Notes |
|--------------|---------------|-------|
| `postgresql11` | PostgreSQL Custom | Archive with format `custom` created by `pg_dump`. See [PostgreSQL docs](https://www.postgresql.org/docs/11/app-pgdump.html). |
| `postgresql13` | PostgreSQL Custom | Archive with format `custom` created by `pg_dump`. See [PostgreSQL docs](https://www.postgresql.org/docs/13/app-pgdump.html). |
| `s3` | .tar.gz Archive | Gzipped TAR archive with S3 bucket contents at the root level. Create the archive with `tar czf`.|
| `redis6` | RDB (Redis Database) | See [Redis docs](https://redis.io/topics/persistence). |
| `volume` | .tar.gz Archive | Gzipped TAR archive with volume contents at the root level. |
| `mongodb` | MongoDB .gz Archive | MongoDB archive created by `mongodump --gzip`. See [mongodump](https://docs.mongodb.com/v4.0/reference/program/mongodump/). |
| `elasticsearch7` | - | Not implemented yet |
