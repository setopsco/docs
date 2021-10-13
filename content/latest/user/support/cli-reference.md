---
weight: 20
HideCommandReplacement: true
title: CLI Reference
---

# CLI Reference

## Exit Codes

| Code | Meaning | Notes |
|------|---------|-------|
|0|Success||
|1|Generic Error|Malformed flags/arguments, network errors, etc.|
|78|Changeset does not exist|When running `changeset commit` or `changeset discard` without a changeset|
