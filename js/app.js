class BrandonLinkTreeApp {
    constructor() {
        this.currentTab = 'apps';
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.loadApps();
        this.setupAboutTab();
        this.registerServiceWorker();
        this.setupKeyboardNavigation();
        this.setupErrorHandling();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(targetTab, tabButtons, tabContents);
            });
        });
    }

    switchTab(targetTab, tabButtons, tabContents) {
        this.currentTab = targetTab;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');

        this.announceTabChange(targetTab);
    }

    announceTabChange(tabName) {
        const announcement = `Switched to ${tabName} tab`;
        const ariaLive = document.createElement('div');
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        ariaLive.className = 'sr-only';
        ariaLive.textContent = announcement;
        document.body.appendChild(ariaLive);

        setTimeout(() => {
            document.body.removeChild(ariaLive);
        }, 1000);
    }

    async loadApps() {
        const appsList = document.getElementById('apps-list');

        if (!appsData || appsData.length === 0) {
            this.showEmptyState(appsList);
            return;
        }

        try {
            appsList.innerHTML = '';

            appsData.forEach((app, index) => {
                const appElement = this.createAppElement(app, index);
                appsList.appendChild(appElement);
            });

            this.preloadIcons();
        } catch (error) {
            console.error('Error loading apps:', error);
            this.showErrorState(appsList, 'Failed to load apps');
        }
    }

    createAppElement(app, index) {
        const appItem = document.createElement('div');
        appItem.className = 'app-item';
        appItem.setAttribute('tabindex', '0');
        appItem.setAttribute('role', 'button');
        appItem.setAttribute('aria-label', `Open ${app.name}${app.description ? `: ${app.description}` : ''}`);

        const icon = document.createElement('img');
        icon.className = 'app-icon loading';
        icon.alt = `${app.name} icon`;
        icon.onerror = () => this.handleIconError(icon);
        icon.onload = () => icon.classList.remove('loading');

        this.loadIconWithFallback(icon, app.icon, app.name);

        const appInfo = document.createElement('div');
        appInfo.className = 'app-info';

        const appName = document.createElement('div');
        appName.className = 'app-name';
        appName.textContent = app.name;

        const appDescription = document.createElement('div');
        appDescription.className = 'app-description';
        appDescription.textContent = app.description || '';

        appInfo.appendChild(appName);
        if (app.description) {
            appInfo.appendChild(appDescription);
        }

        const chevron = document.createElement('div');
        chevron.className = 'app-chevron';
        chevron.innerHTML = '&#8250;';
        chevron.setAttribute('aria-hidden', 'true');

        appItem.appendChild(icon);
        appItem.appendChild(appInfo);
        appItem.appendChild(chevron);

        appItem.addEventListener('click', () => this.openApp(app));
        appItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openApp(app);
            }
        });

        return appItem;
    }

    async loadIconWithFallback(imgElement, iconPath, appName) {
        try {
            imgElement.src = iconPath;
        } catch (error) {
            this.handleIconError(imgElement);
        }
    }

    handleIconError(imgElement) {
        imgElement.classList.remove('loading');
        imgElement.src = 'data:image/svg+xml;base64,' + btoa(`
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="14" fill="#F2F2F7"/>
                <path d="M32 20C25.925 20 21 24.925 21 31C21 37.075 25.925 42 32 42C38.075 42 43 37.075 43 31C43 24.925 38.075 20 32 20ZM32 38C28.1 38 25 34.9 25 31C25 27.1 28.1 24 32 24C35.9 24 39 27.1 39 31C39 34.9 35.9 38 32 38Z" fill="#8E8E93"/>
                <path d="M32 26.5C33.933 26.5 35.5 28.067 35.5 30C35.5 31.933 33.933 33.5 32 33.5C30.067 33.5 28.5 31.933 28.5 30C28.5 28.067 30.067 26.5 32 26.5Z" fill="#8E8E93"/>
            </svg>
        `);
        imgElement.alt = 'App icon placeholder';
    }

    preloadIcons() {
        appsData.forEach(app => {
            const img = new Image();
            img.src = app.icon;
        });
    }

    async openApp(app) {
        try {
            this.showLoadingOverlay();

            await this.delay(800);

            if (this.isValidUrl(app.url)) {
                window.location.href = app.url;
            } else {
                throw new Error('Invalid URL');
            }
        } catch (error) {
            this.hideLoadingOverlay();
            console.error('Error opening app:', error);
            this.showErrorMessage(`Failed to open ${app.name}`);
        }
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    showLoadingOverlay() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoadingOverlay() {
        this.loadingOverlay.classList.add('hidden');
    }

    setupAboutTab() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleDateString();
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📱</div>
                <p>No apps available</p>
            </div>
        `;
    }

    showErrorState(container, message) {
        container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }

    showErrorMessage(message) {
        alert(message);
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully:', registration);

                registration.addEventListener('updatefound', () => {
                    console.log('New service worker version available');
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BrandonLinkTreeApp();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('App is now visible');
    }
});