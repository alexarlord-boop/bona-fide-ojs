<?php

namespace APP\plugins\generic\trustScoreUI;

use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use APP\core\Application;
use APP\template\TemplateManager;
use APP\facades\Repo;
use PKP\security\Role;

use PKP\user\Collector;






class TrustScoreUIPlugin extends GenericPlugin {
    
    public function register($category, $path, $mainContextId = null) {

        if (!parent::register($category, $path, $mainContextId)) return false;

        if ($this->getEnabled($mainContextId)) {

            // This hook is removed in OJS 3.5
            // Hook::add('Template::Workflow', function($hookName, $args) {

            
               
            //     // $userIds = Repo::user()
            //     // ->getCollector()
            //     // // ->filterByStatus([Collector::STATUS_DISABLED])
            //     // ->filterByRoleIds([Role::ROLE_ID_REVIEWER])
            //     // ->getMany();

            //     // error_log(print_r($userIds));



            //     $user = Application::get()->getRequest()->getUser();
            //     $context = Application::get()->getRequest()->getContext();

            //     $userGroups = Repo::userGroup()
            //     ->getCollector()
            //     ->filterByUserIds([$user->getId()])
            //     ->filterByContextIds([$context->getId()])
            //     ->filterByRoleIds([Role::ROLE_ID_MANAGER]) // 16 = Journal Editor
            //     ->getMany();
                

            //     $isEditor = !$userGroups->isEmpty();
            //     // error_log(print_r($isEditor));
               

              
            //     if (!$isEditor) {
            //         return false; // Don't add the tab if the user is not an editor
            //     }

            //     $templateMgr = $args[1];
            //     $output = & $args[2];
        
            //     $output .= $templateMgr->fetch($this->getTemplateResource('tab.tpl'));
            //     // Permit other plugins to continue interacting with this hook
            //     return false;

            // });

            Hook::add('TemplateManager::display', [$this, 'callbackTemplateManagerDisplay']);
            Hook::add('PageHandler::display', [$this, 'callbackPageHandlerDisplay']);


            $request = Application::get()->getRequest();
            $templateMgr = TemplateManager::getManager($request);
            $this->addJavaScript($request, $templateMgr);
            // $templateMgr->addStyleSheet('backendUiExampleStyle',"{$request->getBaseUrl()}/{$this->getPluginPath()}/public/build/trustscoreui.css", [
            //     'contexts' => ['backend']
            // ] );
        
        }

        return true;

    }


    /**
     * Add JavaScript to the template manager.
     * @param $request Request
     * @param $templateMgr TemplateManager
     */
    public function addJavaScript($request, $templateMgr) {
        $templateMgr->addJavaScript(
            'trustScoreComponent',
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/public/build/build.iife.js',
            [
                'inline' => false,
                'contexts' => ['backend'],
                'priority' => TemplateManager::STYLE_SEQUENCE_LAST
            ]
            
        );

       
    }


    /*
     * Callback function for the TemplateManager::display hook.
     * This function is called when the template manager is about to display a template.
     * It allows us to inject our Vue component and data into the template.
     */
    public function  callbackTemplateManagerDisplay($hookName, $args) {
        error_log('TrustScoreUIPlugin: callbackTemplateManagerDisplay called');
        
        $templateMgr = $args[0];
        $request = & \Registry::get('request');
        $router = $request->getRouter();
        $dispatcher = $request->getDispatcher();
        $context = $request->getContext();

        $user = $request->getUser();

        error_log('TrustScoreUIPlugin: Requested page: ' . $request->getRequestedPage());
        error_log('TrustScoreUIPlugin: Requested op: ' . $request->getRequestedOp());
        error_log('TrustScoreUIPlugin: GET parameters: ' . print_r($_GET, true));
        error_log('TrustScoreUIPlugin: Template vars: ' . print_r($templateMgr->getTemplateVars(), true));

        // Check if we're on the editorial dashboard
        if ($request->getRequestedPage() !== 'dashboard' || $request->getRequestedOp() !== 'editorial') {
            error_log('TrustScoreUIPlugin: Not on editorial dashboard, skipping');
            return false;
        }
        
        // Check if we have a specific submission ID in the URL
        $submissionId = $request->getUserVar('workflowSubmissionId');
        if (!$submissionId) {
            $submissionId = $request->getUserVar('submissionId');
        }
        if (!$submissionId) {
            $submissionId = $_GET['workflowSubmissionId'] ?? $_GET['submissionId'] ?? null;
        }
        
        if (!$submissionId) {
            error_log('TrustScoreUIPlugin: No submission ID found, skipping data injection');
            return false; // Don't inject data if no specific submission
        }
        
        error_log('TrustScoreUIPlugin: Found submission ID: ' . $submissionId . ', injecting data');
        
        // Use the helper method to inject data
        $this->injectTrustScoresData($templateMgr, $request);
        
        // Permit other plugins to continue interacting with this hook
        return false;
    }

