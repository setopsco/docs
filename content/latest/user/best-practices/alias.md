---
weight: 10
HideCommandReplacement: true
---
# Alias

{{< hint info >}}
💡**Feature in Development**
Due to the beta status of SetOps, the `--project` and `--stage` flag needs to be set for every command.

In the future, you will be able to set a default `project` and `stage` for a directory.
{{< /hint >}}

## Set alias with default for directory

You can use [direnv](https://direnv.net/) as a shell extension to load and unload environment variables depending on the current directory. With this tool, you can set your `project` and `stage` for a directory.

1.  Install [direnv](https://direnv.net/)

1.  Create a `.envrc` file in your project directory

1.  Add following
    ```shell
    export SETOPS_PROJECT=<PROJECT>
    export SETOPS_STAGE=<STAGE>
    ```

1.  Create an alias for your shell, e.g.:
    - `alias sos='setops -p $SETOPS_PROJECT -s $SETOPS_STAGE'`

## Example

Your `.envrc` should look like this:

```env
# /myproject/.envrc
export SETOPS_PROJECT=myproject
export SETOPS_STAGE=staging
```

Then you can execute the following commands:

```shell
sos app      # executes 'setops --project <PROJECT> --stage <STAGE> app'
```
