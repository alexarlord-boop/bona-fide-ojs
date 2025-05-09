(function($) {
    $(function() {
        // Attach only once to prevent duplicates
        if (!$('#trustScoreTab').data('attached')) {
            $('#trustScoreTab').data('attached', true);

            // Initialize the tab handler
            $('#trustScoreTab').pkpHandler('$.pkp.controllers.TabHandler', {
                // Load content via AJAX
                tabsUrl: $('#trustScoreTab').attr('href'),
                // Optional: you can include a CSS class or DOM selector for consistency
                selected: false
            });
        }
    });
})(jQuery);
