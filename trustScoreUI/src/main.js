import TrustScoreUI from "./components/TrustScoreUI.vue";
import Sidebar from "./components/Sidebar.vue";
import SampleComponent from "./components/SampleComponent.vue";
import Settings from "./components/Settings.vue";

pkp.registry.registerComponent('TrustScoreUI', TrustScoreUI);
pkp.registry.registerComponent('Sidebar', Sidebar);
pkp.registry.registerComponent('SampleComponent', SampleComponent);
pkp.registry.registerComponent('Settings', Settings);

const { useCurrentUser } = pkp.modules.useCurrentUser;
const cu = useCurrentUser();
const isUserEditor = cu?.hasCurrentUserAtLeastOneRole([16]); // 16=Main Editor
const haveBackend = true // Assuming the backend is available as service

if (haveBackend && isUserEditor) {
    pkp.registry.storeExtend('workflow', (piniaContext) => {
	const store = piniaContext.store;
    console.log(store);


	store.extender.extendFn('getMenuItems', (items) => {
        items.push(

            {
                key: 'trustScoreTab',
                label: 'Bona Fide',
                title: 'Bona Fide',
                icon: 'AnonymousReview',
                items: [
                    // Scores tab
                    {
                        key: 'overview',
                        label: 'Overview',
                        state: {
                            primaryMenuItem: 'trustScoreTab',
                            secondaryMenuItem: 'overview',
                            title: 'Bona Fide: Overview'
                        }
                    },
                    // Settings tab
                    {
                        key: 'settings',
                        label: 'Settings',
                        state: {
                            primaryMenuItem: 'trustScoreTab',
                            secondaryMenuItem: 'settings',
                            title: 'Bona Fide: Settings'
                        }
                    }
                ]
            },

        );
        return items;
    });

    store.extender.extendFn('getPrimaryItems', (items) => {

        // Scores tab injection
        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
            items.push({
                key: 'overview',
                component: 'TrustScoreUI',
                props: {
                    submissionId: store.submissionId,
                }
            });
        }
        // Settings tab injection
        if (store.selectedMenuState.secondaryMenuItem === 'settings') {
            items.push({
                key: 'settings',
                component: 'Settings',
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
                    submission: store.submission,
                }
            });
        }
        return items;

    });
//    store.extender.extendFn('getPrimaryControlsRight', (items) => {
//        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
//            items.push({
//                key: 'trustScoreOverview',
//                label: 'Bona Fide Overview',
//                component: 'SampleComponent',
//                props: {
//                    submissionId: store.submissionId,
//                }
//            });
//        }
//        return items;
//
//    });
//    store.extender.extendFn('getActionItems', (items) => {
//        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
//            items.push({
//                key: 'trustScoreOverview',
//                label: 'Bona Fide Overview',
//                component: 'SampleComponent',
//                props: {
//                    submissionId: store.submissionId,
//                }
//            });
//        }
//        return items;
//
//    });
//    store.extender.extendFn('getSecondaryItems', (items) => {
//        if (store.selectedMenuState.secondaryMenuItem === 'overview') {
//            items.push({
//                key: 'trustScoreOverview',
//                label: 'Bona Fide Overview',
//                component: 'SampleComponent',
//                props: {
//                    submissionId: store.submissionId,
//                }
//            });
//        }
//        return items;
//
//    });

});
} else {
    console.warn('TrustScoreUI plugin is only available for editors.');
}