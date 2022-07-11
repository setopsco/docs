---
weight: 20
---
# Migrate Environment Variables

## Formatting Existing Environment Variables {id=formatting}

You can use the search + replace feature of your editor of choice to format your existing Environment Variables.
We recommend using regexp search+replace with the following typical patterns.

{{< hint warning >}}
Your Environment Variable Variable must be formatted in the following way: `ENVKEY=ENVVALUE`
{{< /hint >}}

| Environment Variable Pattern | Regex Search | Replace |
|-|-|-|
|`ENVKEY:   ENVVALUE`|`(:)+[ ]+`|`=`|
|`ENVKEY= ENVVALUE`|`(=)+[ ]+`|`=`|

{{< hint warning >}}
You need to escape all values with `""` to avoid bash commands. You need to escape `!` in values explicitly with `\!` due to the [bash bang command](https://ss64.com/bash/bang.html) analogy.
{{< /hint >}}
## Prepare Existing Environment Variables

{{< hint info >}}
💡**Feature in Development**
Due to the beta status of SetOps, we currently do not support multiple Environment Variables per command, so only one Environment Variable per command is allowed.
{{< /hint >}}

To speed up the migration, you can use multiline copy+pasting into the terminal. To prepare your commands, you can do the following:
We came up with a best practice to migrate ENVs:

1. Copy your existing Environment Variables
1. Paste them in your editor of choice
1. Format them in the way described above
1. Add following line with multiline cursor `setops -p <PROJECT> -s <STAGE> --app <APPNAME> env:set`
1. Paste all commands in your terminal
1. Commit the [changeset]({{< relref "changesets" >}}): `setops -p <PROJECT> -s <STAGE> changeset:commit`
1. Check Environment Variables in your App: `setops -p <PROJECT> -s <STAGE> --app <APPNAME> env`

## Going further
Read more about Environment Variables and how to set them in the [Environment Variables Section]({{< relref "/latest/user/configuration/apps/environment" >}}).
