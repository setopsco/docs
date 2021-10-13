---
weight: 30
HideCommandReplacement: true
title: API Errors
slug: api-errors
---
# API Errors

HTTP status codes `4xx` and `5xx` are errors.

The API returns a `ServiceError` for every error response.

## Service Errors

A `ServiceError` has the following schema:

```json
{
  "type": "AuthenticationError",
  "code": "CredentialsInvalid",
  "temporary": false,
  "request_id": "sGH28YBJ"
}
```

`type` describes the error category and can be one of the following values:

- `Fault` – a non-user error
- `AuthenticationError` – failure to provide sufficient credentials
- `ValidationError` – failure to provide valid input values
- `StateError` – the server state is inappropriate for the requested action

`code` indicates the error cause and can be one of the following values:

- `ServerFailure` – a failure where there was an internal error at the server
- `SessionInvalid` – failure to provide valid session credentials
- `CredentialsInvalid` – failure to provide valid user credentials
- `ValidationFailed` – failure to provide valid input values
- `StageDoesNotExist` – failure to provide an existing stage name
- `StageAlreadyExists` – failure to provide a stage name that does not already exist
- `StageNameInvalid` - failure to provide a valid stage name
- `AppDoesNotExist` – failure to provide an existing app name
- `AppHasNoActiveRelease` - failure to provide an app with active release
- `AppNameInvalid` - failure to provide a valid app name
- `ReleaseDoesNotExist` - failure to provide an existing release id for an app
- `AppAlreadyExists` – failure to provide an app name that does not already exist
- `ServiceDoesNotExist` - failure to provide an existing service name
- `ServiceAlreadyExists` - failure to provide a service name that does not already exist
- `ServiceNameInvalid` - failure to provide a valid service name
- `ChangesetDoesNotExist` – failure to request an operation on a non-existing changeset
- `ChangesetInvalid` – failure to validate the changeset, see field `validation_errors` for an explanation
- `CommitFailed` – failure to commit the changeset
- `CommitAlreadyRunning` – requesting an operation on a changeset for which a commit is running
- `ChangesetLocked` - caused by requesting an operation on a changeset that is locked by another operation
- `CommitNotFound` – returned when trying to subscribe to a commit that is not currently running
- `TaskDoesNotExist` - failure to provide an existing task id
- `CodeReleaseDigestInvalid` - failure to provide a valid release digest
- `CodePermissionAlreadyExist` - adding permission for a user who already got permission for the stage
- `CodePermissionDoesNotExist` - removing permission that does not exist for the Stage
- `CodeCantRemoveLastAdmin` - refusal to remove the last user with admin privileges for the stage
- `CodeInsufficientPrivileges` - failure to have the correct privileges (e.g., admin privileges) for the operation
- `CodeCurrentlyNotSupported` - returned when requesting an operation that is currently not supported by SetOps
- `CodeBackupNotFound` - returned when requesting an operation for a backup that doesn't exist
- `Overload` – returned when the requested operation can currently not complete because the server is overloaded

`temporary` indicates whether the fault is temporary and the client can retry the same request at a later time.

`request_id` is a unique identifier for the request. This can be provided with support requests in order to help trace the request.

## Validation Errors

HTTP status code `422 Unprocessable Entity` is returned if the request is valid on a syntax level but the provided input parameters failed validation.

In this case, an additional field `validation_errors` is returned:

```json
{
  "type": "ValidationError",
  "code": "ValidationFailed",
  "validation_errors": {
    "name": ["too_short"]
  },
  "temporary": false,
  "request_id": "mudkKnY7"
}
```

`validation_errors` is an object. The keys correspond to request or response field names. The values are arrays of validator names. Those can be used to provide rich error messages to the user.

In case the field is an array, the key may include the index:

```json
{
  ...
  "validation_errors": {
    "changeset": {
      "commands[0]": ["taken"]
    }
  }
}
```

The following validators are returned:

- `invalid`: value is invalid (generic validation error, in case a more specific validator can't be applied)
- `invalid_format`: value has an invalid format, like a date is not provided in the correct format
- `required`: value can't be blank (e.g. empty string)
- `too_short`: value is too short (e.g. string of 3 characters where min 6 characters are expected)
- `too_long`: value is too long (e.g. string of 10 characters where max 8 characters are expected)
- `length_invalid`: value has the wrong length (e.g. string of 2 characters where a string of 3 to 8 characters is expected)
- `greater_than_threshold`: value is greater than the threshold (e.g. `8` where max is `5`)
- `greater_than_or_equal_to_threshold`: value is greater or equal to the threshold (e.g. `5` where max is `5`)
- `greater_than_or_equal_to_dependent_value`: value is greater than or equal to a dependent value but must be smaller (e.g. `5` where dependent value is `3`)
- `less_than_threshold`: value is lower than the threshold (e.g. `-1` where min is `0`)
- `less_than_or_equal_to_threshold`: value is lower or equal to the threshold (e.g. `0` where min is `0`)
- `less_than_or_equal_to_dependent_value`: value is less than or equal to a dependent value but must be greater (e.g. `3` where dependent value is `5`)
- `not_an_integer`: value must be an integer, but isn't (e.g. `1.5` where an integer is expected)
- `included`: value is included in the list of invalid values (e.g. `a` where `a`, `b` and `c` are invalid)
- `not_included`: value is not included in the list of allowed values (e.g. `d` where `a`, `b` and `c` are supported)
- `not_an_email_address`: value must be an email address, but isn't
- `multiple_of_invalid`: value is expected to be a multiple of a specific value
- `taken`: value is already taken (e.g. a stage named `awesome-production` already exists)
- `not_found`: entity referenced can't be found (e.g. an app named `web` does not exist)
- `stage_name_invalid`: value is not a valid stage name
- `app_name_invalid`: value is not a valid app name
- `release_digest_invalid`: value is not a valid release digest
- `release_digest_does_not_exist`: value does not exist in image registry
