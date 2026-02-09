# Tikdo

A mobile app built with React Native and Expo.

## Git Branch Guidelines

**Principle:** One branch per purpose. Branch name tells you what it's for at a glance.

### Naming Format

`<type>/<short-description>`

| Type        | When to use                            | Example                      |
| ----------- | -------------------------------------- | ---------------------------- |
| `feature/`  | New functionality                      | `feature/task-creation`      |
| `fix/`      | Bug fixes                              | `fix/fab-button-position`    |
| `refactor/` | Code restructuring, no behavior change | `refactor/navigation-layout` |
| `testing/`  | Test setup or coverage                 | `testing/fab-button-tests`   |

### Rules

- Always branch off `main`
- Use kebab-case for descriptions (`task-list`, not `taskList` or `task_list`)
- Keep descriptions short (2-3 words max)
- Merge back to `main` via pull request
- Delete branch after merge

## Commit Message Guidelines

**Principle:** Each commit message starts with a verb describing what the commit does.

### Format

```
<verb> <what changed>
```

### Common Verbs

| Verb       | When to use                           |
| ---------- | ------------------------------------- |
| `add`      | New file, feature, or dependency      |
| `fix`      | Bug fix                               |
| `update`   | Change to existing functionality      |
| `remove`   | Delete code, file, or dependency      |
| `refactor` | Restructure without changing behavior |
| `setup`    | Initial configuration or tooling      |
| `move`     | Relocate files or code                |

### Rules

- Start with a lowercase verb
- Keep it under 60 characters
- Describe **what** changed, not **how**
- One logical change per commit

### Examples

```
add task creation screen with form validation
fix fab button overlapping navigation bar
update inbox to show task count
remove unused calendar placeholder
setup jest and react-native-testing-library
refactor tab layout to use shared config
move components into src directory
```

## Sentry (Error Monitoring)

[Sentry](https://sentry.io) is integrated via `@sentry/react-native` to capture crashes and errors in real time.

- **Initialized** in `src/app/_layout.tsx` — the root layout is wrapped with `Sentry.wrap()`
- **Dashboard** — errors and performance data appear in the Sentry project dashboard
- **Test it locally** — throw a test error to verify events reach Sentry:
  ```tsx
  <Button title="Test Sentry" onPress={() => Sentry.captureException(new Error("Test error"))} />
  ```

## Testing Guidelines

**Principle:** Test behavior from the user's perspective. If a user can't observe it, don't test it.

### Test These

- **User interactions** — tap, swipe, type → verify the visible outcome
- **Conditional rendering** — loading, empty, error, and populated states show correctly
- **Callback contracts** — `onPress`/`onSubmit` callbacks fire with correct arguments
- **Custom hooks with logic** — data transformations, computed values, side effects
- **Pure utility functions** — validation, formatting, calculations, and their edge cases
- **Store actions** — calling an action produces the expected state change
- **Async/API flows** — mock the network, test success and error handling

### Skip These

- **Static text/labels** — if it breaks, you'll see it immediately
- **Styles** — colors, sizes, and spacing are not behavior
- **Third-party internals** — Expo Router, React Navigation are tested by their maintainers
- **Implementation details** — internal state shape, lifecycle, private methods
- **Snapshot tests** — break on every UI change, rarely catch real bugs

### Query Priority

Use the most accessible query available:

1. `getByRole` — closest to how users see the app
2. `getByText` — what the user reads
3. `getByPlaceholderText` — for inputs
4. `getByTestId` — last resort

### Running Tests

```bash
npm test                                # all tests
npm test -- --watch                     # watch mode
npm test -- __tests__/FabButton-test.tsx # specific file
```
