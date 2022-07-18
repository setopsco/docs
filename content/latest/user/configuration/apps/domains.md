---
weight: 60
---
## Domains

You can see the Domains an App can be reached on with `domain`.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
```

### Private Domain

An App always has a private domain at `app.stage.project.$YOURDOMAIN.internal` (e.g. _web.staging.parkscheibe.setopsapps.internal_), only resolvable within the SetOps stage. The purpose of this domain is that Apps can reach each other without the need to be exposed to the internet.

### Public Default Domain

An App is also available via a public default domain at `app.stage.project.$YOURDOMAIN` (e.g. _web.staging.parkscheibe.setopsapps.net_), when the App is not [set to private](#private).

### Public Custom Domains

In addition to the default domain for your App, you can configure any number of public **Custom Domains** where the App should be reachable at. TLS certificates will be automatically maintained for your Custom Domains. Once you have set up the DNS records for the Custom Domain and it is validated, there is no maintenance needed from your side to monitor and renew TLS certificates.

See the list of Custom Domains with `domain`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
```
```
3 Domain(s) configured.


Domain setops.co
   Primary:     true
   Validated:   false

   ⏳ This domain has not yet been validated.
   After setting the validation records below, wait until they are visible on the DNS server.
   Then validate the domains via app:domain:validate command.
   The app will not be served at this domain until it is validated successfully.

   Custom Domain Record(s):
      Name:                 setops.co
      Type:                 CNAME
      Value:                web.production.project1.$YOURDOMAIN
      Alternative Type:     A
      Alternative Values:   1.2.3.4,4.3.2.1

   Validation Record(s):
      Name:    _bf54355ea06621c5c64f2c39af899101.setops.co.
      Type:    CNAME
      Value:   _5a892a6631c5d51bc87519faa60b8624.duyqrilejt.acm-validations.aws.


Domain web.production.project1.$YOURDOMAIN
   Primary:     false
   Validated:   true

   The default domain for this app.
   This domain cannot be deleted.


Domain web.production.project1.$YOURDOMAIN.internal
   Primary:     false
   Validated:   true

   The private domain for this app.
   This domain is only available from Apps and One-Off Tasks of this Stage.
```

The Custom Domain Records and Validation Records instruct you how to configure the DNS for the Custom Domain.

For a Custom Domain Record, there is a default record type and an optional alternative record type:

* The **default record type** should be used whenever possible. It is a `CNAME` (alias) record that points to a SetOps domain and provides the best interoperability and reliability.

* The **alternative record type** may be used when the default record is not applicable. This may happen with a domain APEX (e.g. `setops.co`), but should not happen with subdomains (e.g. `api.setops.co`). It is property of the DNS that `CNAME` records [can not be used for a domain APEX](https://www.isc.org/blogs/cname-at-the-apex-of-a-zone/). While some popular DNS providers have built features to work around this issue, some do not and this is when the alternative record must be used. `CNAME` records for APEX domains are sometimes called `ANAME` or `ALIAS` records. Refer to your DNS provider's documentation to learn more if and how they support this.

In order to create a Custom Domain, run `domain:create DOMAIN [--primary]`:

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain:create setops.co --primary
```
```
+-----------+---------+-----------+
|  ADDRESS  | PRIMARY | VALIDATED |
+-----------+---------+-----------+
| setops.co | true    | false     |
+-----------+---------+-----------+
```

Custom Domains can be deleted by running `domain:destroy DOMAIN`.
```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain:destroy setops.co
```

#### Primary Domain

An App can have any number of custom domains but only one **Primary Domain**. The Primary Domain is where your app will be served. Any other domain (custom domains or the default domain) will redirect to your Primary Domain.

{{< hint info >}}
Do not forget to add the `--primary` flag to `domain:create` as this value can not be changed later.

If you want to set an existing domain as the primary domain, remove it with `domain:destroy` and re-add it with `domain:create --primary` in the **same changeset** to avoid having to re-validate it.
{{< /hint >}}

#### Domain Validation

Custom Domains have to be **validated** to be used. With SetOps, all HTTP traffic is TLS-encrypted by default. The validation checks if the *Validation Record(s)* are present on the given Custom Domain for being able to issue TLS certificates for that domain.

The *Custom Domain Record(s)* does not have to be set at this moment. Setting it later enables zero downtime migrations to SetOps since the domain itself was already validated beforehand.

You can view the necessary configuration by running `domain` for the corresponding app.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain
```
```
3 Domain(s) configured.


Domain setops.co
   Primary:     true
   Validated:   false

   ⏳ This domain has not yet been validated.
   After setting the validation records below, wait until they are visible on the DNS server.
   Then validate the domains via app:domain:validate command.
   The app will not be served at this domain until it is validated successfully.

   Custom Domain Record(s):
      Name:                 setops.co
      Type:                 CNAME
      Value:                web.production.project1.$YOURDOMAIN
      Alternative Type:     A
      Alternative Values:   1.2.3.4,4.3.2.1

   Validation Record(s):
      Name:    _bf54355ea06621c5c64f2c39af899101.setops.co.
      Type:    CNAME
      Value:   _5a892a6631c5d51bc87519faa60b8624.duyqrilejt.acm-validations.aws.

Domain web.production.project1.$YOURDOMAIN
   Primary:     false
   Validated:   true

   The default domain for this app.
   This domain cannot be deleted.


Domain web.production.project1.$YOURDOMAIN.internal
   Primary:     false
   Validated:   true

   The private domain for this app.
   This domain is only available from Apps and One-Off Tasks of this Stage.
```

After you have added the DNS records, validate your Custom Domain. Wait an appropriate time after setting the DNS records for the DNS servers to refresh.

```shell
setops -p <PROJECT> -s <STAGE> --app <APPNAME> domain:validate setops.co
setops -p <PROJECT> -s <STAGE> changeset:commit
```

{{< hint warning >}}
Please note that **it may take several minutes to hours** until changes you made to your DNS records become visible for SetOps. In case the validation fails although you made the required changes try again after some time.

You can verify that the DNS records are set correctly with the [`dig` utility](https://en.wikipedia.org/wiki/Dig_(command)) on your local computer:

```shell
dig _bf54355ea06621c5c64f2c39af899101.setops.co. @1.1.1.1 +short
```

The command output should show the record you set earlier:

```
_5a892a6631c5d51bc87519faa60b8624.duyqrilejt.acm-validations.aws.
```

If `dig` does not print the expected value, double check your DNS settings and try again later, as DNS changes may take some time to propagate through the system.
{{< /hint >}}

## Going further

[Create a service]({{< relref "/latest/user/configuration/services" >}}) for your new App.