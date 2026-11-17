# Reusable UI components

Open **Profile → UI Components** after demo login to preview the library. The showcase covers typography/scale, form validation, all four button variants, loading and disabled states, modal input, confirmation success/error, and bottom-sheet selection.

Import components directly from `src/shared/components` so each feature loads only what it uses. All components use the saved Light/Dark/System appearance and English/Hindi settings.

## Component map

| Component      | File                                     | Purpose                                                                          |
| -------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| AppText        | `shared/components/AppText.tsx`          | Semantic text, size/weight/color overrides, responsive scale                     |
| Field          | `shared/components/Field.tsx`            | Single-line input, password visibility, helper/error text, icons, disabled state |
| MultilineField | `shared/components/MultilineField.tsx`   | Multiline input built on Field, ref forwarding, rows and minimum height          |
| Button         | `shared/components/Button.tsx`           | Primary, secondary, outline, ghost; sizes, icons, loading, disabled              |
| Loader         | `shared/components/Loader.tsx`           | Inline or full-area activity indicator with an optional label                    |
| AppModal       | `shared/components/AppModal.tsx`         | Controlled modal with title, scrollable content, and optional footer             |
| DialogBox      | `shared/components/DialogBox.tsx`        | Confirmation dialog with asynchronous actions and inline errors                  |
| BottomSheet    | `shared/components/BottomSheet.tsx`      | Controlled bottom sheet with size presets and swipe dismissal                    |
| Overlay        | `shared/components/overlays/Overlay.tsx` | Internal presentation shared by modal, dialog, and sheet                         |

## Text, font sizes, and scaling

```tsx
import { AppText } from '@/shared/components/AppText';

<AppText variant="h1">Welcome</AppText>
<AppText variant="bodySmall" color="muted">Supporting text</AppText>
<AppText size="lg" weight="bold" color="primary">Custom emphasis</AppText>
<AppText variant="body" scale={1.15}>Larger preview</AppText>
```

Typography is centralized in `src/shared/theme/typography.ts`:

| Variant   | Base font size |
| --------- | -------------- |
| display   | 44             |
| h1        | 36             |
| h2        | 30             |
| h3        | 24             |
| title     | 20             |
| body      | 16             |
| bodySmall | 14             |
| label     | 13             |
| input     | 15             |
| button    | 15             |
| caption   | 12             |
| overline  | 11             |

`src/shared/theme/tokens.ts` exports `fontSizes` (`xs` through `5xl`), `fontWeights`, `spacing`, `radii`, and `moderateScale`. Adjust these foundations and semantic variants to change the design system.

- `moderateScale` applies modest width scaling, using a base width of 390 and bounded widths from 320 to 480. Large desktop widths do not produce oversized mobile text.
- `AppText` accepts `responsive={false}` for a fixed design size, and an optional scale multiplier from 0.75 to 1.5 for local previews. This is separate from device accessibility text size.
- Native `allowFontScaling` stays enabled. The component does not multiply device font scale manually or impose a default maximum font multiplier. Callers can pass native Text props such as `maxFontSizeMultiplier` when a specific design needs one.
- Hindi receives more line height and zero letter spacing. The system font supplies the platform's Devanagari glyphs; no remote font download is required.
- Nested AppText inherits its parent's type styling unless you give it explicit typography props. Native `style` overrides remain available, and an explicit font-size override receives a suitable default line height.
- Existing screen text, shared inputs, buttons, and `useUI().s` text styles use the common foundations. The decorative brand mark retains its own geometry.

## App-wide font preference

**Profile → Preferences → Font size** controls the whole application, including content with explicit native style sizes, reusable inputs and buttons, modal/dialog/sheet text, and tab labels. Five presets cover 85%, 100%, 115%, 130%, and 150%; minus/plus buttons adjust in 5% steps. The preview updates immediately, bounds disable the relevant button, and Reset restores 100%.

The preference is persisted under the existing preferences key. Existing theme/language records receive a default scale of 1, and invalid saved scales recover safely. Device accessibility font scaling still applies independently; it is not multiplied manually a second time.

`usePreferences()` and `useUI()` expose `fontScale` and `setFontScale`. Set an absolute value with `setFontScale(1.2)` or use an updater such as `setFontScale(current => current + 0.05)`. Values are clamped to the supported range. `src/shared/theme/font-scale.ts` centralizes presets, bounds, and step size.

`AppText` applies the app scale once after semantic and native style overrides. Nested text without its own size inherits its parent's already-scaled size. `Field` applies the same scale to native inputs. Keep `useUI().s` and `getTypography` styles unscaled when passing them to AppText to avoid applying the app preference twice. For native text rendered outside AppText, use `scaleTextStyle`, as shown by the tab navigator.

Decorative branding and icons keep their geometry. Set `appFontScaling={false}` on AppText only for a decorative glyph that must keep its design size. The local `scale` prop remains available for typography previews and combines with the app preference.

