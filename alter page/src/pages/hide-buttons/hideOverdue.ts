import Button from './Button';

export default function hideOverdue() {
    return new Button({
        buttonInjectedAt: '#overdue-submissions>h4',
        elementToHide: '#overdue-submissions>.upcoming-list',
        settingsProperty: 'overdueHidden'
    });
}
