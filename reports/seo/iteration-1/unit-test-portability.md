# Unit-test portability correction

Review found the new robots unit test imported robots-parser from ignored local audit tooling. The unit test now asserts the required configuration contract with built-in Node assertions, so npm test does not acquire an undeclared audit dependency. Effective robots precedence remains tested independently in the local discovery audit with the existing parser (35 agent/path cases). No product or lockfile changed.
