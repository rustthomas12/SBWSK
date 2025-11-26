// Social Sharing Functionality
(function() {
    'use strict';

    // Create share buttons for blog posts
    function createShareButtons(options = {}) {
        const url = options.url || window.location.href;
        const title = options.title || document.title;
        const text = options.text || '';

        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share-buttons';
        shareContainer.setAttribute('role', 'group');
        shareContainer.setAttribute('aria-label', 'Share this page');

        const buttons = [
            {
                name: 'Twitter',
                icon: '𝕏',
                url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
                color: '#000000',
                ariaLabel: 'Share on Twitter'
            },
            {
                name: 'Facebook',
                icon: 'f',
                url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                color: '#1877f2',
                ariaLabel: 'Share on Facebook'
            },
            {
                name: 'LinkedIn',
                icon: 'in',
                url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                color: '#0077b5',
                ariaLabel: 'Share on LinkedIn'
            },
            {
                name: 'Email',
                icon: '✉',
                url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + ' ' + url)}`,
                color: '#6b7280',
                ariaLabel: 'Share via Email'
            }
        ];

        buttons.forEach(button => {
            const link = document.createElement('a');
            link.href = button.url;
            link.className = 'share-button';
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('aria-label', button.ariaLabel);
            link.style.backgroundColor = button.color;
            link.innerHTML = `<span class="share-icon">${button.icon}</span>`;

            link.addEventListener('click', function(e) {
                // Track share event
                if (typeof trackEvent === 'function') {
                    trackEvent('Social Share', button.name, url);
                }

                // For non-email links, open in popup
                if (button.name !== 'Email') {
                    e.preventDefault();
                    window.open(this.href, 'share-dialog', 'width=626,height=436');
                }
            });

            shareContainer.appendChild(link);
        });

        return shareContainer;
    }

    // Add share buttons to blog posts
    document.addEventListener('DOMContentLoaded', function() {
        const blogPosts = document.querySelectorAll('.blog-post, .blog-card, article');

        blogPosts.forEach(post => {
            // Check if it already has share buttons
            if (!post.querySelector('.social-share-buttons')) {
                const shareButtons = createShareButtons({
                    title: post.querySelector('h2, h3')?.textContent || document.title
                });

                // Insert share buttons
                const contentDiv = post.querySelector('.blog-content, .padding, [style*="padding"]');
                if (contentDiv) {
                    contentDiv.appendChild(shareButtons);
                }
            }
        });

        // Add copy link functionality
        if (navigator.clipboard) {
            document.querySelectorAll('.social-share-buttons').forEach(container => {
                const copyButton = document.createElement('button');
                copyButton.className = 'share-button copy-link-button';
                copyButton.setAttribute('aria-label', 'Copy link to clipboard');
                copyButton.style.backgroundColor = '#10b981';
                copyButton.innerHTML = '<span class="share-icon">🔗</span>';

                copyButton.addEventListener('click', async function() {
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        this.innerHTML = '<span class="share-icon">✓</span>';
                        this.style.backgroundColor = '#059669';

                        setTimeout(() => {
                            this.innerHTML = '<span class="share-icon">🔗</span>';
                            this.style.backgroundColor = '#10b981';
                        }, 2000);

                        if (typeof trackEvent === 'function') {
                            trackEvent('Social Share', 'Copy Link', window.location.href);
                        }
                    } catch (err) {
                        console.error('Failed to copy link:', err);
                    }
                });

                container.appendChild(copyButton);
            });
        }
    });

    // Expose function for manual use
    window.createShareButtons = createShareButtons;

})();
