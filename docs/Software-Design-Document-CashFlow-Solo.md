## Software Design Document: CashFlow Solo

Version: 1.0  
Date: October 26, 2023  
Author: AI System Architect

---

### 1. Introduction & Vision

#### 1.1. Overview
CashFlow Solo is a premium, offline-first, privacy-focused personal budgeting application for iOS. It leverages the proven "envelope budgeting" method to help users gain control over their finances. Its core philosophy is to provide a beautiful, intuitive, and highly responsive user experience without requiring an internet connection or user accounts, ensuring absolute data privacy. The app is monetized through a one-time In-App Purchase (IAP) that unlocks advanced features.

#### 1.2. Core Philosophy & Design Principles
* **Privacy First, Offline Always:** All user data is stored exclusively on the device. No servers, no accounts, no tracking. The app must be fully functional without an internet connection.
* **Delightful UX through Motion:** The interface will be fluid and engaging, with meaningful animations and micro-interactions powered by `react-native-reanimated`. Every tap, swipe, and transition should feel satisfying and intuitive.
* **Clarity and Simplicity:** Despite its powerful features, the app will be easy to understand. The envelope metaphor will be visually represented to make budgeting tangible.
* **Empowerment and Motivation:** Features like Savings Challenges and the What-If Simulator are designed not just to track, but to inspire and motivate users to reach their financial goals.

#### 1.3. Target Audience
* **Privacy-Conscious Individuals:** Users who are wary of linking bank accounts and sharing financial data with cloud services.
* **Digital Envelope Budgeters:** People who understand or want to learn the envelope budgeting system but prefer a digital solution over physical cash.
* **Goal-Oriented Savers:** Users who are motivated by visual progress and challenges to save for specific goals (e.g., vacation, new tech, emergency fund).
* **Expatriates & Travelers:** Individuals who manage finances in multiple currencies and need a simple way to track spending across them.

---

### 2. Technology Stack & Architecture

#### 2.1. Core Framework
* **React Native:** Latest version for cross-platform potential, but with an iOS-first design focus.
* **JavaScript/TypeScript:** TypeScript will be used for type safety and improved developer experience.

#### 2.2. Key Libraries
* **State Management:** **Zustand**. A lightweight, simple, and unopinionated state management solution perfect for this app's scale. It avoids boilerplate and integrates well with React hooks.
* **Navigation:** **React Navigation (v6)**. For handling all screen transitions and navigation logic.
* **Animations:** **React Native Reanimated (v3)**. The cornerstone of the app's UX. Used for all complex gestures, shared element transitions, and performant UI animations on the native thread.
* **Database:** **WatermelonDB**. A high-performance reactive database framework for React Native. It's built on SQLite, is offline-first by design, and is highly scalable for handling thousands of transactions without performance degradation.
* **UI Components:** **Restyle by Shopify** or a custom-built component library for a consistent, themeable design system.
* **Icons:** **React Native Vector Icons** (Feather, MaterialCommunityIcons).
* **Charts/Graphs:** **React Native Skia**. For high-performance, beautiful, and fully customizable charts in the reporting and simulator sections.
* **Splash Screen:** **react-native-bootsplash** combined with a Lottie animation for a smooth, animated launch experience.
* **IAP:** **react-native-iap**. For handling the one-time purchase to unlock Pro features.
* **Sharing:** **react-native-share**. To share the Savings Challenge posters.
* **Haptics:** **react-native-haptic-feedback**. To provide tactile feedback on key interactions.

#### 2.3. Application Architecture
* **Component-Based Architecture:** The UI will be broken down into small, reusable components.
* **MVVM-like Structure:**
  * **Views (Screens):** React Native components responsible for rendering the UI.
  * **View Models (Custom Hooks):** Logic for each screen will be encapsulated in custom hooks (e.g., `useDashboardScreen.ts`). These hooks will interact with the data layer and manage screen-specific state.
  * **Models (WatermelonDB):** The data layer, defining the schema for transactions, envelopes, accounts, etc.

---

### 3. Monetization Strategy (Freemium Model)

The app will be free to download and use with core functionality. A single, one-time In-App Purchase ("CashFlow Solo Pro") will unlock premium features.

