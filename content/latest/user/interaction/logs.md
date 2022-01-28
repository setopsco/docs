---
weight: 30
---
# Logs

For one reason or another, it will be required to read the logs of an App from time to time. This section covers the command required to filter and display the output of your Apps.

{{< hint info >}}
An App must exist and be deployed before you can expect any logs to show up.
{{< /hint >}}

To display log entries for your App, run `log`.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log
```
```
2020-10-05 17:42:54 [app] Testlog
2020-10-05 17:42:54 [app] Testlog
2020-10-05 17:42:54 [app] Testlog
[...]
2020-10-05 17:42:54 [app] Testlog
```

{{< hint warning >}}
If you can't see some logs, check out our troubleshooting regarding the _Solarized Dark Theme_ [here]({{< relref "/latest/user/support/troubleshooting#why-do-i-not-see-some-logs" >}}).
{{< /hint >}}

The output of this command can be configured to your specific needs by adding additional flags.

To hide the source of the log entry e.g. `[app]` or `[health-check]` you can use the flag `--no-source`.

The `--limit INT` or short `-n INT` limits the output to a specific number of log entries. Valid values for `n` are `0 < n < 10000` und it defaults to `250`.

With `--follow` or `-f`, SetOps continuously displays new log entries as they are created by the App.

Both flags can be combined in order to display the `n` latest log entries and then continue to show new log entries.

If only `-f` is used, `n` will default to `250`.

```shell
# -n prints only the last n entries (defaults to 250)
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log -n 2
```
```
2020-10-05 17:42:54 [app] Testlog
2020-10-05 17:42:54 [app] Testlog
```
`-f` continously prints new log entries as their are created by your app:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log -f
```

In addition to the number of printed entries, you can also configure the time period of log entries you are interested in. Use `--before 2020-09-11T12:00:00Z` and `--after 2020-09-11T12:00:00Z` to limit the range.

```shell
# --before prints log entries that occured before the given timestamp
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log --before 2020-09-11T12:00:00Z
```
```
2020-09-11 11:35:54 [app] Testlog
[...]
2020-09-11 11:58:44 [app] Testlog
2020-09-11 11:59:37 [app] Testlog
```
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> log --after 2020-09-11T12:00:00Z
```
The values of `--before` and `--after` can be specified in the following formats.
```
2006-01-02T15:04:05Z07:00  # with Z07:00 as specific timezone
2006-01-02T15:04:05Z
2006-01-02T15:04:05
2006-01-02T15:04
2006-01-02T15
2006-01-02
2006-01
2006
```
You can filter the logs by the task ID if you provide `--task ID`. Use `app:ps <APPNAME>` to get the ID
of currently running tasks.

```shell
setops -p <PROJECT> -s <STAGE> app:ps <APPNAME>
```
```
Status

   ACTIVE 1 / 1 running tasks (0 pending)

Tasks

   ID                                 Release   Last Status   Health Status   Started At             Stopped At
   dd22a5ae988947d4ae2a66a9f21d7808   3         RUNNING       HEALTHY         2020-11-30T13:00:39Z   -
```
```shell
setops --stage <STAGE> app log show <APPNAME> --task dd22a5ae988947d4ae2a66a9f21d7808
```
```
2020-12-03 13:36:32 ::ffff:10.0.40.3 - - [03/Dec/2020:12:36:32 +0000] "GET /.well-known/health-check HTTP/1.1" 200 2 "-" "ELB-HealthChecker/2.0"
[...]
Closing connection... Done
```

SetOps will not print successful container Health Checks by default to prevent your Logs from becoming unnecessarily noisy. If you prefer to see these entries as well, you can force SetOps to print them with the flag `--all-health-checks`.
