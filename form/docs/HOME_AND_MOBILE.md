# Home and phone layouts

## Included in this revision

- Overview is renamed Home throughout visible navigation and the initial demo.
- Seven fixed calendar slots, previous/next week and Today controls. Selected dates drive food totals, daily check-in, step/sleep reading and completed workouts. Home starts the selected weekday's plan with the selected session date; the Training page's usual Start control starts today's date.
- Thirteen cards: training, calories, macros, bodyweight, steps, physique, volume, consistency, sleep/recovery, maintenance, daily check-in, weekly recap and selected-date history.
- Customize Home: visibility, S/M/L sizes, calorie Ring/Week/Number, macro Bars/Rings, weight Chart/Number, steps Bars/Heatmap. Pointer handles support drag reordering; up/down buttons provide an accessible alternative. Reset layout and an all-hidden recovery state are included.
- Separate locally saved layouts per signed-in account and lifter mode. Settings are saved on this device/browser, not synchronized between devices. No database migration is needed for this revision.
- Navy/turquoise Form identity retained. Cards and customization follow the supplied layout rather than reusing the reference app's name or green accent.
- Phone bottom navigation for Home/Food/Train/Friends/Log, dismissible menu overlay, safe-area and bottom-content padding.
- On phone widths, formerly wide tables become stacked records with labels derived from actual column headings. This includes exercise plans, client reviews, import previews, cardio, challenges, food history, timelines and exercise history.
- Input text avoids iOS focus zoom; action rows wrap; charts, forms, media and controls use available width. The calorie diary history is no longer hidden on phones.

## Retained features

The former Home maintenance calculation, training map, daily checklist, weekly recap, personal/client selector and history were moved into cards. Their source logic and navigation remain. Other feature pages and backend routes remain present.

## Local verification

- TypeScript and production build.
- Existing 24 page-render smoke checks.
- New 21 Home checks: configuration restoration, corrupt preferences, valid display styles, complete card retention while reordering, all-hidden recovery, date boundaries, correct weekday selection and all card sizes/display variants rendering without records.
- Existing backend/domain/import/auth regression suite is run with this revision.

## Pending phone acceptance

The supported browser control skill is unavailable in this managed environment, so no browser was launched. These are code changes and server-render checks, not a claim of measured zero overflow or screenshot fidelity. Before releasing, verify in iPhone Safari and Android Chrome at 320, 375, 390 and 430 CSS pixels:

1. Home cards fit and calendar has exactly seven visible slots.
2. Customize each card, hide/show, drag and use arrows, then reload to confirm persistence.
3. All-hidden layout can recover, casual/science modes retain separate layouts.
4. Review a past day and start its matching weekday plan; verify the saved session date.
5. Training, timeline, client, cardio and challenge records show all values without horizontal swiping.
6. Open a workout modal and keyboard; verify controls remain reachable.
7. Open/close the menu and visit all bottom tabs; no navigation covers the final content.
8. Check light mode, long names and an account with no history. Inspect console errors.