* **Free Version:**
  * Up to 3 Accounts (e.g., Cash, Debit Card).
  * Up to 10 Envelopes.
  * Full transaction tracking.
  * Multi-currency support for transactions.
  * One active Savings Challenge at a time.
  * Basic reporting (spending by envelope).

* **Pro Version (One-Time IAP):**
  * **Unlimited** Accounts & Envelopes.
  * **What-If Simulator.**
  * Access to the full library of **Savings Challenge posters** and ability to run multiple challenges simultaneously.
  * Advanced reporting and data export (CSV).
  * App Icon customization.
  * Face ID / Touch ID / Passcode lock.
  * Future pro features.

---

### 4. Data Model (WatermelonDB Schema)

* **`settings`** (Singleton table)
  * `id` (PK)
  * `base_currency` (string, e.g., "USD")
  * `is_pro` (boolean)
  * `passcode_enabled` (boolean)
  * `theme` (string, e.g., "light", "dark", "system")

* **`accounts`**
  * `id` (PK)
  * `name` (string)
  * `icon` (string)
  * `initial_balance` (number)
  * `created_at` (date)

* **`envelopes`**
  * `id` (PK)
  * `name` (string)
  * `icon` (string, emoji or icon name)
  * `color` (string, hex code)
  * `budgeted_amount` (number)
  * `budget_interval` (enum: "weekly", "bi-weekly", "monthly", "one-time")
  * `created_at` (date)

