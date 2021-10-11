---
title: Extending SetOps
weight: 100
HideCommandReplacement: true
---

# Extending SetOps

SetOps offers many functionalities and popular services out of the box so that most use-cases can be implemented by using SetOps only. However, there might be use-cases which cannot be implemented with SetOps natively. Since SetOps manages resources in your own AWS account, you can extend SetOps functionality by adding your own resources and configurations.

## Network Peering

You might want to provide access to resources outside SetOps in a private, secure matter. To do so, other networks (also called Virtual Private Networks (VPC)) can be connected to the SetOps network to provide connectivity between SetOps tasks and entities in the remote network.

The remote network must fulfill the following requirements to be able to create a peering with the SetOps network:
* must be an AWS VPC
* must be located in the same region as the SetOps network
* must use an IP range outside of `10.0.0.0/8`

To connect a remote network to SetOps the remote side needs to create a peering request. Afterwards SetOps can accept the peering request and the networks are connected. If you want to connect a remote network, please contact the [Support](mailto://support@setops.co).

### Example Integrations

This section explains how to create a peering request with some 3rd-party services and will be extended as use-cases arise.

#### MongoDB Atlas

A possible use-case is the integration of [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Atlas offers fully managed MongoDB database clusters on all major cloud providers. SetOps already provides the [DocumentDB service with MongoDB compatibility]({{< relref "/user/configuration/services#mongodb4" >}}) out of the box, but it comes with some limitations. If your application requires a *real* MongoDB database, Atlas could be a service you want to use. To connect your Atlas database clusters to SetOps and make it available to your apps, follow these steps:

1. Request peering infos from [SetOps Support](mailto://support@setops.co). The support will provide the following information:
    * AWS Account ID - can also be found in *My Account* in your AWS Console
    * VPC ID - can also be found in *VPC* in your AWS Console
    * VPC CIDR - currently `10.0.0.0/8`
    * AWS Region - can also be found in *VPC* in your AWS Console
    * Security Group ID of apps to access the clusters - can also be found in *VPC* under *Security Groups* in your AWS Console, security group `shared_app_task`
2. If not done yet, create an Atlas account & a project
3. Go to the *Network Access* page
4. Click on *Add Peering Connection*
5. Fill in the information from step 1. into the fields under *Your Application VPC* and uncheck *Add this CIDR block to my IP whitelist* for a more secure setup. We will add rule later.
6. Check *Same as application VPC region* under *Your Atlas VPC* and enter a custom Atlas CIDR block of your preference. This block must not be part of `10.0.0.0/8`.

    The form should now look like this:
    ![Peering Request](peering-request.jpg)

7. Click *Initiate Peering*
8. Copy the *Peering ID* and submit it back to the [SetOps Support](mailto://support@setops.co) and wait for confirmation.
9. Finally, allow the SetOps app(s) access to the clusters by creating a rule via the *IP Access List* tab. Click *Add IP Address* and enter the Security Group ID from step 1. into the *Access List Entry* field and *Confirm*
10. You should now be able to create credentials for your app(s) and reach your clusters via the cluster DNS names from SetOps.
