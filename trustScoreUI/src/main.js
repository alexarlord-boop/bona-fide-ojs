import TrustScoreUI from "./components/TrustScoreUI.vue";

pkp.registry.registerComponent('TrustScoreUI', TrustScoreUI);

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
                    label: 'Trust Overview',
                    state: {
                        primaryMenuItem: 'trustScoreTab',
                        secondaryMenuItem: 'overview',
                        title: 'Bona Fide: Trust Overview'
                    }
                }
            ]
        });
        return items;
    });

    store.extender.extendFn('getPrimaryItems', (items) => {
       
        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
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


});