# Data Model: React Compiler Adoption

**Feature Branch**: `023-react-compiler-adoption`
**Date**: 2026-03-17

This feature is a code migration/refactoring task. There are no new persistent data entities, database changes, or API schema changes. The "entities" below describe the conceptual units tracked during migration.

## Migration Tracking Entities

### Memoization Call Site

Represents a single usage of useMemo, useCallback, or React.memo in source code.

| Attribute         | Type                                      | Description                                      |
| ----------------- | ----------------------------------------- | ------------------------------------------------ |
| filePath          | string                                    | Absolute path to the source file                 |
| lineNumber        | number                                    | Line where the primitive is called               |
| type              | 'useMemo' \| 'useCallback' \| 'React.memo' | Which memoization primitive                     |
| layer             | 'core' \| 'domain' \| 'main'             | Which source layer the file belongs to           |
| domainSubdir      | string \| null                            | Domain subdirectory name (if layer is 'domain')  |
| isPure            | boolean                                   | Whether the memoized logic is pure (no side effects) |
| hasEslintDisable  | boolean                                   | Whether an associated eslint-disable comment exists |
| migrationStatus   | 'pending' \| 'removed' \| 'exception'    | Current state in the migration                   |

### Compiler Bail-Out

Represents a component or hook where the React Compiler cannot optimize.

| Attribute        | Type                                     | Description                                          |
| ---------------- | ---------------------------------------- | ---------------------------------------------------- |
| filePath         | string                                   | Path to the file with the bail-out                   |
| lineNumber       | number                                   | Line of the eslint-disable comment                   |
| reason           | string                                   | Why the compiler bails out                           |
| resolution       | 'fixed' \| 'permanent-exception' \| 'investigating' | Current resolution status          |
| fixApproach      | string \| null                           | How the bail-out will be resolved (if fixable)       |

### Migration Batch

Represents a group of files processed together.

| Attribute        | Type                                     | Description                                          |
| ---------------- | ---------------------------------------- | ---------------------------------------------------- |
| phase            | 0 \| 1 \| 2 \| 3 \| 4                   | Which migration phase                                |
| scope            | string                                   | Description (e.g., "core/ui", "domain/collaboration")|
| callSitesRemoved | number                                   | Count of memoization calls removed                   |
| testsPass        | boolean                                  | Whether the test suite passed after this batch        |
| performanceOk    | boolean                                  | Whether profiling showed no regression               |

## State Transitions

### Memoization Call Site Lifecycle

```
pending → removed     (normal removal)
pending → exception   (documented compiler limitation)
```

### Compiler Bail-Out Lifecycle

```
investigating → fixed                (refactored to be compiler-compatible)
investigating → permanent-exception  (cannot be fixed, documented)
```

## Relationships

- Each **Memoization Call Site** belongs to exactly one **Migration Batch**
- Each **Migration Batch** may contain 0..N **Memoization Call Sites**
- **Compiler Bail-Outs** must be resolved before the **Memoization Call Sites** in their files can be migrated
