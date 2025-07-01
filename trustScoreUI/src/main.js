import TrustScoreUI from "./components/TrustScoreUI.vue";


// pkp.Vue.component("ExampleTab", ExampleTab);

pkp.registry.registerComponent('TrustScoreUI', TrustScoreUI);

pkp.registry.storeExtend('workflow', (piniaContext) => {
	const store = piniaContext.store;

	// // Добавляем вкладку в левое меню
	store.extender.extendFn('getMenuItems', (items) => {
        items.push({
            key: 'trustScoreTab',
            label: 'Trust Score',
            items: [
                {
                    key: 'trustScoreTab',
                    label: 'Trust Score',
                    component: 'TrustScoreUI',
                    props: () => ({
                        submissionId: store.submission.id,
                    }),
                   
                },
            ],
        });
        return items;
    });

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