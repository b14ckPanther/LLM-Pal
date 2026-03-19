# LLMPal UX Flow

## UX Goals
- Remove friction from first prompt to response.
- Keep interactions fast, clear, and visually calm.
- Provide premium quality through micro-feedback and layout clarity.

## User Journey

### 1) Onboarding
1. User lands on elegant auth screen with concise value proposition.
2. User signs up or signs in via email/password.
3. User is routed directly into chat workspace with starter empty state.
4. Empty state offers one primary action: start first conversation.

### 2) Chat Usage
1. User selects an existing chat or creates a new one from sidebar.
2. User types prompt in composer and submits with Enter.
3. User message appears immediately (optimistic render).
4. Assistant response streams progressively with smooth text reveal.
5. Timeline auto-scrolls unless user manually scrolls upward.
6. Context actions (copy, regenerate, delete) appear on hover/focus.

### 3) Uploading Images
1. User taps/clicks attachment action near composer.
2. User selects image file and sees preview chip/card.
3. Upload starts with lightweight progress affordance.
4. User sends prompt with attached image.
5. Image appears inline with corresponding message.

## Interaction Patterns
- **No-friction defaults**: clear CTA hierarchy, minimal required fields.
- **Minimal clicks**: critical actions reachable in one interaction.
- **Keyboard friendly**: `Cmd/Ctrl + K` command palette for navigation/actions.
- **Progressive disclosure**: advanced actions hidden until hover/focus.
- **Safe feedback**: inline validation and recoverable error states.

## Motion + Feedback Patterns
- Message entry: fade + slight upward drift.
- Sidebar/list transitions: subtle crossfade and translation.
- Focus and hover states animate quickly for tactile UI feel.
- Skeletons mirror final layout to reduce cognitive jump.

## Mobile UX Notes
- Composer remains thumb-accessible with sticky bottom placement.
- Sidebar becomes slide-over panel.
- Tap targets stay >= 40px visual size.
- Preserve readability with tighter but consistent spacing scale.

## Edge Cases
- Slow network: skeleton + non-blocking notices.
- Upload failure: retry action in-place.
- Stream interruption: partial response retained with retry affordance.
- Empty chats: guided prompts and quick starters.
