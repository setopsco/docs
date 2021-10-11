---
weight: 10
bookToC: false
description: "Downloading a single binary is all it takes to get started. With the SetOps CLI, you can
configure your app environment, deploy, and monitor your app."
---
# Installation

Downloading a single binary is all it takes to get started. With the SetOps command-line interface (CLI), you can
configure your app environment, deploy, and monitor your app.

## Downloading the CLI

{{< tabs "cli" >}}
{{< tab "MacOS Homebrew (recommended)" >}}
1. Install the `setops-cli` package:

   ```shell
   brew install setopsco/manager/setops-cli
   ```

1. Run `setops`. You're ready to go!
{{< /tab>}}
{{< tab "MacOS" >}}
1. Go to the [Releases page on GitHub](https://github.com/setopsco/releases/releases).

1. The most recent release is on the top. Under *Assets*, download the CLI at `setops-cli_vX.Y.Z_darwin_amd64.bz2`.

1. Uncompress the downloaded binary: `bunzip2 setops-cli_vX.Y.Z_darwin_amd64.bz2`

1. Mark it as executable: `chmod +x setops-cli_vX.Y.Z_darwin_amd64`

1. Move the binary to some folder in your `$PATH`, e.g.:

   ```shell
   mv setops-cli_vX.Y.Z_darwin_amd64 /usr/local/bin/setops
   ```

1. Run `setops`.

   In case macOS warns you about an unsigned binary, click _Cancel_. Open System Preferences, go to _Security & Privacy_,
   and select the _General_ tab. There will be a button to allow running `setops` at the bottom of the preference pane.

   You're ready to go!

1. (Optional) Install Shell Completions:

   Run `setops completion` and follow the instructions.
{{< /tab>}}
{{< tab "Linux" >}}
1. Go to the [Releases page on GitHub](https://github.com/setopsco/releases/releases).

1. The most recent release is on the top. Under *Assets*, download the CLI at `setops-cli_vX.Y.Z_linux_amd64.bz2`.

1. Uncompress the downloaded binary: `bunzip2 setops-cli_vX.Y.Z_linux_amd64.bz2`

1. Mark it as executable: `chmod +x setops-cli_vX.Y.Z_linux_amd64`

1. Move the binary to some folder in your `$PATH`, e.g.:

   ```shell
   mv setops-cli_vX.Y.Z_darwin_amd64 /usr/local/bin/setops
   ```

1. Run `setops`.

   You're ready to go!

1. (Optional) Install Shell Completions:

   Run `setops completion` and follow the instructions.
{{< /tab>}}
{{< /tabs >}}

## Sign up

If you've been invited to SetOps by another user use the activation code from
the invitation email to sign up:

```
$ setops signup
Enter client name: mycompany
Enter username: your.name@example.com
Enter activation code: <enter activation code>
Enter a new password: <enter password>
Enter the new password again: <enter password>
✅ account activation successful
✅ logged in as "your.name@example.com"
```

If you've just created a new SetOps account you will receive an email with your client
name and an initial username and password. You can use those credentials to log
into SetOps as described below.

## Log In

To log into your account, run `setops login`:

```
$ setops login
Enter client name: mycompany
Enter username: your.name@example.com
Enter password: <enter password>
✅ logged in as "your.name@example.com"
```

You are now ready to use the SetOps CLI.

## Going further

[Read more about the concepts]({{< relref "concepts" >}}) which power SetOps.