## Inputs and multiline fields

```tsx
import { useRef, useState } from 'react';
import { type TextInputInstance } from 'react-native';
import { Field } from '@/shared/components/Field';
import { MultilineField } from '@/shared/components/MultilineField';

const input = useRef<TextInputInstance>(null);
const [email, setEmail] = useState('');
const [note, setNote] = useState('');

<Field
  ref={input}
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  helperText="Use your work email"
/>
<MultilineField
  label="Note"
  value={note}
  onChangeText={setNote}
  rows={4}
  minHeight={128}
  maxLength={500}
/>
```

Both forward their ref to the native TextInput and accept native input props. Field adds `password`, `error`, `helperText`, `disabled`, `leftIcon`, `rightIcon`, and `containerStyle`. `style` customizes the input itself. `onFocus`/`onBlur` callbacks are preserved. Error text changes the border and is exposed to accessibility; a disabled field also disables the password toggle. MultilineField excludes the password toggle and uses top-aligned text.

Use translations from `useUI().t` for product labels and helper text. API field errors can use the existing `getFieldErrorMessage` helper described in [the API guide](api.md).

## Four button variants

```tsx
import { Button } from '@/shared/components/Button';

<Button title="Continue" variant="primary" onPress={continueFlow} />
<Button title="Save draft" variant="secondary" onPress={saveDraft} />
<Button title="Learn more" variant="outline" onPress={showDetails} />
<Button title="Skip" variant="ghost" onPress={skip} />
```

Common props: `size="sm" | "md" | "lg"`, `loading`, `disabled`, `leftIcon`, `rightIcon`, `fullWidth`, `style`, and `textStyle`. Buttons have a minimum touch height of 44, 56, or 64. `danger` changes the accent for destructive actions while retaining the same four variants.

Loading keeps the title and accessible label visible, shows the shared Loader, blocks repeated presses, and exposes `busy`. Disabled state also blocks presses. The old `secondary` boolean remains a compatibility alias; prefer `variant="secondary"`.

## Loader

```tsx
import { Loader } from '@/shared/components/Loader';

<Loader size="small" label={t('Loading...')} />
<Loader fullscreen label={t('Loading...')} />
```

Props include `visible`, `size`, `label`, `color`, `fullscreen`, and `style`. Fullscreen fills its bounded parent; wrap it in Screen or another flex container. A Loader exposes progress/busy semantics. To block a whole interaction flow, put a Loader inside AppModal with `dismissible={false}`.

## Modal

```tsx
import { AppModal } from "@/shared/components/AppModal";

<AppModal
  visible={open}
  onClose={() => setOpen(false)}
  title={t("Reusable modal")}
  size="md"
  footer={<Button title={t("Done")} onPress={() => setOpen(false)} />}
>
  <AppText>Custom content or a form goes here.</AppText>
</AppModal>;
```

The caller controls visibility. Size presets control maximum width; content is scrollable within the available viewport. The overlay handles safe areas, keyboard avoidance, a labelled close control, backdrop dismissal, Android Back, and web Escape through the native Modal implementation. Web focus trapping/restoration comes from React Native Web's Modal. The panel has dialog semantics and an accessible title.

Use `dismissOnBackdrop={false}` to require a close action, or `dismissible={false}` to block dismissal controls while work is in progress. Motion preferences are respected through the native accessibility API.

## Dialog box

```tsx
import { DialogBox } from "@/shared/components/DialogBox";

<DialogBox
  visible={confirmOpen}
  title="Delete item?"
  message="This action cannot be undone."
  destructive
  onClose={() => setConfirmOpen(false)}
  onConfirm={async () => {
    await deleteItem();
  }}
/>;
```

The dialog owns confirmation loading and closes after a successful `onConfirm`. Rejecting/throwing keeps it open and shows the common localized error UI. Cancel, close, backdrop, and hardware dismissal are blocked during confirmation. An error resets when the dialog closes. `confirmLabel` and `cancelLabel` override the translated defaults. The caller's action should perform work; the dialog handles its own successful close.

## Bottom sheet

```tsx
import { BottomSheet } from "@/shared/components/BottomSheet";

<BottomSheet
  visible={sheetOpen}
  onClose={() => setSheetOpen(false)}
  title={t("Choose an option")}
  size="md"
>
  <AppText>Scrollable sheet content</AppText>
</BottomSheet>;
```

Size presets use approximately 45%, 70%, or 95% of the available height (`sm`, `md`, `lg`). The sheet supports a footer, safe bottom inset, scrollable content, close/backdrop/Back/Escape, and dragging the top handle down to dismiss. A short drag springs back. Set `swipeToDismiss={false}` to disable drag dismissal, or `dismissible={false}` to block dismissal controls.

This is a single-height sheet using built-in React Native Modal, PanResponder, and Animated. It does not require another native library. For a future interaction that needs multiple interactive snap points, extend this shared abstraction in one place.
