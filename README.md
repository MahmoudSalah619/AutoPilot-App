# AutoPilot

A car maintenance app: track services, fuel economy, reminders and documents,
and get told what needs doing before it becomes a problem.

Built with Expo (SDK 52), expo-router, Redux Toolkit Query and Supabase.

## Getting started

```bash
npm install
npm start
```

The app boots on **mock data** by default, so every screen is fully usable
before a backend exists. See [Data layer](#data-layer) to switch to Supabase.

## Architecture

```
app/              expo-router routes — screens only, no business logic
  (auth)/         welcome, sign in, sign up, reset password, first vehicle
  (main)/
    (tabs)/       Maintenance · Calendar · Home · Services · Profile
    services/     fuel, reminders, documents, errors guide, climate, trips
    profile/      personal info, vehicles, notifications, settings, help, about
    vehicle/      add and edit a vehicle

features/         feature modules: components + hooks scoped to one domain
shared/           the UI kit and screen shells, used by every feature
theme/            ThemeProvider, useTheme, useThemedStyles
constants/        design tokens: Colors, Typography, Layout, Metrics
apis/             data layer: repositories, RTK Query, mock store, schema
utils/            pure helpers: domain rules, formatting, dates
locale/           en.json and ar.json
```

The rule of thumb: **screens compose, features own behaviour, shared owns
appearance.** A screen should read as a description of its layout; anything
with logic in it belongs in a feature hook or `utils/domain.ts`.

### Design system

Every visual value comes from a token. No component contains a raw hex,
font size, or spacing number.

| Token file | Holds |
|---|---|
| `constants/Colors.ts` | Semantic colors for light and dark. The two palettes declare identical key sets, enforced by `ThemeColors`. |
| `constants/Typography.ts` | The closed set of text roles. Screens pick a `variant`; they never set size and weight by hand. |
| `constants/Layout.ts` | 4pt spacing scale, radii, elevation presets, motion durations. |

Components read tokens through `useTheme()`, which is reactive — changing the
theme re-renders the tree. For `StyleSheet` blocks that need theme values, use
`useThemedStyles(makeStyles)` with the factory defined at module scope.

```tsx
const { colors, spacing } = useTheme();

<Text variant="h2" color="textSecondary" tx="home.attentionTitle" />
<Button variant="primary" tx="common.save" onPress={save} loading={isSaving} />
```

### Internationalisation

English and Arabic, with RTL. Translation is **opt-in**: `Text` and `Button`
take a `tx` prop holding a translation key; anything passed as `children` is
rendered verbatim, which is what you want for user data.

```tsx
<Text variant="h2" tx="fuel.title" />          {/* translated */}
<Text variant="metric">{`${liters} L`}</Text>  {/* user data, as-is */}
```

Switching to Arabic flips `I18nManager` to RTL, which React Native only applies
after a reload — `useChangeLanguage` detects this and prompts for a restart.

Keep `en.json` and `ar.json` in sync; both currently hold 626 keys.

## Data layer

Screens call RTK Query hooks. Those hooks call **repositories**, and each
repository has two branches: the in-memory mock store, and Supabase.

```
screen → useGetFuelEntriesQuery()   (apis/autopilotApi.ts)
           └→ fuel.listFuelEntries() (apis/repositories/fuel.ts)
                ├→ mock store        (apis/mock/store.ts)
                └→ supabase          (apis/supabaseClient.ts)
```

Because the split lives at the repository boundary, cache keys, tag
invalidation, loading flags and error handling are already correct against mock
data — switching backends changes no component.

### Switching to Supabase

1. Put your project credentials in `.env`:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```

2. Run [`apis/schema.sql`](apis/schema.sql) in the Supabase SQL editor. It
   creates every table, the `profiles` trigger, row-level-security policies and
   the storage buckets.

3. Flip the flag:

   ```
   EXPO_PUBLIC_USE_MOCK_DATA=false
   ```

Nothing else changes. Table names live in `apis/config.ts`.

### Domain rules

Status is **derived on read**, never stored — a reminder becomes overdue
because time passed, not because a job ran. `utils/domain.ts` holds these
rules, and they are pure functions with no i18n or React dependency:

- `resolveReminderStatus` — a `both` reminder fires on whichever comes first,
  date or distance.
- `calculateFuelStatistics` — only full fill-ups contribute to economy, because
  a partial fill does not tell you how much fuel the preceding distance used.
- `resolveDocumentStatus` — 30 days' warning before an expiry.
- `estimateTrip` / `findTripBlockers` — fuel cost from measured economy, plus
  anything falling due before the return date.

## Scripts

```bash
npm start          # Expo dev server
npm run android    # run on Android
npm run ios        # run on iOS
npm run lint       # eslint + prettier
npm run lint:fix   # autofix
npx tsc --noEmit   # typecheck
```

## Conventions

- **Colors** come from `useTheme().colors`. Never a hex literal in a component.
- **Text** uses a `variant`. Reach for `size`/`weight` overrides only when the
  scale genuinely has no role for it.
- **Spacing** uses `SPACING.*`. Never a bare `16`.
- **Screens** wrap in `<Screen>`, which owns safe areas, scrolling, keyboard
  avoidance, tab-bar clearance and the header.
- **Forms** use `FormInput` with rules from `features/auth/validation.ts`.
  Validation messages are translation keys.
- **Dialogs** use `ConfirmDialog`, not `Alert.alert` — the platform alert
  ignores the app's theme and typography.
- **Lists** always supply an `EmptyState` and a `SkeletonCard` loading state.
