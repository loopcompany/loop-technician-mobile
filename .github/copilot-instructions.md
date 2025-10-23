# Copilot Instructions for LoopTech

## Project Overview
This is a React Native service management app built with Expo, focusing on IT service delivery and technician workflows. The app uses Redux Toolkit for state management, React Navigation for routing, and supports bilingual functionality (English/Persian).

## Architecture & Structure

### Core Tech Stack
- **Framework**: React Native with Expo (~53.0)
- **State Management**: Redux Toolkit with organized slices
- **Navigation**: React Navigation v7 (Native Stack Navigator)
- **Styling**: StyleSheet with centralized theme system
- **API**: Axios with centralized URL configuration
- **Internationalization**: react-i18next with JSON locale files

### Key Directories
- `screens/`: Main app screens, organized by feature area
  - `auth/`: Authentication flows (Login, SignIn, Reset Password)
  - `performservice/`: Service technician workflows (primary business logic)
- `components/`: Reusable UI components with consistent theming
- `slices/`: Redux state slices (auth, language, user, etc.)
- `services/`: API configuration and endpoints
- `theme/Color.js`: Centralized color palette with opacity functions
- `styles/`: Global styling patterns (Styles.js, NewStyles.js)
- `helpers/Common.js`: Utility functions for platform detection, formatting

### State Management Patterns
Redux store is organized into focused slices:
```javascript
// Standard slice pattern used throughout
const slice = createSlice({
  name: 'feature',
  initialState: { /* minimal state */ },
  reducers: { /* simple actions */ }
});
```
- `authSlice`: Token-based authentication state
- `languageSlice`: Current language ('en'/'fa') selection
- Access via `useSelector(state => state.sliceName.property)`

### Styling System
Two-tiered styling approach:
- **Theme Colors**: Use `themeColor0-14` from Color.js with `.bgColor(opacity)` functions
- **Common Styles**: Import from `NewStyles.js` for consistent patterns
- **Component Styles**: Local StyleSheet with theme color integration
- **Shadows/Borders**: Predefined in NewStyles (`.shadow`, `.border10`, `.center`)

## Development Patterns

### Screen Structure
All screens follow this pattern:
```javascript
export default function ScreenName({ navigation }) {
  const { t } = useTranslation();           // For i18n
  const userToken = useSelector(state => state.auth.token);
  
  // Component logic
  return (
    <View style={NewStyles.wrapper}>
      <CustomStatusBar />
      {/* Screen content */}
      <Footer />
    </View>
  );
}
```

### Navigation
- All navigation configured in `App.js` with `headerShown: false`
- Screen names use PascalCase (e.g., "FolderScreen", "LoginScreen")
- Pass data via navigation params: `navigation.navigate("Screen", { param: value })`

### API Integration
- Base URLs configured in `services/URL.js`
- Use axios for HTTP requests with centralized error handling
- Common pattern: `showToastOrAlert()` from helpers/Common.js for user feedback
- AsyncStorage for persistent data (user tokens, preferences)

### Component Patterns
- **Button.js**: Standard button with loading states and theme integration
- **CustomStatusBar.js**: Consistent status bar styling across screens
- **Footer.js**: Common navigation footer
- All components use theme colors and NewStyles imports

### Internationalization
- Translation keys in `assets/locales/en.json` and `fa.json`
- Use `const { t } = useTranslation()` hook
- Keys should be descriptive: "Failed to send code. Please make sure..."

### Platform Considerations
- RTL support disabled globally: `I18nManager.forceRTL(false)`
- Platform-specific styling in theme system
- Responsive design using `deviceWidth`/`deviceHeight` from Common.js

## Development Commands
```bash
expo start          # Start development server
expo start --android # Android-specific build
expo start --ios     # iOS-specific build
```

## File Naming Conventions
- Screens: PascalCase with "Screen" suffix
- Components: PascalCase without suffix
- Slices: camelCase with "Slice" suffix
- Styles: PascalCase (Styles.js, NewStyles.js)
- Services: PascalCase (Api.js, URL.js)

## Service Management Focus
The app's core functionality centers around IT service workflows in `screens/performservice/`:
- Device management (status, model info, hardware issues)
- Service completion tracking and attendance
- Parts expenses and technical issue documentation
- User history and laptop delivery/dispatch workflows

When adding new features, maintain consistency with existing patterns and ensure proper integration with the Redux state management and navigation systems.