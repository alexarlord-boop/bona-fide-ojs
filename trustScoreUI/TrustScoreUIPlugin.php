<?php

namespace APP\plugins\generic\trustScoreUI;

use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use APP\core\Application;
use APP\template\TemplateManager;

use PKP\user\UserDAO;
use APP\facades\App;



class TrustScoreUIPlugin extends GenericPlugin {
    
    public function register($category, $path, $mainContextId = null) {
        // if (parent::register($category, $path, $mainContextId)) {
        //     // Add hooks
        //     // Hook::add('Template::SubmissionWizard::Section::Review::Editors', [$this, 'injectTrustScoreScript']);
        //     Hook::add('TemplateManager::display', [$this, 'injectTrustScoreScript']);
        //     return true;
        // }
        // return false;

        if (!parent::register($category, $path, $mainContextId)) return false;

        if ($this->getEnabled($mainContextId)) {

            // DEBUG: template hook and template validation
            Hook::add('TemplateManager::display', function($hookName, $args) {
                $templateMgr = $args[0];
                $template = $args[1];
            
                error_log('Rendering template: ' . $template);
                return false; // allow other handlers to continue
            });
            
             // DEBUG: template hook and template validation
            Hook::add('Template::Workflow', function($hookName, $args) {

                $templateMgr = $args[1];
                $output = & $args[2];
        
                $output .= $templateMgr->fetch($this->getTemplateResource('tab.tpl'));
                // Permit other plugins to continue interacting with this hook
                return false;

            });

            Hook::add('TemplateManager::display', [$this, 'callbackTemplateManagerDisplay']);

             // DEBUG: template hook and template validation
            // Hook::add('Template::Workflow::Publication', function($hookName, $args) {
            //     $output = &$args[2];
            //     $output .= '<script>console.log("Publication section found!");</script><div>publication</div';
            //     return false;
            // });


            $request = Application::get()->getRequest();
            $templateMgr = TemplateManager::getManager($request);
            $this->addJavaScript($request, $templateMgr);
            // $templateMgr->addStyleSheet('backendUiExampleStyle',"{$request->getBaseUrl()}/{$this->getPluginPath()}/public/build/style.css", [
            //     'contexts' => ['backend']
            // ] );

        }

        return true;


    }

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

    public function  callbackTemplateManagerDisplay($hookName, $args)
    {
        $templateMgr = $args[0];
        $request = & \Registry::get('request');
        $router = $request->getRouter();
        $dispatcher = $request->getDispatcher();
        $context = $request->getContext();

        $user = $request->getUser();

        error_log('TrustScoreUIPlugin::callbackTemplateManagerDisplay called');
        error_log('TrustScoreUIPlugin::callbackTemplateManagerDisplay requestedOp: ' . $request->getRequestedOp());


        
        $apiUrl = $router->url(
            $request,
            Application::ROUTE_API,
            $context->getData('urlPath'),
            'trustScore'
        );

        $userId = 5; // or whatever ID you're targeting

/** @var UserDAO $userDao */
$userDao = App::get()->get(UserDAO::class);

$user = $userDao->getById($userId);

if ($user) {
    echo 'Username: ' . $user->getUsername() . PHP_EOL;
    echo 'Email: ' . $user->getEmail() . PHP_EOL;
} else {
    echo "User not found.";
}

       
        // var_dump($templateMgr->getTemplateVars());

        $reviewAssignments = $templateMgr->getTemplateVars('reviewAssignments');
        error_log(print_r($reviewAssignments));
        
        

        $submission = $templateMgr->getTemplateVars('submission');
        if ($submission) {
            $submissionId = $submission->getId();
            error_log('Submission ID (from template var): ' . $submissionId);
        }

        error_log(print_r($submission, true));
        
        // Get Authors
        $authors = $submission->getAuthors(); // Returns an array of Author objects

        foreach ($authors as $author) {
            error_log(print_r($author, true));
            $fullName = $author->getFullName();
            $email = $author->getEmail();
            
            // ... add your trust score logic here
        }

        // Get Reviewers
        $reviewAssignmentDao = \DAORegistry::getDAO('ReviewAssignmentDAO');
        $reviewAssignments = $reviewAssignmentDao->getBySubmissionId($submissionId)->toArray();

        $userDao = \DAORegistry::getDAO('UserDAO');

        // Map authors and reviewers to trust score data
        $authorScores = array_map(function($author) {
            return [
                'name' => $author->getFullName(),
                'score' => rand(70, 100), // Placeholder; replace with real logic
            ];
        }, $authors);

        $reviewerScores = array_map(function($assignment) use ($userDao) {
            $reviewer = $userDao->getById($assignment->getReviewerId());
            return [
                'name' => $reviewer ? $reviewer->getFullName() : 'Unknown Reviewer',
                'score' => rand(60, 95), // Placeholder
            ];
        }, $reviewAssignments);

        // Inject data into Vue
        $templateMgr->setState([
            'trustScores' => [
                'authors' => $authorScores,
                'reviewers' => $reviewerScores,
            ],
        ]);
        
        
        error_log('TrustScoreUIPlugin::callbackTemplateManagerDisplay finished');
        // Permit other plugins to continue interacting with this hook
        return false;
    }