    /*
     * Callback function for the PageHandler::display hook.
     * This function is called when the page handler is about to display a page.
     * It allows us to inject our Vue component and data into the template.
     */
    public function callbackPageHandlerDisplay($hookName, $args) {
        error_log('TrustScoreUIPlugin: callbackPageHandlerDisplay called');
        
        $page = $args[0];
        $request = & \Registry::get('request');
        
        error_log('TrustScoreUIPlugin: Page class: ' . get_class($page));
        error_log('TrustScoreUIPlugin: Requested page: ' . $request->getRequestedPage());
        error_log('TrustScoreUIPlugin: Requested op: ' . $request->getRequestedOp());
        
        // Check if we're on the editorial dashboard
        if ($request->getRequestedPage() !== 'dashboard' || $request->getRequestedOp() !== 'editorial') {
            error_log('TrustScoreUIPlugin: Not on editorial dashboard in PageHandler, skipping');
            return false;
        }
        
        // Check if we have a specific submission ID in the URL
        $submissionId = $request->getUserVar('workflowSubmissionId');
        if (!$submissionId) {
            $submissionId = $request->getUserVar('submissionId');
        }
        if (!$submissionId) {
            $submissionId = $_GET['workflowSubmissionId'] ?? $_GET['submissionId'] ?? null;
        }
        
        if (!$submissionId) {
            error_log('TrustScoreUIPlugin: No submission ID found in PageHandler, skipping data injection');
            return false; // Don't inject data if no specific submission
        }
        
        error_log('TrustScoreUIPlugin: Found submission ID in PageHandler: ' . $submissionId . ', injecting data');
        
        // Try to get the template manager from the page
        if (method_exists($page, 'getTemplateManager')) {
            $templateMgr = $page->getTemplateManager($request);
            if ($templateMgr) {
                error_log('TrustScoreUIPlugin: Got template manager from page');
                $this->injectTrustScoresData($templateMgr, $request);
            }
        }
        
        return false;
    }
    
