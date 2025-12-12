# Child App Integration Standards

## Authoritative Documentation

This document has been superseded by the authoritative integration standards maintained in the wrapper repository.

**Please refer to the authoritative documentation at:**

`C:\Users\mail\Desktop\jetsetgo\app\jsg_wrapper\docs\child-app-integration-standards.md`

---

## Quick Reference (Key Points)

The following is a brief summary. **Always consult the authoritative documentation for complete details.**

### Required Props

Your child app must accept these props from the wrapper:

```ts
interface ChildAppProps {
  // Required
  token: string;              // Firebase ID token
  dbName: string;             // Tenant identifier (e.g., 'tta')
  onTokenExpired: () => void; // Call on 401/403 responses

  // Optional - Routing
  initialRoute?: string;
  onNavigate?: (route: string) => void;
  onNavigateToApp?: (path: string) => void;
}
```

### Routing

- Use `BrowserRouter` with the `RouterSync` pattern
- See: `jsg_wrapper/docs/child-app-integration-standards.md` Section 4

### CSS Namespacing

- Use PostCSS namespacing to prevent style conflicts
- See: `jsg_wrapper/docs/CSS_NAMESPACING_FOR_CHILD_APPS.md`

### Authentication

- Store token in auth context (from props)
- Use `Authorization: Bearer <token>` for REST API
- Use `X-Hasura-Tenant-Id` header for GraphQL API
- Call `onTokenExpired()` on 401/403 responses

### GraphQL API

- Use `jsg_reference_schema_` prefix for all table names
- Include `X-Hasura-Tenant-Id: <dbName>` header
- See: `C:\Users\mail\Downloads\FRONTEND_HASURA_MIGRATION_GUIDE.md`

---

## Related Documentation

| Document | Location |
|----------|----------|
| Integration Standards | `jsg_wrapper/docs/child-app-integration-standards.md` |
| Style Guide | `jsg_wrapper/docs/STYLE_GUIDE.md` |
| CSS Namespacing | `jsg_wrapper/docs/CSS_NAMESPACING_FOR_CHILD_APPS.md` |
| Cross-App Navigation | `jsg_wrapper/docs/CROSS_APP_NAVIGATION.md` |
| Container Queries | `jsg_wrapper/docs/CONTAINER_QUERY_RESPONSIVE_LAYOUT.md` |
| Tabbed Layouts | `jsg_wrapper/docs/TABBED_PAGE_LAYOUT_SPEC.md` |
| GraphQL Migration | `C:\Users\mail\Downloads\FRONTEND_HASURA_MIGRATION_GUIDE.md` |
