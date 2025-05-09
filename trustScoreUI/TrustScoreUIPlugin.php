<?php

namespace APP\plugins\generic\trustScoreUI;

use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use APP\core\Application;
use APP\template\TemplateManager;
use APP\facades\Repo;
use PKP\security\Role;

use PKP\user\Collector;
use PKP\submission\reviewAssignment\ReviewAssignmentDAO;






class TrustScoreUIPlugin extends GenericPlugin {
    
    public function register($category, $path, $mainContextId = null) {

        if (!parent::register($category, $path, $mainContextId)) return false;

        if ($this->getEnabled($mainContextId)) {

            // Injecting tab component placeholder
            Hook::add('Template::Workflow', function($hookName, $args) {

            
               
                // $userIds = Repo::user()
                // ->getCollector()
                // // ->filterByStatus([Collector::STATUS_DISABLED])
                // ->filterByRoleIds([Role::ROLE_ID_REVIEWER])
                // ->getMany();

                // error_log(print_r($userIds));



                $user = Application::get()->getRequest()->getUser();
                $context = Application::get()->getRequest()->getContext();

                $userGroups = Repo::userGroup()
                ->getCollector()
                ->filterByUserIds([$user->getId()])
                ->filterByContextIds([$context->getId()])
                ->filterByRoleIds([Role::ROLE_ID_MANAGER]) // 16 = Journal Editor
                ->getMany();
                

                $isEditor = !$userGroups->isEmpty();
                // error_log(print_r($isEditor));
               

              
                if (!$isEditor) {
                    return false; // Don't add the tab if the user is not an editor
                }

                $templateMgr = $args[1];
                $output = & $args[2];
        
                $output .= $templateMgr->fetch($this->getTemplateResource('tab.tpl'));
                // Permit other plugins to continue interacting with this hook
                return false;

            });

            Hook::add('TemplateManager::display', [$this, 'callbackTemplateManagerDisplay']);


            $request = Application::get()->getRequest();
            $templateMgr = TemplateManager::getManager($request);
            $this->addJavaScript($request, $templateMgr);
        
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
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/public/build/trust-scores.iife.js',
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
        $templateMgr = $args[0];
        $request = & \Registry::get('request');
        $router = $request->getRouter();
        $dispatcher = $request->getDispatcher();
        $context = $request->getContext();

        $user = $request->getUser();

        // error_log('TrustScoreUIPlugin::callbackTemplateManagerDisplay called');

        // error_log(print_r('TrustScoreUIPlugin::callbackTemplateManagerDisplay requestedOp: ' . $request->getRequestedOp()));

        // error_log(print_r($request->getRequestedPage() . ' '));

      
        
        if ($request->getRequestedPage() !== 'workflow') {
            return false; // Only inject into the workflow page
        }
        

        $submission = $templateMgr->getTemplateVars('submission');
        if ($submission) {
            $submissionId = $submission->getId();
            // error_log('Submission ID (from template var): ' . $submissionId);
        }

        // error_log(print_r($submission, true));
        
        // Get Authors
        // $authors = $submission->getAuthors(); // Returns an array of Author objects

        // foreach ($authors as $author) {
        //     error_log(print_r($author, true));
        //     $fullName = $author->getFullName();
        //     $email = $author->getEmail();
            
        //     // ... add your trust score logic here
        // }

        // Get Reviewers
        // $reviewAssignmentDao = \DAORegistry::getDAO('ReviewAssignmentDAO');
        // $reviewAssignments = $reviewAssignmentDao->getBySubmissionId($submissionId)->toArray();

        // $userDao = \DAORegistry::getDAO('UserDAO');

        // Map authors and reviewers to trust score data
        // $authorScores = array_map(function($author) {
        //     return [
        //         'name' => $author->getFullName(),
        //         'score' => rand(70, 100), // Placeholder; replace with real logic
        //     ];
        // }, $authors);

        // $reviewerScores = array_map(function($assignment) use ($userDao) {
        //     $reviewer = $userDao->getById($assignment->getReviewerId());
        //     return [
        //         'name' => $reviewer ? $reviewer->getFullName() : 'Unknown Reviewer',
        //         'score' => rand(60, 95), // Placeholder
        //     ];
        // }, $reviewAssignments);



        // Get submission
        $submission = Repo::submission()->get($submissionId);
        $publication = $submission->getCurrentPublication();

        // Get authors
        $authors = $publication->getData('authors'); // returns Author[] array
        // error_log(print_r($authors));
        foreach ($authors as $author) {
            echo 'AUTHOR: ' . $author->getFullName() . ' (' . $author->getEmail() . ')' . "<br>\n";
        }

        
       
        // Get reviewers

        // Get DAO
        $reviewAssignmentDao = \DAORegistry::getDAO('ReviewAssignmentDAO'); /** @var ReviewAssignmentDAO $reviewAssignmentDao */

        // Retrieve all review assignments for a submission
        $reviewAssignments = $reviewAssignmentDao->getBySubmissionId($submission->getId());

        foreach ($reviewAssignments as $reviewAssignment) {
            $reviewerId = $reviewAssignment->getReviewerId();
            $reviewer = Repo::user()->get($reviewerId);

            echo 'REVIEWER: ' . $reviewer->getFullName() . ' (' . $reviewer->getEmail() . ')' . "<br>\n";
        }
       




        // Inject data into Vue
        $templateMgr->setState([
            'trustScores' => [
                // 'authors' => $authorScores,
                // 'reviewers' => $reviewerScores,
                'authors' => [
                    ['id' => 101, 'name' => 'Author A', 'score' => 78],
                    ['id' => 102, 'name' => 'Author B', 'score' => 91],
                ],
                'reviewers' => [
                    ['id' => 201, 'name' => 'Reviewer X', 'score' => 65],
                    ['id' => 202, 'name' => 'Reviewer Y', 'score' => 82],
                ]
                
            ],
        ]);
        
        
        // error_log('TrustScoreUIPlugin::callbackTemplateManagerDisplay finished');
        // Permit other plugins to continue interacting with this hook
        return false;
    }


    /**
     * Get the display name of this plugin.
     * @return String
     */
    public function getDisplayName() {
        // return __('plugins.generic.backendUiExample.displayName');
        return 'Bona Fide UI Plugin';
    }


    /**
     * Get a description of the plugin.
     */
    public function getDescription() {
        // return __('plugins.generic.backendUiExample.description');
        return 'This is a Bona Fide plugin with trust score GUI';
    }
}