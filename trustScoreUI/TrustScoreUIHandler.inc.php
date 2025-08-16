<?php

import('lib.pkp.classes.handler.PKPHandler');

use Firebase\JWT\JWT;

class TrustScoreUIHandler extends PKPHandler {

    public function __construct() {
        parent::__construct();
    }

    function authorize($request, &$args, $roleAssignments) {
        // Optional: enforce login
        return parent::authorize($request, $args, $roleAssignments);
    }

    function fetchTrustScore($args, $request) {
        $user = $request->getUser();
        if (!$user) {
            return new \PKP\core\JSONMessage(false, 'Unauthorized');
        }

        $token = JWT::encode([
            'sub' => $user->getId(),
            'email' => $user->getEmail(),
            'exp' => time() + 3600
        ], 'YOUR_SECRET_KEY', 'HS256');

        $submissionId = $request->getUserVar('submissionId');

        // Call FastAPI backend
        $ch = curl_init('http://localhost:8000/trust-score');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['submissionId' => $submissionId]));
        $response = curl_exec($ch);
        $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpStatus !== 200) {
            return new \PKP\core\JSONMessage(false, 'Backend error');
        }

        return new \PKP\core\JSONMessage(true, json_decode($response, true));
    }
}
