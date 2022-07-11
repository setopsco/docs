---
weight: 20
---
# Changesets

{{< hint info >}}
💡 You can replace the default values of the commands for `PROJECT`, `STAGE` and `APPNAME` in the form on the right side! A standard pattern might be `myproject`, `production` and `web` (see [concepts]({{< relref "/latest/user/concepts" >}})).
{{< /hint >}}

You will use a **Changeset** for making any changes to a stage. You will always add a set of commands to your Changeset and commit it to make your change live (or you discard the changeset). Changesets work just like the Git staging area in your local repository: you add some files, then you commit.


## List Changeset
Have a look at the output of `changeset:info`:

```shell
setops -p <PROJECT> -s <STAGE> changeset:info
```
```
Created At:   2020-07-20T11:09:41Z

+------------+---------------+
|    NAME    |   ARGUMENTS   |
+------------+---------------+
| app:create | map[name:web] |
+------------+---------------+
```

You can see that your Changeset includes one command and that is creating the app `web`.

## Commit Changeset
To apply this change, run `changeset:commit`:

```shell
setops -p <PROJECT> -s <STAGE> changeset:commit
```
```
Created At:   2020-07-20T11:09:41Z

+------------+---------------+
|    NAME    |   ARGUMENTS   |
+------------+---------------+
| app:create | map[name:web] |
+------------+---------------+

◢ Initializing…
[...]
◤ Planning…
[...]
◣ Applying… (17/28)
[...]
Commit successful!
```

Now this change has been committed and your app `web` is visible:

```shell
setops -p <PROJECT> -s <STAGE> app
```

```
+------+
| NAME |
+------+
| web  |
+------+
```

## Discard Changeset

You could also run `changeset:discard` to remove all commands from the Changeset and start fresh.
```shell
setops -p <PROJECT> -s <STAGE> changeset:discard
```

## Going further

[Create your first App]({{< relref "/latest/user/configuration/apps/overview" >}}) with a Changeset.
