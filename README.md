<p align="center">
  <a href="https://www.setops.co">
    <img src="static/setops_meta.png" width="500px" alt="SetOps" />
  </a>
</p>

# User & Developer Documentation
The user documentation is built with [hugo](https://github.com/gohugoio/hugo) and [spectacle](https://github.com/sourcey/spectacle).

## Guidelines

### Grammar Check
Not for everyone but for some it might be a good way to check the grammar of written docs with [Grammarly](https://www.grammarly.com/).

### Code Formatting

To format code, use markdown's [Fenced Code Blocks](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks). Additional to the standard code style we can use language-specific highlighting. When you add a language, a `copy+paste` button is added to the `code block`. Always use `shell` as language for CLI commands. **Do not use `$` to indicate shell input!**

```
 ```shell
```

💡**Please divide input (to copy) and output (from the CLI) into 2 blocks.**

Example:
```shell
setops --stage <STAGE> app list
```
```
+------+
| NAME |
+------+
+------+
```

### Feature under development
If a feature is under development and we describe a workaround for this circumstance, add a note to this section briefly indicating the future state:

```
{{< hint info >}}
💡**Feature in Development**
Due to the beta status of SetOps, the `--stage` flag with `<STAGE>` needs to be set for every command.

In the future, you will be able to set a default `project` and `stage` for a directory.
{{< /hint >}}
```

### Best Practices
If we came up with a good way to deal with external constraints (e.g. building an image, alias, migrate ENV), we would like to share this knowledge as Best Practices. As a user, I want to get a friendly hint to our [Best Practices](content/latest/user/best-practices) with the hint, that this only one possible way to deal with it.

If you think, that a solution should not be part of the docs, think about a best practice page.

### Bugs and Troubleshoot
When there is a bug or something that is not acting expectedly, add it to the [troubleshooting](content/latest/user/support/troubleshooting.md). Add a hint to the corresponding page (eg. [logs](content/latest/user/interaction/logs.md) -> solarized dark issue) which links to the troubleshooting.


## Custom JavaScript & CSS
You can use custom JavaScript (vanilla so far) and CSS.

- create a new js file under `static/js/`
- create a new css file under `static/css/`
- add the stylesheet or script to `layouts/partials/docs/inject/head.html`

## Menu

The Menu is rendered through the folder-structure of `content/user`. If you want to add any page which should be included in the menu, add it under `content/user`. You can create a nested menu-structure through nesting of folders. Create a `_index.md` and add the `bookCollapseSection` to it.

You can add following options to the beginning of a new page:

```
---
bookCollapseSection: true       # makes entry collapsable
bookToC: false                  # Hides right sided Table of Contents
title: "One-Off Task"           # (optional) Title of menu entry
weight: 70                      # Order of contents
HideCommandReplacement: true    # Hides command replacement form on the right side
bookHidden: true                # Hides element in menu, still available via URL
---
```

### filetree menu
the file `layouts/partials/docs/menu-filetree.html` is a copy of the build-in hugo-book file tree menu. We need to copy the file to implement the collapsables in the menu. The original code from the template can be found here: [alex-shpak/hugo-book](https://github.com/alex-shpak/hugo-book/blob/62004506e2fa0980777de5b1de045d5101d01f6c/layouts/partials/docs/menu-filetree.html).


## Development
Install [hugo](https://github.com/gohugoio/hugo)
  - via Homebrew (recommended) `brew install hugo`
  - Manual installation
    - Download the *extended* version (`hugo_extended_X.Y.Z_OS-ARCH.tar.gz`) because the template needs to compile SASS/SCSS.
    - If you install hugo from the sources, make sure to compile it with the right flags:

      ```bash
      cd <hugo-git-repository-clone>
      go install --tags=extended
      ```

Install the `hugo-book` theme:
```bash
git submodule init
git submodule update
```

### Generate the documentation pages:
  - Development server: `hugo serve -D` (the `-D` flag makes Hugo serve draft pages with are excluded from production builds)
  - Build a static site: `hugo --destination public`