    public function injectTrustScoreScript($hookName, $args)
    {
        $templateMgr = $args[0];
        $request = Application::get()->getRequest();
        $page = $request->getRequestedPage();

        if ($page !== 'workflow') return false;

        $templateMgr->addJavaScript(
            'trustScoreComponent',
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/public/build/trust-scores.iife.js',
            ['contexts' => ['backend']]
        );
        $templateMgr->addStyleSheet(
            'trustScoreStyles',
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/public/build/style.css',
            ['contexts' => ['backend']]
        );

        return false;
    }

    public function injectFrontendState($hookName, $args)
    {
        $templateMgr = $args[0];
        $request = Application::get()->getRequest();
        $page = $request->getRequestedPage();

        if ($page === 'workflow') {
            // In real case, this would come from DB or service
            $trustScores = [
                'authors' => [
                    ['id' => 101, 'name' => 'Author A', 'score' => 78],
                    ['id' => 102, 'name' => 'Author B', 'score' => 91],
                ],
                'reviewers' => [
                    ['id' => 201, 'name' => 'Reviewer X', 'score' => 65],
                    ['id' => 202, 'name' => 'Reviewer Y', 'score' => 82],
                ]
            ];

            $templateMgr->setState([
                'trustScores' => $trustScores
            ]);
        }

        return false;
    }

    public function injectTrustScoreMountPoint($hookName, $args)
    {
        $output =& $args[2];
        $output .= '<div id="trust-score-app"></div>';
        return false;
    }

    // public function injectTrustScoreScript($hookName, $args) {
    //     error_log('TrustScoreUIPlugin::injectTrustScoreScript called');
    //     $request = Application::get()->getRequest();
    //     $templateMgr = $args[0];
    //     $template = $args[1];

       
    //     error_log('TrustScoreUIPlugin::injectTrustScoreScript template: ' . $template);

    //     // // Check if we're on a submission workflow page
    //     $requestedPage = $request->getRequestedPage();
    //     $requestedOp = $request->getRequestedOp();
        

    //     $vars = $request->getUserVars();
      

       
       
    //     // error_log('TrustScoreUIPlugin DEBUG - context: ' . print_r($context, true));

    //     error_log('TrustScoreUIPlugin DEBUG - user vars: ' . print_r($vars, true));

    //     error_log('TrustScoreUIPlugin::injectTrustScoreScript requestedPage: ' . $requestedPage);
    //     // error_log('TrustScoreUIPlugin::injectTrustScoreScript requestedOp: ' . $requestedOp);
    //     // error_log('TrustScoreUIPlugin::injectTrustScoreScript submissionId: ' . $submissionId);

    //     if ($requestedPage === 'workflow' && strpos($template, 'workflow') !== false) {
    //         error_log('TrustScoreUIPlugin::injectTrustScoreScript injecting script');
    //         $templateMgr->addJavaScript(
    //             'trust-scores',
    //             $request->getBaseUrl() . '/plugins/generic/trustScoreUI/js/trust-scores.js',
    //             ['contexts' => ['backend']]
    //         );
    //         error_log('TrustScoreUIPlugin::injectTrustScoreScript injected script');
    //     }

    //     return false;
    // }

    
    // public function addTrustScoreTab($hookName, $args) {
    //     $smarty =& $args[1];
    //     $output =& $args[2];
    
    //     // Add the tab markup
    //     $output .= '<li><a href="' . $this->getPluginPath() . '/tab/' . $smarty->getTemplateVars('submissionId') . '" id="trustScoreTab">Trust Score</a></li>';
    //     return false;
    // }

   




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