    /**
     * Helper method to inject trust scores data into template
     */
    private function injectTrustScoresData($templateMgr, $request) {
        $context = $request->getContext();
        $user = $request->getUser();

        // Get submission ID from URL parameters (already validated in callbacks)
        $submissionId = $request->getUserVar('workflowSubmissionId');
        if (!$submissionId) {
            $submissionId = $request->getUserVar('submissionId');
        }
        if (!$submissionId) {
            $submissionId = $_GET['workflowSubmissionId'] ?? $_GET['submissionId'] ?? null;
        }
        
        error_log('TrustScoreUIPlugin: Using submission ID: ' . $submissionId);

        // Get submission
        $submission = Repo::submission()->get($submissionId);
        if (!$submission) {
            error_log('TrustScoreUIPlugin: Could not load submission with ID: ' . $submissionId);
            return;
        }
        
        $publication = $submission->getCurrentPublication();
        if (!$publication) {
            error_log('TrustScoreUIPlugin: Could not load publication for submission: ' . $submissionId);
            return;
        }

        // Get authors
        $author_list = [];
        $authors = $publication->getData('authors'); // returns Author[] array
        error_log('TrustScoreUIPlugin: Found ' . count($authors) . ' authors in publication');
        foreach ($authors as $author) {
            $author_list[] = [
                'id' => $author->getId(),
                'name' => $author->getFullName(),
                'email' => $author->getEmail(),
                'orcid' => $author->getData('orcid'),
                'affiliation' => $author->getData('affiliation') ?? '', // Handle null affiliation
                'score' => 0, // Placeholder; replace with real logic
            ];
        }

        // Get reviewers using the Repository pattern (OJS 3.5)
        $reviewer_list = [];
        
        try {
            // Use the review assignment repository
            $reviewAssignments = Repo::reviewAssignment()
                ->getCollector()
                ->filterBySubmissionIds([$submission->getId()])
                ->getMany();
            
            error_log('TrustScoreUIPlugin: Found ' . count($reviewAssignments) . ' review assignments for submission ' . $submission->getId());
            
            $reviewer_dict = [];
            foreach ($reviewAssignments as $reviewAssignment) {
                $reviewerId = $reviewAssignment->getReviewerId();
                // Skip if reviewerId already processed
                if (isset($reviewer_dict[$reviewerId])) {
                    continue; // Skip this reviewer if already processed
                }
                // Mark this reviewerId as processed
                $reviewer_dict[$reviewerId] = true;
                // Get reviewer user object
                $reviewer = Repo::user()->get($reviewerId);

                error_log('TrustScoreUIPlugin: Processing reviewer ID ' . $reviewerId . ' - Name: ' . ($reviewer ? $reviewer->getFullName() : 'NULL'));
                
                if ($reviewer) {
                    $reviewer_list[] = [
                        'id' => $reviewer->getId(),
                        'name' => $reviewer->getFullName(),
                        'email' => $reviewer->getEmail(),
                        'affiliation' => $reviewer->getData('affiliation') ?? '', // Handle null affiliation
                        'score' => 0, // Placeholder; replace with real logic
                    ];
                }
            }
        } catch (Exception $e) {
            error_log('TrustScoreUIPlugin: Error getting review assignments: ' . $e->getMessage());
            // Continue with empty reviewer list
        }

        error_log('TrustScoreUIPlugin: Final reviewer list count: ' . count($reviewer_list));
        error_log('TrustScoreUIPlugin: Final author list count: ' . count($author_list));

        // Prepare the trust scores data
        $trustScoresData = [
            'journal_title' => $context->getLocalizedName(),
            'submission_id' => $submissionId,
            'submission_title' => $publication->getLocalizedData('title'),
            'authors' => $author_list,
            'reviewers' => $reviewer_list,
            'editor' => [
                'id' => $user->getId(),
                'name' => $user->getFullName(),
                'email' => $user->getEmail(),
            ],
        ];

        // Inject data into Vue using multiple methods for OJS 3.5 compatibility
        $templateMgr->setState([
            'trustScores' => $trustScoresData,
        ]);
        
        // Also assign to template variables for easier access
        $templateMgr->assign('trustScores', $trustScoresData);
        
        // Inject as a global JavaScript variable - use proper JavaScript format
        $templateMgr->addJavaScript(
            'trustScoresData',
            'window.trustScoresData = ' . json_encode($trustScoresData) . '; console.log("TrustScoreUIPlugin: Global trustScoresData injected:", window.trustScoresData);',
            [
                'inline' => true,
                'contexts' => ['backend'],
                'priority' => TemplateManager::STYLE_SEQUENCE_LAST
            ]
        );
        
        error_log('TrustScoreUIPlugin: Template state set with trustScores data');
        error_log('TrustScoreUIPlugin: Authors in state: ' . count($author_list));
        error_log('TrustScoreUIPlugin: Reviewers in state: ' . count($reviewer_list));
        
        // Also inject directly into the page head for immediate availability
        $headData = 'if (typeof window.trustScoresData === "undefined") { window.trustScoresData = ' . json_encode($trustScoresData) . '; console.log("TrustScoreUIPlugin: trustScoresData set in head:", window.trustScoresData); }';
        
        $templateMgr->addHeader('trustScoresDataHead', '<script type="text/javascript">' . $headData . '</script>');
    }

    /**
     * Get the display name of this plugin.
     * @return String
     */
    public function getDisplayName() {
        return 'Bona Fide UI Plugin';
    }

    /**
     * Get a description of the plugin.
     */
    public function getDescription() {
        return 'Enhances the editorial workflow by displaying trust scores for authors and reviewers directly in the OJS interface.';
    }

    // Helper function to send data to the FastAPI backend
    private function sendToBackend($url, $data) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            error_log('cURL error: ' . curl_error($ch));
            curl_close($ch);
            return null;
        }

        curl_close($ch);
        return json_decode($response, true);
    }
}