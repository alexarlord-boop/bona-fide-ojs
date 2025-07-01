import TrustScoreUI from "./components/TrustScoreUI.vue";


// pkp.Vue.component("ExampleTab", ExampleTab);

pkp.registry.registerComponent('TrustScoreUI', TrustScoreUI);

pkp.registry.storeExtend('workflow', (piniaContext) => {
	const store = piniaContext.store;

    console.log(pkp.registry.getPiniaStore('workflow').extender.listExtendableFns());

	// // Добавляем вкладку в левое меню
	store.extender.extendFn('getMenuItems', (items) => {
        items.push({
            key: 'trustScoreTab',
            label: 'Bona Fide',
            icon: 'AnonymousReview', // optional icon (use an existing one from OJS)
            items: [
                {
                    key: 'trustScoreTab_main',
                    label: 'Trust Overview',
                    component: 'TrustScoreUI',
                    title: 'Trust Overview',
                    state: {
                        primaryMenuItem: 'trustScoreTab',
                        title: 'Trust Overview'
                    },
                    props: () => ({
                        submissionId: store.submission.id,
                    }),
                }
            ]
        });
        return items;
    });

    // Adds content to display after tab click
    store.extender.extendFn('getPrimaryItems', (items) => {
        items.push({
            key: 'trustScoreTab', // 👈 этот key должен совпадать с key из menuItems!
            component: 'TrustScoreUI',
            renderOnlyIfSelected: true,
            props: () => ({
                submissionId: store.submission.id,
            }),
        });
        return items;
    });


});