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

1. Create a `bin` directory in your home directory, in which we will late place a Docker credentials helper to authenticate against the SetOps registry: `mkdir -p "$HOME/bin`

1. Add the `bin` directory to your `PATH` env variable permanently. It depends on the shell you are using how to do this, but for the most use shell `bash` you can execute the following command: `echo 'export "PATH=$HOME/bin:$PATH"' >> "$HOME/.bashrc" `

1. Run `setops`.

   You're ready to go!

1. (Optional) Install Shell Completions:

   Run `setops completion` and follow the instructions.
{{< /tab>}}
{{< /tabs >}}

## Sign up

There are two ways you can sign up with SetOps:

1. If you've been invited to SetOps by another user, follow the instruction mentioned in the invite email to set a password for your account. You then have access to the resources you have been invited to.

1. If you (and your organization) is new to SetOps you can [sign up here](https://app.setops.co). Afterward you will have access to a demo Organization which you can use to get to know SetOps. When you are ready, you can create your own Organization with your own AWS account.

## Log In

To log into your account, run:

```
$ setops login
```

This command will request a short living access token and a refresh token for your local CLI and store it in `~/.setops.yml` alongside the provided org.

Also Docker will be configured to being able to authenticate and push to the SetOps registry. It therefore uses a mechanism called credentials helper. This helper is an executable file which provides Docker with a valid access token to use for authentication. During login the SetOps CLI places a script `docker-credential-setops` into the first of these paths which is writable:

* ~/bin
* /usr/local/bin
* /usr/bin
* /bin

In case this fails, you can put a file anywhere in one of your configured paths in the `PATH` env variable with the following content:

```
#!/bin/bash

setops docker $@
```

You are now ready to use the SetOps CLI.

{{< hint warning >}}
When running the `setops login` command in a non-interactive environment, like a CI job, the interactive login will not work. In this case, you can call `setops login --service-user` and pass in the username and password. However this is discouraged and should only be used if it is really required since username and password are directly passed into the CLI. For better security, only an access token is stored in `~/.setops.yml` which means that you need to login again after the access token expired.
{{< /hint >}}

## Switch Organizations

After successful login, your session is linked to the Organization you logged into. If you are a member of multiple Organizations and want to switch between them you can do so by logging out via `setops logout`. Then you can login to other Organization using `setops login`.

## Going further

[Read more about the concepts]({{< relref "/latest/user/concepts" >}}) which power SetOps.
