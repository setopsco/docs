---
weight: 50
title: Notifications
---
# Notifications

Application monitoring and alerting is an important but often forgotten part of the operations tasks. Developers without experience in that area often do not know where to start. Therefore SetOps comes with pre-configured monitoring and alerting, which we highly recommend to enable for Apps in production environment.

## Available Notifications and mitigation

SetOps currently notifies about the following issues with your application:

| Affected entity | Name | Description | Mitigation |
|------|-----------------|-------------|------------|
| App | Replicas Not Scaled | The App and the corresponding containers could not be started and scaled as configured with *Scale* in the last 10 minutes. | Most likely the containers cannot be started because of an error within the application itself. Check the logs to find the these kind of errors. If there are no errors in the logs, there can be two issues: failing health checks or not enough configured memory. First ensure that the health checks indeed work as configured and then try to increase the memory for your App. |
| App | Frequent Container Restarts | Frequent container restarts (> 10) occurred in the last 15 minutes. | Most likely your App crashed due to some error. Have a look at the logs to look for possible errors. If there are no errors, the container might have been killed due to not enough memory (Out-of-memory or OOM). Increase the amount of configured memory and check if this alarm resolves. |
| App | Constant CPU usage higher than configured | On average the app used more CPU units within the last hour than configured under [Resources]({{< relref "/latest/user/configuration/apps/resources#cpu" >}}). This means that you might see inconsistent performance of your application since it can only use additional CPU when there is unused CPU available. | You might want to configure additional reserved CPU units to ensure there is always enough CPU available. |
| App | Memory usage critical | The app (almost) used all of the available memory within the last 15 minutes. The App might get terminated if it requests more memory than available. | You might want to configure additional [Memory]({{< relref "/latest/user/configuration/apps/resources#memory" >}}). |
| App | Health Check Failed | The health check for your App via the primary domain failed. | Check the App logs and optionally other Notifications for errors. |
| Domain | Certificate expires soon | SetOps wasn't able to renew the HTTPS/TLS certificate of the given custom domain in time. | Check the DNS records of your custom domain and ensure that the values are set correctly. You can get required records with the [Domain command]({{< relref "/latest/user/configuration/apps/domains" >}}) |
| Domain | App certificate expires soon | SetOps wasn't able to renew the HTTPS/TLS certificate of the default app domain in time. | This should usually never happen. If it does, please contact the SetOps support. |
| HTTPS Load Balancer | Many 5XX Http Error Codes | Your App returned more than 10% HTTP 5xx errors within 1 minute. | Check the App logs for more information. |
| Scheduled Task (upcoming feature) | Scheduled Task failed | A scheduled task for your App has failed. | Check the logs for more information. |
| Service: DocumentDB | CPU Credit Balance Failing | The [CPU Credit Balance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances-how-to.html) is below 30. This indicates a performance issue. | You can resolve the problem if you choose a bigger plan. |
| Service: DocumentDB | LowMemThrottleMaxQueueDepth Failing | The maximum queue depth for requests that are throttled due to low available memory in a one-minute period is greater than 5. This indicates a performance issue. | You can resolve the problem if you choose a bigger plan. |
| Service: DocumentDB | LowMemNumOperationsThrottled Failing | The number of requests that are throttled due to low available memory in a one-minute period is greater than 5. This indicates a performance issue. | You can resolve the problem if you choose a bigger plan. |
| Service: PostgreSQL | CPU Failing | CPU Utilization is at or above 90% |  You can resolve the problem if you choose a bigger plan or optimize queries. |
| Service: PostgreSQL | Disk Queue Depth Failingg | The number of outstanding I/Os (read/write requests) waiting to access the disk is at or above 10. | You can reduce the load on the DB or increase the storage size to get more I/O credits. |
| Service: PostgreSQL | Free Storage Space Failing | Free Storage Space is below 1GB. Increase the storage to ensure the DB's availability and ideally enable [disk auto scaling]({{< relref "/latest/user/configuration/services/#postgresql-storage" >}}). |
| Service: PostgreSQL | CPU Credit Balance Failing | The [CPU Credit Balance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances-how-to.html) was below 5. | You can reduce the load on the DB or choose a higher plan. |
| Service: Volume | Volume throughput throttled | The volume was throttled since the recent throughput exceeded the limit. | Throughput increases with file size, so either provision bigger files, change the access pattern of the volume or contact the SetOps support to request *Provisioned Throughput*. |

## Notification Targets

To be notified in case of important events occurring in your Apps, you can configure a **Notification Target**. Notification Targets are defined on the level of **Stage** and are valid for every App on the Stage.

### Configuration

The Notification Target configuration consists of a `type` and a `target`. The Type specifies the integration to use and the Target represents the recipient called in case of an alert. See below for a list of types supported.

| Type | Target | Description |
|------|--------|-------------|
| [`email`]({{< relref "#email" >}}) | email address | Notifications are send via an email to the provided address. |
| [`webhook`]({{< relref "#webhook" >}}) | URL | Integration with external alerting systems. URL receives a `POST` request for each alert. |

We plan to support additional target types (such as `lambda`) in the future.

#### List Notifications

You can list all Notifications that are present on a Stage by running `notification`.

```shell
setops -p <PROJECT> -s <STAGE> notification
```
```
+-------------------------+
|          NAME           |
+-------------------------+
| my_opsgenie_integration |
+-------------------------+
```
#### Create a Notification
Notifications can be created with `notification:create ALERTNAME --type TYPE --target TARGET`. The `ALERTNAME` specifies an ID that allows you to identify this specific Alert Target later.

