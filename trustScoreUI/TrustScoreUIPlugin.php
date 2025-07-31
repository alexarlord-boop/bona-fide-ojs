<?php

namespace APP\plugins\generic\trustScoreUI;

use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use APP\core\Application;
use APP\template\TemplateManager;
use APP\facades\Repo;


class TrustScoreUIPlugin extends GenericPlugin
{

    public function register($category, $path, $mainContextId = null)
    {

        if (!parent::register($category, $path, $mainContextId)) return false;

        if ($this->getEnabled($mainContextId)) {

            Hook::add('TemplateManager::display', [$this, 'callbackTemplateManagerDisplay']);
            Hook::add('PageHandler::display', [$this, 'callbackPageHandlerDisplay']);


            $request = Application::get()->getRequest();
            $templateMgr = TemplateManager::getManager($request);
            $this->addJavaScript($request, $templateMgr);
            $templateMgr->addStyleSheet('backendUiExampleStyle', "{$request->getBaseUrl()}/{$this->getPluginPath()}/dist/build/build.css", [
                'contexts' => ['backend']
            ]);
        }

        return true;
    }


    /**
     * Add JavaScript to the template manager.
     * @param $request Request
     * @param $templateMgr TemplateManager
     */
    public function addJavaScript($request, $templateMgr)
    {
        $templateMgr->addJavaScript(
            'trustScoreComponent',
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/dist/build/build.iife.js',
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
    public function  callbackTemplateManagerDisplay($hookName, $args)
    {
        error_log('TrustScoreUIPlugin: callbackTemplateManagerDisplay called');

        $templateMgr = $args[0];
        $request = &\Registry::get('request');
        // $router = $request->getRouter();
        // $dispatcher = $request->getDispatcher();
        // $context = $request->getContext();
        // $user = $request->getUser();

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
    public function callbackPageHandlerDisplay($hookName, $args)
    {
        error_log('TrustScoreUIPlugin: callbackPageHandlerDisplay called');

        $page = $args[0];
        $request = &\Registry::get('request');

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
     * Get the display name of this plugin.
     */
    public function getDisplayName()
    {
        return 'Bona Fide UI Plugin';
    }

    /**
     * Get a description of the plugin.
     */
    public function getDescription()
    {
        return 'Enhances the editorial workflow by displaying scores for authors and reviewers directly in the OJS interface.';
    }
}
