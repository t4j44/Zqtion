# Admin Review Workflow & Resource Freshness

## 1. Publication Lifecycle

Every resource moves through a strict lifecycle to ensure quality and veracity:

```text
[ Seed Discovery ]
       │
       ▼
   [ Draft ] ──(Verification / Testing)──► [ Review ]
                                                │
                                    (Originality Gate Pass)
                                                │
                                                ▼
                                          [ Published ]
                                                │
                                     (Recrawl Change Detected)
                                                │
                                                ▼
                                        [ Needs Review / Stale ]
```

### Lifecycle States:
- `draft`: Initial entity extraction or outline.
- `review`: Content written and awaiting manual or automated gate signoff.
- `published`: Publicly accessible on `/resources` and via MCP.
- `stale`: Underlying tool, API, or repo changed or deprecated.
- `blocked_originality`: Failed similarity thresholds; requires regeneration.
- `archived`: Retired resource preserved for historical reference.

---

## 2. Review Checklist (Section 32 Quality Gates)

Before a resource is marked `published`:
- [ ] **Source Gate:** Primary official website or GitHub repository verified.
- [ ] **Accuracy Gate:** Current pricing and model versions confirmed against official documentation.
- [ ] **Originality Gate:** 5-gram overlap `< 15%`, longest contiguous sequence `< 18` tokens.
- [ ] **Attribution Gate:** Original creators credited where appropriate without making Zqtion appear to own third-party code.
- [ ] **Safety Gate:** No hazardous shell commands or unverified scripts.
- [ ] **Evidence Gate:** Outcomes properly labeled (`verified`, `zqtion_tested`, `source_reported`).