```shell
setops -p <PROJECT> -s <STAGE> notification:create my_opsgenie_integration --type webhook --target https://api.eu.opsgenie.com/v1/json/cloudwatch?apiKey=KEY
```
```
Name:     my_opsgenie_integration
Type:     webhook
Target:   https://api.eu.opsgenie.com/v1/json/cloudwatch?apiKey=KEY
```

The command displayed above configures the Stage `<STAGE>` with an exemplary webhook that triggers the API of Atlassian's [Opsgenie](https://www.atlassian.com/software/opsgenie). This example is not for demonstration purposes only, make sure you configure your stage with the correct credentials for your provider.

{{< hint warning >}}
Like when working with Apps, the management of Notifications creates Changesets. These changesets have to be committed in order for the changes to take effect.
{{</ hint >}}

#### Delete a Notification

Remove existing Notifications by running `notification:destroy ALERTNAME`. The command creates a command that will delete the specified Notification on the next commit. In order to remove the `my_opsgenie_integration` Notification created in the example, you would run the following command.

```shell
setops --stage <STAGE> notification:destroy my_opsgenie_integration
```

### Email Targets {id=email}

Email targets provide a very simple way to set up notifications. After configuring an email address as a notification target, a validation email is sent to the address to subscribe to the notifications. You will only receive notifications after opening the email's confirmation link.

To create the example `my_email_notifications` Notification, you would run the following command:

```shell
setops -p <PROJECT> -s <STAGE> notification:create my_email_notifications --type email --target <EMAIL ADDRESS>
setops -p <PROJECT> -s <STAGE> changeset:commit
```

### Webhook Targets {id=webhook}

Webhook Targets may be used to send alerts from SetOps to external systems, such as [OpsGenie](https://www.atlassian.com/software/opsgenie) or your own integration.

#### Using with OpsGenie

1. In your OpsGenie account, go to *Settings* → *Integration list* and search for *AWS CloudWatch*. Click *Add*.

1. Set the properties such as *Name*, *Assigned Team* and *Responders* and click on *Save Integration*.

1. Copy the URL at *Add an HTTPS subscription to your topic*. This is your alert target URL.

1. Add the Alert Target to your Stage and commit the Changeset.

  ```shell
  setops -p <PROJECT> -s <STAGE> notification:create my_opsgenie_integration --type webhook --target THE_URL
  setops -p <PROJECT> -s <STAGE> changeset:commit
  ```

  You may re-use one OpsGenie integration for Alert Targets on multiple Stages if you wish.

#### Implementing your own Handler

The source code below is an example HTTP request handler for NodeJS. The implementation follows the AWS Simple Notification Service (SNS) API. You could use this handler to build a web service with Express or deploy it to a Function as a Service (FaaS) such as AWS Lambda.

It serves two purposes:

* acknowledge the subscription (*SubscriptionConfirmation*), which is required for the stage commit to succeed
* receive alerts (*Notification*)

You can use this code to base your custom logic upon. For example, you could extend the `handleNotification` function to send an email or a push notification.

{{< tabs "notification-handler" >}}
{{< tab "JavaScript" >}}
```js
const fetch = require('node-fetch')

exports.handler = async (req, res) => {
  if(req.method !== 'POST') {
    res.status(405).send('method not allowed')
    return
  }
  const type = req.header('x-amz-sns-message-type')
  if(!type) {
    res.status(400).send('bad header')
    return
  }
  if(type === 'SubscriptionConfirmation') {
    await handleSubscriptionConfirmation(req, res)
  } else if(type === 'Notification') {
    handleNotification(req, res)
  }
}

function handleSubscriptionConfirmation(req, res) {
  return fetch(
    req.body.SubscribeURL,
    { method: 'POST' }
  )
}

function handleNotification(req, res) {
  console.log(req.body)
  res.status(200).send('ok')
}
```
{{< /tab>}}
{{< tab "Golang" >}}
```golang
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const port = "8000"

func main() {

	http.HandleFunc("/", handleReq)

	fmt.Printf("Listening on port %s\n", port)
	http.ListenAndServe(":"+port, nil)
}

func handleReq(w http.ResponseWriter, req *http.Request) {
  if req.Method != http.MethodPost {
    w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("method not allowed"))
		return
	}

	kind := req.Header.Get("x-amz-sns-message-type")
	if kind == "" {
    w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad Header"))
		return
	}

  var err error
	if kind == "SubscriptionConfirmation" {
		err = handleSubscriptionConfirmation(w, req)
	} else if kind == "Notification" {
		err = handleNotification(w, req)
	}
	if err != nil {
		fmt.Printf("Failed to handle request: %v", err)
	}
}

func handleSubscriptionConfirmation(w http.ResponseWriter, req *http.Request) error {
	body, err := io.ReadAll(req.Body)
	if err != nil {
		return fmt.Errorf("failed to read the body: %w", err)
	}

	var bodyConv map[string]interface{}
	err = json.Unmarshal(body, &bodyConv)
	if err != nil {
		return fmt.Errorf("failed to unmarshal body: %w", err)
	}

	w.WriteHeader(http.StatusOK)
	_, err = http.Post(string(bodyConv["SubscribeURL"].(string)), "plain/text", nil)
	if err != nil {
		return fmt.Errorf("failed to post back answer: %w", err)
	}
	fmt.Println("Subscribed to notifications")
	return nil
}

func handleNotification(w http.ResponseWriter, req *http.Request) error {
	body, err := io.ReadAll(req.Body)
	if err != nil {
		return fmt.Errorf("failed to read the body: %w", err)
	}

	fmt.Println(string(body))

	w.WriteHeader(http.StatusOK)
	_, err = w.Write([]byte("ok"))
	if err != nil {
		return fmt.Errorf("failed to write answer: %v", err)
	}
	return nil
}
```
{{< /tab>}}
{{< /tabs>}}
