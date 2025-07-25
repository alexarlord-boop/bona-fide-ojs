import TrustScoreUI from "./components/TrustScoreUI.vue";
import Sidebar from "./components/Sidebar.vue";

pkp.registry.registerComponent('TrustScoreUI', TrustScoreUI);
pkp.registry.registerComponent('Sidebar', Sidebar);

pkp.registry.storeExtend('workflow', (piniaContext) => {
	const store = piniaContext.store;

	store.extender.extendFn('getMenuItems', (items) => {
        items.push({
            key: 'trustScoreTab',
            label: 'Bona Fide',
            component: 'TrustScoreUI',
            title: 'Bona Fide',
            icon: 'AnonymousReview',
            items: [
                {
                    key: 'overview',
                    label: 'Overview',
                    state: {
                        primaryMenuItem: 'trustScoreTab',
                        secondaryMenuItem: 'overview',
                        title: 'Bona Fide: Overview'
                    }
                }
            ]
        });
        return items;
    });

    store.extender.extendFn('getPrimaryItems', (items) => {

        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
            const trustScoresData = window.trustScoresData || window.pkp?.state?.trustScores || store.state?.trustScores || {};
            items.push({
                key: 'overview',
                component: 'TrustScoreUI',
                props: {
                    submissionId: store.submissionId,
                }
            });
        }
        return items;
    });

    store.extender.extendFn('getPrimaryControlsLeft', (items) => {
        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
            items.push({
                key: 'trustScoreOverview',
                label: 'Bona Fide Overview',
                component: 'Sidebar',
                props: {
                    submissionId: store.submissionId,
                }
            });
        }
        return items;

    });
    store.extender.extendFn('getPrimaryControlsRight', (items) => {
        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
            items.push({
                key: 'trustScoreOverview',
                label: 'Bona Fide Overview',
                component: 'Sidebar',
                props: {
                    submissionId: store.submissionId,
                }
            });
        }
        return items;

    });
    store.extender.extendFn('getActionItems', (items) => {
        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
            items.push({
                key: 'trustScoreOverview',
                label: 'Bona Fide Overview',
                component: 'Sidebar',
                props: {
                    submissionId: store.submissionId,
                }
            });
        }
        return items;

    });
    store.extender.extendFn('getSecondaryItems', (items) => {
        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
            items.push({
                key: 'trustScoreOverview',
                label: 'Bona Fide Overview',
                component: 'Sidebar',
                props: {
                    submissionId: store.submissionId,
                }
            });
        }
        return items;

    });

});