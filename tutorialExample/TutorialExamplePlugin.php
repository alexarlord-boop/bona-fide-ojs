<?php
namespace APP\plugins\generic\tutorialExample;
use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;


use APP\notification\NotificationManager;
use PKP\notification\PKPNotification;
use APP\core\Application;

class TutorialExamplePlugin extends GenericPlugin
{
    public function register($category, $path, $mainContextId = NULL)
    {
        // Register the plugin
        $success = parent::register($category, $path);

        if ($success && $this->getEnabled()) {
            
            // Hook into submission validation
            Hook::add('Submission::validateSubmit', [$this, 'handleSubmissionValidation']);
            
            Hook::add('Author::validate', [$this, 'handleAuthorValidation']);

            Hook::add('EditorAction::addReviewer', [$this, 'handleReviewerAddition']);
            
            // Hook into reviewer assignment (option 1)
            // Hook::add('ReviewAssignment::add', [$this, 'handleNewReviewer']);
        }

        return $success;
    }

    /**
     * Provide a name for this plugin
     */
    public function getDisplayName()
    {
        return 'Tutorial Example Plugin';
    }

    /**
     * Provide a description for this plugin
     */
    public function getDescription()
    {
        return 'This plugin demonstrates how to create a custom plugin in OJS. With focus to Bona Fide project.';
    }

    /**
     * Handles a new submission and verifies authors.
     */
    public function handleSubmissionValidation($hookName, $args) {

        error_log("Submission validation hook triggered!");

        $request = Application::get()->getRequest();
        $user = $request->getUser();

        if ($user) {
            $payload = [
                'event' => 'submission_validation',
                'userId' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'details' => $args,
            ];

            $this->sendToFastAPI($payload);

            $notificationManager = new NotificationManager();
            $notificationManager->createNotification(
                $request,
                $user->getId(),
                PKPNotification::NOTIFICATION_TYPE_SUCCESS,
                null,
                'Your custom reviewer hook ran successfully!'
            );
        }

        return false;
    }

    public function handleAuthorValidation($hookName, $args) {

        error_log("Author validation hook triggered!");

        $request = Application::get()->getRequest();
        $user = $request->getUser();

        $payload = [
            'event' => 'author_validation',
            'userId' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'details' => $args, // if you want, you can send some info about the author
        ];
    
        $this->sendToFastAPI($payload);
    
        return false;
    }

   
    public function  handleReviewerAddition($hookName, $args) {

        error_log("Reviewer addition hook triggered!");

        // $args[0] is Submission, $args[1] is reviewerId
        $submission = $args[0];
        $reviewerId = $args[1];

          // Load the UserDAO
        /** @var $userDao UserDAO */
        // $userDao = \DAORegistry::getDAO('UserDAO');
        // $reviewer = $userDao->getById($reviewerId);

        // if (!$reviewer) {
        //     error_log("Reviewer not found!");
        //     return false;
        // }

        // Prepare payload
        $payload = [
            'event' => 'reviewer_addition',
            'submissionId' => $submission->getId(),
            'reviewerId' => $reviewerId,
            // 'reviewerUsername' => $reviewer->getUsername(),
            // 'reviewerEmail' => $reviewer->getEmail(),
            // 'reviewerFullName' => $reviewer->getFullName(),
        ];

        // Send to your backend
        $this->sendToFastAPI($payload);

        return false; // allow normal processing
    }


    /**
     * Handles a new reviewer assignment and verifies the reviewer.
     */
    public function handleNewReviewer($hookName, $args) {
       
        return true;
    }

    /**
     * Sends data to the FastAPI verification endpoint.
     */
    private function sendToFastAPI($payload) {
        $json = json_encode($payload);
        $ch = curl_init('http://fastapi:8000/verify');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
    
        $response = curl_exec($ch);
        $err = curl_error($ch);
    
        if ($err) {
            error_log("❌ CURL error: $err");
        } else {
            error_log("✅ CURL response: $response");
        }
    
        curl_close($ch);
    }
}
