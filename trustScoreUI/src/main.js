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
            console.log('=== Main.js Debug Info ===');
            console.log('Store:', store);
            console.log('Store state:', store.state);
            console.log('Store state keys:', Object.keys(store.state || {}));
            console.log('trustScores in store:', store.state?.trustScores);
            
            // Try to get data from global pkp object
            console.log('Global pkp object:', window.pkp);
            console.log('PKP state:', window.pkp?.state);
            console.log('PKP trustScores:', window.pkp?.state?.trustScores);
            console.log('Global trustScoresData:', window.trustScoresData);
            
            // Get data from multiple sources in order of preference
            let trustScoresData = window.trustScoresData || window.pkp?.state?.trustScores || store.state?.trustScores || {};
            
            // If no data found, try to wait a bit and retry
            if (!trustScoresData || Object.keys(trustScoresData).length === 0) {
                console.log('No trustScores data found, waiting for injection...');
                setTimeout(() => {
                    trustScoresData = window.trustScoresData || window.pkp?.state?.trustScores || store.state?.trustScores || {};
                    console.log('Retry - trustScores data:', trustScoresData);
                }, 100);
            }
            
            console.log('Final trustScores data:', trustScoresData);
            console.log('==========================');
            
            items.push({
                key: 'overview',
                component: 'TrustScoreUI',
                props: {
                    submissionId: store.submissionId,
                    initData: trustScoresData
                }
            });
        }
    
        return items;
    });


});