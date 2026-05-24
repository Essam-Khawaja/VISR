# Personal Time Blocks - Tasks

- [x] Schema: `personal_time_blocks` table (in `db/schema.sql`)
- [x] Type: `PersonalTimeBlock` in `src/types/index.ts`
- [x] API route `/api/personal-time` GET/POST/PATCH/DELETE
- [x] `src/lib/personal-time.ts` helpers (`blocksForDate`, `blocksToPhantomEvents`)
- [x] `/api/free-time` integrates phantoms
- [x] `PersonalTimeManager` UI in Settings (DatePicker + TimePicker)
- [x] Dashboard merges phantoms into timeline display
- [x] Week page renders phantoms per day
- [x] Reserved `personal_time` category in `CATEGORY_CONFIG`, filtered out of the form picker
- [x] Reseed includes 6 personal time blocks across May 23-28