* **`transactions`**
  * `id` (PK)
  * `amount` (number, in the transaction's currency)
  * `type` (enum: "expense", "income", "transfer")
  * `note` (string, optional)
  * `currency` (string, e.g., "JPY")
  * `exchange_rate_to_base` (number, defaults to 1 if same currency)
  * `date` (date)
  * `created_at` (date)
  * Relations:
    * `envelope_id` (FK to `envelopes`)
    * `account_id` (FK to `accounts`)
    * `transfer_to_account_id` (FK to `accounts`, for transfers)

* **`savings_challenges`**
  * `id` (PK)
  * `template_id` (string, e.g., "52_week_challenge")
  * `start_date` (date)
  * `progress` (JSON object, e.g., `{"week1": true, "week2": false}`)

---

### 5. UI/UX Design System

#### 5.1. Color Palette
* **Primary Action:** Vibrant Teal (`#14B8A6`)
* **Background (Light):** Off-White (`#F8F9FA`)
* **Surface (Light):** Pure White (`#FFFFFF`)
* **Background (Dark):** Near Black (`#121212`)
* **Surface (Dark):** Dark Gray (`#1E1E1E`)
* **Primary Text:** Dark Gray (`#212529`) / Light Gray (`#EFEFEF`)
* **Secondary Text:** Medium Gray (`#6C757D`)
* **Accent Colors:** A set of 8-10 vibrant colors for envelope cards and charts (e.g., `#EF4444` (Red), `#3B82F6` (Blue), `#EAB308` (Yellow)).

#### 5.2. Typography
* **Font Family:** SF Pro (system default for iOS).
* **Headings (Large Title):** 34pt, Bold
* **Headings (Title 1):** 28pt, Bold
* **Body:** 17pt, Regular
* **Captions:** 12pt, Semibold
* **Buttons:** 17pt, Semibold
* *Dynamic Type will be fully supported for accessibility.*

#### 5.3. Iconography
* **Style:** Feather Icons. Clean, modern, and lightweight.
* **Usage:** For tab bar, buttons, and list items. Envelopes will also support system emojis for personalization.

#### 5.4. Spacing & Layout
* **Grid:** 8pt grid system. All margins, paddings, and component sizes will be multiples of 8.
* **Card Style:** Components like envelopes and account summaries will be presented in cards with a subtle `box-shadow` and `borderRadius` of 16px.

---

### 6. Detailed Screen & Component Breakdown

#### 6.1. Splash Screen
* **UI:** Centered app logo (a stylized 'C' and 'S' forming a subtle flow/wave). Background is the app's primary background color.
* **Animation (Lottie):**
  1. App opens, `react-native-bootsplash` shows a static version of the logo instantly.
  2. The Lottie animation begins. The 'C' and 'S' draw themselves on screen with a fluid, liquid-like effect.
  3. Once drawn, the logo subtly pulses once.
  4. The entire splash screen view fades out (`withTiming`) while the main app's Dashboard fades in, creating a seamless transition.
* **UX:** Provides a professional and polished first impression.

#### 6.2. Onboarding (First Launch Only)
* **UI:** A full-screen, horizontally-swiping `ScrollView` with 4-5 steps. Each step has a large, friendly illustration (SVG), a clear heading, and concise body text. A progress indicator (dots) is at the bottom.
* **Steps:**
  1. **Welcome:** "Welcome to CashFlow Solo. Your private, offline budget."
  2. **The Method:** "Master your money with the simple Envelope method." (Illustration of digital envelopes).
  3. **Privacy:** "Your data stays on your device. Always." (Illustration of a phone with a lock).
  4. **Setup Currency:** A screen with a searchable list of world currencies to set the base currency.
  5. **Get Started:** Final screen. "Let's create your first Account and Envelopes." Button takes them to a simplified setup flow.
* **Animations:**
  * **Screen Transitions:** As the user swipes, the content of the next screen slides in while the current one slides out. The illustrations will have a parallax effect using `useAnimatedScrollHandler` from Reanimated.
  * **Button Press:** The "Next" and "Get Started" buttons will have a `transform: [{ scale: 0.95 }]` animation on press (`withSpring`).

#### 6.3. Main Tab Navigation
A standard iOS tab bar at the bottom with 5 tabs:
1. **Dashboard** (Home Icon)
2. **Envelopes** (Envelope Icon)
3. **Transactions** (List Icon)
4. **Challenges** (Trophy Icon)
5. **Settings** (Gear Icon)

#### 6.4. Screen: Dashboard (Home)
* **UI:**
  * **Header:** "Dashboard" title. On the right, a small profile/settings icon.
  * **Total Balance Card:** A large, prominent card at the top showing "Total Balance" across all accounts in the base currency. The amount is large and bold.
  * **"Envelopes" Section:** A horizontally-scrolling `ScrollView` of Envelope Summary Cards. Each card is smaller than on the Envelopes screen.
    * **Envelope Summary Card:** Shows envelope icon/emoji, name, remaining amount (`$250 / $500`), and a thin progress bar at the bottom.
  * **"Recent Transactions" Section:** A list of the last 3-5 transactions.
    * **Transaction Row:** Icon (based on envelope), Note/Payee, Amount (colored red for expense, green for income), and date.
  * **Floating Action Button (FAB):** A large `+` button in the primary action color, anchored to the bottom right.
* **Animations & UX:**
  * **FAB Press:** The FAB scales up slightly and rotates 45 degrees (`withSpring`) as a modal sheet animates up from the bottom to add a new transaction.
  * **On Appear:** The Total Balance number animates, counting up to its value (`withTiming`). The envelope cards slide in from the right with a staggered effect (`LayoutAnimation`).
  * **Pull to Refresh:** Pulling down on the screen will trigger a refresh/recalculation of all values (though WatermelonDB makes this largely unnecessary, it's an expected UX pattern).

#### 6.5. Modal: Add/Edit Transaction
* **UI:** A modal sheet that slides up, covering ~80% of the screen.
  * **Amount Input:** A large, prominent input field that's auto-focused. Below it, the amount is displayed in the base currency based on the exchange rate.
  * **Type Selector:** Segmented control for "Expense", "Income", "Transfer".
  * **Keypad:** A custom-built numeric keypad for quick entry. No standard text keyboard.
  * **Details Section:** Fields for "Note", "Date" (defaults to today), "Envelope" selector, and "Account" selector.
  * **Currency/Exchange Rate:** Tapping the currency symbol next to the amount opens another modal to select a currency and optionally set a custom exchange rate.
  * **Save Button:** A full-width button at the bottom.
* **Animations & UX:**
  * **Modal Presentation:** A smooth slide-in from the bottom (`withSpring`).
  * **Amount Input:** As the user types, the numbers animate in place with a subtle "flip" or "fade" effect.
  * **Save Action:** On save, the modal slides down. In the background, the Dashboard or Envelope screen visibly updates. The corresponding envelope card's balance number animates to its new value, and the progress bar animates its width (`withTiming`). A haptic "success" feedback is triggered.

#### 6.6. Screen: Envelopes
* **UI:**
  * **Header:** "Envelopes" title. A button to "Add Envelope".
  * **Summary:** A small summary view at the top: "Budgeted," "Spent," "Remaining."
  * **Envelope List:** A vertical list of large Envelope Cards.
    * **Envelope Card:** Displays Icon/Emoji, Name, Remaining Amount, Budgeted Amount, and a thick, satisfying progress bar. A small indicator can show if it's over-budget.
* **Animations & UX:**
  * **Tapping a Card:** Triggers a shared element transition. The tapped Envelope Card animates (`withTiming`) to become the header of the "Envelope Detail" screen. The other cards fade out.
  * **Reordering (Pro Feature):** Long-pressing an envelope card allows it to be dragged and reordered. The list will animate smoothly to make space for the dragged item (`LayoutAnimation`).

#### 6.7. Screen: Envelope Detail
* **UI:**
  * **Header (The Shared Element):** The expanded Envelope Card, now serving as the screen's header. It shows the same info but larger.
  * **Transaction List:** A chronological list of all transactions assigned to this envelope.
* **Animations & UX:**
  * The back navigation will reverse the shared element transition, shrinking the header back into its card position on the Envelopes screen.

#### 6.8. Screen: Savings Challenges
* **UI:**
  * **Header:** "Challenges". Button to "Start a New Challenge".
  * **Active Challenges:** A grid or list of the user's active challenges.
  * **Challenge "Poster" Card:** A visually rich card representing the challenge. For a 52-week challenge, it could be a grid of 52 boxes.
* **Interaction:**
  * Tapping a challenge opens a full-screen, detailed "Poster View".
  * **Poster View:** The user can tap on a box (e.g., "Week 5") to mark it as complete. This prompts them to confirm they want to create the corresponding transaction.
  * **Share Button:** Generates a clean image of the poster (with current progress) and opens the native share sheet.
* **Animations:**
  * **Marking Progress:** Tapping a box to complete it triggers a satisfying animation. A checkmark draws itself inside the box, and a short burst of confetti erupts from the center of the box (`react-native-skia` or a Lottie animation).

#### 6.9. Screen: What-If Simulator (Pro Feature)
* **UI:**
  * A clean interface with a "Goal" section at the top (e.g., "Save $5,000 for Vacation").
  * **Interactive Chart:** A line chart (using Skia) shows the projected savings balance over time based on current settings.
  * **Control Panel:** A section below the chart with sliders and inputs.
    * **Slider:** "Extra monthly savings".
    * **Input:** "One-time contribution".
    * **Selector:** "Apply to which envelopes?".
* **Animations & UX:**
  * **Real-time Feedback:** As the user drags a slider, the line on the chart animates in real-time to its new projected path. A text label like "Goal reached by: Dec 2024" also updates instantly. The animation will be driven by `useAnimatedStyle` and `withSpring` for a buttery-smooth, connected feel between the input and the chart.

#### 6.10. Screen: Settings
* **UI:** A standard grouped list view.
* **Options:**
  * **Upgrade to Pro:** Takes user to a well-designed paywall screen explaining the benefits.
  * **Manage Accounts & Envelopes.**
  * **Security:** Toggle for Face ID / Passcode (Pro).
  * **Appearance:** Light/Dark/System theme selector.
  * **App Icon (Pro):** Choose from a selection of alternative app icons.
  * **Data:** Export Data (Pro), Import Data, Erase All Data (with multiple confirmations).

---

### 7. Accessibility (A11y)
* **VoiceOver/TalkBack:** All interactive elements will have `accessibilityLabel` and `accessibilityHint` props.
* **Dynamic Type:** The app will respect the user's system font size settings.
* **Color Contrast:** All text and UI elements will meet WCAG AA contrast ratio standards.
* **Reduced Motion:** App animations will be disabled if the user has "Reduce Motion" enabled in their system settings.

---

### 8. Security
* **Local Data Encryption:** While data is stored locally, WatermelonDB uses SQLite, which can be encrypted. We will use a library like `react-native-sqlcipher-storage` to ensure the database file itself is encrypted on the device.
* **Passcode/Biometrics (Pro):** The app will not store the user's passcode or biometric data. It will use the iOS Keychain and LocalAuthentication framework to securely prompt for authentication.

