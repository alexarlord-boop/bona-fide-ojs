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

    // Adds content to each main tab in the workflow after content
    // store.extender.extendFn('getPrimaryItems', (items) => {
    //     items.push({
    //         key: 'trustScoreTab',
    //         component: 'TrustScoreUI',
    //         props: () => ({
    //             submissionId: store.submission.id,
    //         }),
    //     });
    //     return items;
    // });

    // Adds content to each main tab in the workflow before content
    // store.extender.extendFn('getPrimaryControlsLeft', (items) => {
    //     items.push({
    //         key: 'trustScoreTab',
    //         label: 'Trust Score',
    //         component: 'TrustScoreUI',
    //         props: () => ({
    //             submissionId: store.submission.id,
    //         }),
    //     });
    //     return items;
    // }
    // );


	// // Отрисовываем контент при выборе этой вкладки
	// store.extender.extendFn('getPrimaryItems', (items) => {
    //     console.log('getPrimaryItems called');
    //     console.log(items);
	// 	// items.push({
	// 	// 	key: 'trustScoreTab',
	// 	// 	component: 'TrustScoreUI',
	// 	// 	props: () => {
    //     //         console.log('submissionId:', store.submission?.id);
    //     //         return { submissionId: store.submission?.id };
    //     //       }
	// 	// });
	// 	// return items;
	// });

    // store.extender.extendFn('getPrimaryItems', (items) => {
    //     items.push({
    //         key: 'trustScoreTab',
    //         component: 'TrustScoreUI',
    //         renderOnlyIfSelected: true, // 👈 иногда нужно, если не работает по key
    //         props: () => ({
    //             submissionId: store.submission.id,
    //         }),
    //     });
    //     return items;
    // });


});