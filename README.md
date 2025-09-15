# Brandon's LinkTree

A simple, iOS-optimized Progressive Web App that displays a collection of applications with their icons and names. Users can tap on any app to navigate to its URL.

## Features

- **iOS-native design** with system fonts and native appearance
- **Progressive Web App** with offline support and installability
- **Tab navigation** between Apps and About sections
- **Touch-friendly interface** optimized for mobile devices
- **Accessibility support** including keyboard navigation and screen readers
- **Dark mode support** that respects system preferences
- **Responsive design** that works on iPhone, iPad, and desktop
- **Service worker caching** for fast loading and offline functionality

## Project Structure

```
/
├── index.html          # Main entry point
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── icon.jpeg          # App icon (180x180px)
├── css/
│   └── styles.css     # Main stylesheet
├── js/
│   ├── app.js         # Main application logic
│   └── data.js        # App data configuration
└── icons/             # App icons directory
    ├── storystack.jpg
    ├── easydice.png
    └── ...
```

## Getting Started

1. **Clone or download** the repository
2. **Add your app icons** to the `icons/` directory (64x64px recommended)
3. **Update app data** in `js/data.js` with your applications:

```javascript
const appsData = [
    {
        name: "Your App Name",
        icon: "./icons/your-app-icon.jpg",
        url: "https://your-app-url.com",
        description: "Brief description of your app"
    }
    // Add more apps...
];
```

4. **Serve the files** using a local web server:
   - Python: `python -m http.server 8000`
   - Node.js: `npx serve .`
   - PHP: `php -S localhost:8000`

5. **Open in browser** and navigate to `http://localhost:8000`

## PWA Installation

### On iOS Safari:
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add" to install

### On Android Chrome:
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. Tap "Add" to install

## Customization

### Adding New Apps
Edit `js/data.js` and add new entries to the `appsData` array:

```javascript
{
    name: "App Name",
    icon: "./icons/app-icon.jpg",
    url: "https://app-url.com",
    description: "App description (optional)"
}
```

### Updating Styles
Modify `css/styles.css` to customize the appearance. The CSS uses iOS design system variables for consistent theming.

### Changing App Icon
Replace `icon.jpeg` with your own 180x180px icon for the PWA.

## Technical Details

- **Vanilla JavaScript** - No frameworks or dependencies
- **CSS Grid & Flexbox** - Modern responsive layout
- **Service Worker** - Caches static assets and app icons
- **iOS Safe Area** - Proper support for devices with notches
- **Touch Events** - Optimized for mobile interaction
- **Error Handling** - Graceful fallbacks for missing icons and network issues

## Browser Support

- **iOS Safari** 12+
- **Chrome** 70+
- **Firefox** 65+
- **Edge** 79+

## Performance

- **First Load**: ~50KB total (HTML, CSS, JS)
- **Subsequent Loads**: Instant loading from cache
- **Icons**: Lazy loaded with fallback SVG placeholders
- **Offline**: Full functionality when cached

## Development

To modify the app:

1. Edit the relevant files
2. Test in multiple browsers/devices
3. Update the cache version in `sw.js` when making changes
4. Test PWA functionality using browser dev tools

## License

This project is open source and available under the [MIT License](LICENSE).