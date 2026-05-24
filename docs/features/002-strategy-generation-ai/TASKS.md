# TASKS: Strategy Generation AI

- [ ] Create `lib/grok.ts`
- [ ] Create `lib/prompts/strategyPrompt.ts`
- [ ] Confirm `StrategyPlanSchema` exists in `lib/validation.ts`
- [ ] Create `app/api/generate/route.ts`
- [ ] Parse and validate request body
- [ ] Generate `studentId`
- [ ] Save student profile to Supabase
- [ ] Build strategy prompt
- [ ] Call Grok
- [ ] Validate response with Zod
- [ ] Retry once with correction prompt if validation fails
- [ ] Generate `planId`
- [ ] Save plan JSONB
- [ ] Return `{ planId, studentId }`
- [ ] Add structured errors
- [ ] Test with demo CS profile

