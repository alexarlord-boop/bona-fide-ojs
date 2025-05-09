$(function () {
    // Only run on the Review tab
    // if (window.location.hash.includes('workflow') && $('div.pkpWorkflow__review').length) {
        console.log('[TrustScorePlugin] Injected trust-scores.js');

        // Example: add a score box below each reviewer
        $('.reviewer_grid_row').each(function () {
            const reviewerName = $(this).find('.name').text();
            const score = Math.floor(Math.random() * 100); // Replace with real AJAX later
            $(this).append(`<div class="trust-score">Trust Score: ${score}</div>`);
        });
    // }
});