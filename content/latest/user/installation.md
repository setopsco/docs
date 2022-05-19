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

1. Add the `bin` directory to your `PATH` env variable permanently. It depends on the shell you are using how to do this, but for `bash` you can execute `echo 'export "PATH=$HOME/bin:$PATH"' >> "$HOME/.bashrc"`, for `zsh` run `echo 'export "PATH=$HOME/bin:$PATH"' >> "$HOME/.zshrc"`. If you use a different shell please consult its documentation on how to modify environment variables globally.

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
SetOps will open a browser window where you can provide your credentials. If a browser window cannot be opened SetOps will print the link to your terminal, so you can copy it to a browser window. After successful authorization, SetOps will obtain a short living access token and a refresh token for your local CLI and store it in `~/.setops.yml` alongside the provided org.

It will also attempt to configure your docker installation to be able to authenticate and push to the SetOps registry. It places a helper script `docker-credential-setops` in your PATH and registers it in your Docker configuration at `~/.docker/config.json`. You can skip the setup by using the `--no-setup` flag with the `login` command. If the automatic setup fails, you can perform a [Manual Setup]({{< relref "#manual-setup" >}}).

You are now ready to use the SetOps CLI.

{{< hint warning >}}
When running the `setops login` command in a **non-interactive environment**, like a CI job, the interactive login via browser will not work. In this case, you can call `setops login --service-user` and pass in a username and password. However, this should only be used if it is really required since username and password are directly passed into the CLI. For better security, only an access token is stored in `~/.setops.yml` which means that you need to **login again after 4 hours** when the access token expires. Login via `--service-user` flag does not support social providers such as GitHub or Google. We recommend to create a dedicated service user account that is used exclusively in these scenarios.
{{< /hint >}}

## Switch Organizations

If you are a member of multiple organization, you can switch between them with `setops organization:switch <ORGANIZATION>` after successful login.

## Logout
If you want to logout from SetOps, you can do so by running `setops logout`. This will deauthorize the current session in your terminal. Please note, that your browser will stay logged in, so if you want to login again you will not have to provide your credentials. To also logout from the browser (e.g. to switch accounts) use `cli logout --browser`.

## Manual Setup {id=manual-setup}
In order to be able to authenticate with the SetOps registry and push images Docker needs to be configured. SetOps uses a credential-helper which is a small script that handles the authentication for Docker. The script has to be placed in your PATH and registered in you Docker configuration. These steps should be performed automatically during login. If the automatic setup fails, you can place and register the Docker credential-helper manually:
1. Make sure Docker is installed by by running `docker --version` from your terminal
2. Create a file named `docker-credential-setops` in a directory that is in your `PATH`
3. Copy the following script to the file and save it
   ```bash
   #!/bin/bash
   
   setops docker $@
   ```
   The script forwards Docker's request for credentials to the SetOps CLI.brew info 
3. Make the file executable e.g. by running `chmod a+x /path/to/file/docker-credential-setops`
4. Test the script by running `docker-credential-setops get` from you terminal 
5. Open `~/.docker/config.json`
6. Add the following key to the configuration and save the file
    ```json
   "credHelpers": {
       "api.setops.co": "setops"
   }
   ```
You are now ready to use SetOps with Docker.

## Going further

[Read more about the concepts]({{< relref "/latest/user/concepts" >}}) which power SetOps.
