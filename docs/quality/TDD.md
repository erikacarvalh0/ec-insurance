# Test-driven development

All production behavior follows RED → GREEN → REFACTOR.

## Cycle

1. Write a focused failing test describing observable behavior before writing its implementation.
2. Run the test, verify it fails for the expected reason, and record the failing result in the PR.
3. Implement the smallest production change that makes the test pass.
4. Run the test and report the passing result.
5. Refactor for human readability while keeping tests green.
6. Run all affected tests, type checking, linting, and builds before requesting review.

Do not claim TDD based solely on tests added after the implementation. Test-first commits may use `test(scope): :white_check_mark: ...`. Implementation commits follow `feat(scope): :sparkles: ...` and fixes follow `fix(scope): :bug: ...`.

## Definition of done

- Tests cover success, validation failures, state transitions, and relevant edge cases.
- Mock quotation responses are prominently labeled simulated and never masquerade as insurer offers.
- No real customer data or credentials in fixtures, logs, commits, or screenshots.
- Pull requests are in English, are reviewable independently, and include the test cycle evidence.
- Cross-team dependencies are represented by stable contracts and isolated files.
- The author never merges their own pull request.

## Review checklist

- [ ] RED: test failed before the behavior was implemented
- [ ] GREEN: implementation passes the test
- [ ] REFACTOR: readability improved without changing behavior
- [ ] Regression tests and static checks pass
- [ ] Security, privacy and accessibility considered
- [ ] Scope and API contract changes documented

Reference coding conventions: [erikacarvalho-ds](https://github.com/erikacarvalh0/erikacarvalho-ds). Prefer legible multi-line TypeScript, consistent 2-space indentation, named functions and clear domain types.
