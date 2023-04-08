import Button from './Button';

export default function hideRecentlyCompleted() {
    return new Button({
        buttonInjectedAt: '.recently-completed-wrapper h3',
        elementToHide: '.recently-completed-list',
        settingsProperty: 'recentlyCompletedHidden'
    });
}
