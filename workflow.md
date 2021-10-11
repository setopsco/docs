```sequence
CLI->API: $ setops login
API-->CLI: Session Token
CLI->API: $ setops stage:create production
Note right of API: Creates stage config,\nstores it,\ncommits
API->AWS: $ terraform apply
AWS-->API: ok
API-->CLI: ok
CLI->API: $ setops app:create web
Note right of API: Adds app:create web\nto command queue
Note right of API: Command Queue:\n1. app:create web
API-->CLI: ok
CLI->API: $ setops app:command:set bin/rails server
Note right of API: Adds app:command:set\nto command queue
Note right of API: Command Queue:\n1. app:create web\n2. app:command:set
API-->CLI: ok
CLI->API: $ setops commit
Note right of API: Updates working copy\nof stage config with\ncommands from queue,\ncommits
API->AWS: $ terraform apply
AWS-->API: ok
API-->CLI: ok
```

Draw svg with [js-sequence](https://bramp.github.io/js-sequence-diagrams/).
