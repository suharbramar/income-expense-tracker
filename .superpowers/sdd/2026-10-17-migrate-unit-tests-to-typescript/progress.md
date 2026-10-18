# SDD ledger - plan: client/docs/2026-10-17-migrate-unit-tests-to-typescript.md

Pre-flight: shared interface is the existing Jest/CRA TypeScript configuration consumed by all test groups.
Ruling: no commits - the user explicitly requested self-verification and no commit; changes will remain in the working tree.

Completed:
- Renamed all 13 Jest test files to `.test.ts` or `.test.tsx`.
- Added direct `@types/jest` development dependency and preserved strict TypeScript checking.
- Typed fixtures, Axios/API mocks, hook mocks, nullable hook inputs, and schema assertions.
- Fixed the expense submit test by making the InputForm submit-type fallback deterministic.
- Updated `client/docs/UNIT_TEST_IMPLEMENTATION_GUIDE.md` with TypeScript migration guidance.
- Verified `tsc --noEmit`, lint, focused tests, and the full suite before the final documentation-only assertion cleanup.

Verification evidence:
- Full suite: 13 suites passed, 73 tests passed.
- Focused `InputForm.test.tsx`: 8 tests passed.
- Focused `App.test.tsx`: 11 tests passed.
- `tsc --noEmit`: passed.
- `npm run lint`: passed after schema assertion cleanup.
- No `.test.js` or `.test.jsx` files remain under `client/src`.
