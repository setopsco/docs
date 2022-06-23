---
weight: 50
title: Notifications
---
# Notifications

To be notified in case of specific events occurring in your Apps, you can define a **Notification**. Notifications are defined on the level of **Stage** and are valid for every App on the Stage.

Notifications have a `type` and a `target`. The Type specifies the integration to use and the Target represents the recipient called in case of an alert. See below for a list of types supported.

| Type | Target | Description |
|------|--------|-------------|
| [`email`]({{< relref "#email" >}}) | email address | Notifications are send via an email to the provided address. |
| [`webhook`]({{< relref "#webhook" >}}) | URL | Integration with external alerting systems. URL receives a `POST` request for each alert. |

We plan to support additional target types (such as `lambda`) in the future.

### List Notifications

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
### Create a Notification
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

### Delete a Notification

Remove existing Notifications by running `notification:destroy ALERTNAME`. The command creates a command that will delete the specified Notification on the next commit. In order to remove the `my_opsgenie_integration` Notification created in the example, you would run the following command.

```shell
setops --stage <STAGE> notification:destroy my_opsgenie_integration
```

## Email Targets {id=email}

Email targets provide a very simple way to set up notifications. After configuring an email address as an notification target, a validation email is send to the address to subscribe to the notifications. You will only receive notifications after you opened the confirmation link in the email.

In order to create the example my_email_notifications Notification, you would run the following command:

```shell
setops -p <PROJECT> -s <STAGE> notification:create my_email_notifications --type email --target <EMAIL ADDRESS>
setops -p <PROJECT> -s <STAGE> changeset:commit
```

## Webhook Targets {id=webhook}

Webhook Targets may be used to send alerts from SetOps to external systems, such as [OpsGenie](https://www.atlassian.com/software/opsgenie) or your own integration.

### Using with OpsGenie

1. In your OpsGenie account, go to *Settings* → *Integration list* and search for *AWS CloudWatch*. Click *Add*.

1. Set the properties such as *Name*, *Assigned Team* and *Responders* and click on *Save Integration*.

1. Copy the URL at *Add an HTTPS subscription to your topic*. This is your alert target URL.

1. Add the Alert Target to your Stage and commit the Changeset.

  ```shell
  setops -p <PROJECT> -s <STAGE> notification:create my_opsgenie_integration --type webhook --target THE_URL
  setops -p <PROJECT> -s <STAGE> changeset:commit
  ```

  You may re-use one OpsGenie integration for Alert Targets on multiple Stages if you wish.

### Implementing your own Handler

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
