// FAQ Accordion Functionality
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            question.addEventListener('click', function() {
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
                const isExpanded = item.classList.contains('active');
                question.setAttribute('aria-expanded', isExpanded);

                // Track FAQ interaction
                if (isExpanded && typeof trackEvent === 'function') {
                    const questionText = question.querySelector('span').textContent;
                    trackEvent('FAQ', 'expand', questionText);
                }
            });
        });
    });

})();
