/**
 * Website Launch Checklist
 * Interactive checklist with localStorage persistence
 * Organized in 3 tiers: Basic, Advanced, Expert
 */

const checklistData = {
    // ============================================
    // TIER 1: BASIC (Essential for launch)
    // ============================================
    basicDomain: {
        title: '🌐 Domain & Hosting',
        tier: 'basic',
        items: [
            {
                id: 'domain-registered',
                title: 'Domain name registered',
                description: 'Purchase your domain name (preferably .com)',
                link: { text: 'Get Domain', url: 'https://bluehost.sjv.io/Webstarterkit' }
            },
            {
                id: 'hosting-setup',
                title: 'Web hosting account set up',
                description: 'Choose and set up reliable web hosting',
                link: { text: 'Get Hosting', url: 'https://bluehost.sjv.io/Webstarterkit' }
            },
            {
                id: 'ssl-installed',
                title: 'SSL certificate installed',
                description: 'Ensure your site uses HTTPS (usually free with hosting)'
            }
        ]
    },
    basicPages: {
        title: '📄 Essential Pages',
        tier: 'basic',
        items: [
            {
                id: 'homepage',
                title: 'Homepage complete',
                description: 'Clear value proposition, call-to-action, and professional design'
            },
            {
                id: 'about-page',
                title: 'About page created',
                description: 'Tell your story and build trust with visitors'
            },
            {
                id: 'services-page',
                title: 'Services/Products page',
                description: 'Clearly explain what you offer and pricing (if applicable)'
            },
            {
                id: 'contact-page',
                title: 'Contact page set up',
                description: 'Include form, phone, email, address, and map if relevant'
            }
        ]
    },
    basicFunctionality: {
        title: '⚙️ Core Functionality',
        tier: 'basic',
        items: [
            {
                id: 'contact-form-works',
                title: 'Contact form tested',
                description: 'Submit a test and verify you receive the email'
            },
            {
                id: 'mobile-responsive',
                title: 'Mobile responsive design',
                description: 'Test on multiple devices and screen sizes'
            },
            {
                id: 'content-proofread',
                title: 'All content proofread',
                description: 'Check for typos, grammar, and factual errors'
            },
            {
                id: 'broken-links',
                title: 'No broken links',
                description: 'Check all internal and external links work correctly'
            }
        ]
    },

    // ============================================
    // TIER 2: ADVANCED (Recommended for success)
    // ============================================
    advancedSEO: {
        title: '📈 SEO Basics',
        tier: 'advanced',
        items: [
            {
                id: 'meta-titles',
                title: 'Meta titles for all pages',
                description: 'Unique, descriptive titles (50-60 characters each)'
            },
            {
                id: 'meta-descriptions',
                title: 'Meta descriptions for all pages',
                description: 'Compelling descriptions (150-160 characters each)'
            },
            {
                id: 'heading-tags',
                title: 'Proper heading structure',
                description: 'One H1 per page, logical H2-H6 hierarchy'
            },
            {
                id: 'alt-text',
                title: 'Image alt text',
                description: 'Descriptive alt text for all images'
            }
        ]
    },
    advancedContent: {
        title: '✍️ Content Quality',
        tier: 'advanced',
        items: [
            {
                id: 'business-goals',
                title: 'Clear website goals defined',
                description: 'What do you want your website to achieve? (leads, sales, information, etc.)'
            },
            {
                id: 'target-audience',
                title: 'Target audience identified',
                description: 'Who are you trying to reach? What are their needs and pain points?'
            },
            {
                id: 'competitor-research',
                title: 'Competitor research done',
                description: 'Analyze 3-5 competitor sites to see what works in your industry'
            },
            {
                id: 'privacy-policy',
                title: 'Privacy Policy page',
                description: 'Required if you collect any user data or use cookies'
            }
        ]
    },
    advancedPerformance: {
        title: '⚡ Performance',
        tier: 'advanced',
        items: [
            {
                id: 'loading-speed',
                title: 'Fast loading speed',
                description: 'Optimize images and code for quick load times (under 3 seconds)'
            },
            {
                id: 'cross-browser',
                title: 'Cross-browser compatibility',
                description: 'Test in Chrome, Firefox, Safari, and Edge'
            },
            {
                id: 'email-setup',
                title: 'Professional email set up',
                description: 'Create yourname@yourdomain.com email addresses'
            },
            {
                id: 'favicon',
                title: 'Favicon uploaded',
                description: 'Small icon that appears in browser tabs'
            }
        ]
    },

    // ============================================
    // TIER 3: EXPERT (Pro-level optimization)
    // ============================================
    expertAnalytics: {
        title: '📊 Analytics & Tracking',
        tier: 'expert',
        items: [
            {
                id: 'google-analytics',
                title: 'Google Analytics installed',
                description: 'Track your website traffic and user behavior'
            },
            {
                id: 'google-search-console',
                title: 'Google Search Console set up',
                description: 'Submit sitemap and monitor search performance'
            },
            {
                id: 'conversion-tracking',
                title: 'Conversion tracking configured',
                description: 'Track form submissions, button clicks, and goals'
            }
        ]
    },
    expertOptimization: {
        title: '🚀 Advanced SEO',
        tier: 'expert',
        items: [
            {
                id: 'schema-markup',
                title: 'Schema markup added',
                description: 'Structured data for better search engine understanding'
            },
            {
                id: 'sitemap-xml',
                title: 'XML sitemap generated',
                description: 'Help search engines discover all your pages'
            },
            {
                id: 'robots-txt',
                title: 'Robots.txt configured',
                description: 'Control search engine crawling behavior'
            },
            {
                id: 'open-graph',
                title: 'Open Graph meta tags',
                description: 'Better social media sharing previews'
            }
        ]
    },
    expertProfessional: {
        title: '💎 Professional Polish',
        tier: 'expert',
        items: [
            {
                id: 'social-media-links',
                title: 'Social media integration',
                description: 'Link to your business social media profiles'
            },
            {
                id: 'backup-plan',
                title: 'Automated backup system',
                description: 'Automatic backups configured (usually through hosting)'
            },
            {
                id: 'security-headers',
                title: 'Security headers configured',
                description: 'Add security headers for better protection'
            },
            {
                id: 'performance-monitoring',
                title: 'Performance monitoring',
                description: 'Set up uptime monitoring and performance tracking'
            }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initializeChecklist();
    updateProgress();
});

/**
 * Initialize checklist from data
 */
function initializeChecklist() {
    // Load saved progress
    const savedProgress = storage.get('checklistProgress', {});

    // Group sections by tier
    const tiers = {
        basic: [],
        advanced: [],
        expert: []
    };

    Object.keys(checklistData).forEach(sectionKey => {
        const section = checklistData[sectionKey];
        tiers[section.tier].push({ key: sectionKey, ...section });
    });

    // Create tier containers
    const container = document.querySelector('.container');
    const progressCard = document.querySelector('.tool-card');

    // Clear existing sections (keep progress card)
    const existingSections = container.querySelectorAll('.tool-card:not(:first-child)');
    existingSections.forEach(el => el.remove());

    // Render each tier
    ['basic', 'advanced', 'expert'].forEach(tierName => {
        const tierTitle = {
            basic: '📌 BASIC - Essential for Launch',
            advanced: '⭐ ADVANCED - Recommended for Success',
            expert: '🏆 EXPERT - Pro-Level Optimization'
        }[tierName];

        const tierDescription = {
            basic: 'These items are absolutely essential before launching your website.',
            advanced: 'These items will help your website succeed and rank better.',
            expert: 'These items will give you a professional, optimized website.'
        }[tierName];

        // Create tier header
        const tierHeader = document.createElement('div');
        tierHeader.className = 'tier-header';
        tierHeader.style.cssText = `
            background: ${tierName === 'basic' ? '#10b981' : tierName === 'advanced' ? '#667eea' : '#f59e0b'};
            color: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 2rem auto 1rem auto;
            max-width: 900px;
        `;
        tierHeader.innerHTML = `
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">${tierTitle}</h2>
            <p style="margin: 0; opacity: 0.9;">${tierDescription}</p>
        `;
        container.appendChild(tierHeader);

        // Render sections in this tier
        tiers[tierName].forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'tool-card mb-2';
            sectionDiv.style.cssText = 'max-width: 900px; margin-left: auto; margin-right: auto;';

            const sectionTitle = document.createElement('h3');
            sectionTitle.className = 'mb-1';
            sectionTitle.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';
            sectionTitle.textContent = section.title;
            sectionDiv.appendChild(sectionTitle);

            const ul = document.createElement('ul');
            ul.className = 'checklist';

            section.items.forEach(item => {
                const isCompleted = savedProgress[item.id] || false;
                const listItem = createChecklistItem(item, isCompleted);
                ul.appendChild(listItem);
            });

            sectionDiv.appendChild(ul);
            container.appendChild(sectionDiv);
        });
    });

    // Re-add success message at the end
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        container.appendChild(successMsg);
    }
}

/**
 * Create a checklist item element
 */
function createChecklistItem(item, isCompleted = false) {
    const li = document.createElement('li');
    li.className = `checklist-item ${isCompleted ? 'completed' : ''}`;
    li.dataset.itemId = item.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checklist-checkbox';
    checkbox.id = `checkbox-${item.id}`;
    checkbox.checked = isCompleted;
    checkbox.addEventListener('change', (e) => {
        toggleChecklistItem(item.id, e.target.checked);
    });

    const contentDiv = document.createElement('div');
    contentDiv.className = 'checklist-content';

    const title = document.createElement('div');
    title.className = 'checklist-title';
    title.textContent = item.title;

    const description = document.createElement('div');
    description.className = 'checklist-description';
    description.textContent = item.description;

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);

    // Add link if present
    if (item.link) {
        const link = document.createElement('a');
        link.href = item.link.url;
        link.textContent = item.link.text;
        link.target = '_blank';
        link.rel = 'noopener';
        link.className = 'btn btn-outline';
        link.style.cssText = 'display: inline-block; margin-top: 0.5rem; font-size: 0.875rem; padding: 0.375rem 0.75rem;';
        link.addEventListener('click', () => {
            trackAffiliateClick('checklist-' + item.id);
        });
        contentDiv.appendChild(link);
    }

    li.appendChild(checkbox);
    li.appendChild(contentDiv);

    return li;
}

/**
 * Toggle checklist item completion
 */
function toggleChecklistItem(itemId, isCompleted) {
    // Save to localStorage
    const savedProgress = storage.get('checklistProgress', {});
    savedProgress[itemId] = isCompleted;
    storage.set('checklistProgress', savedProgress);

    // Update UI
    const listItem = document.querySelector(`[data-item-id="${itemId}"]`);
    if (listItem) {
        if (isCompleted) {
            listItem.classList.add('completed');
        } else {
            listItem.classList.remove('completed');
        }
    }

    // Update progress
    updateProgress();
}

/**
 * Update progress bar and counter
 */
function updateProgress() {
    const savedProgress = storage.get('checklistProgress', {});
    const totalItems = getTotalItemCount();
    const completedItems = Object.values(savedProgress).filter(v => v === true).length;
    const percentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Update progress bar
    const progressBar = document.getElementById('checklistProgress');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    // Update progress text
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = `${completedItems} of ${totalItems} completed`;
    }

    // Show success message if all completed
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        if (completedItems === totalItems && totalItems > 0) {
            show(successMessage);
        } else {
            hide(successMessage);
        }
    }
}

/**
 * Get total number of checklist items
 */
function getTotalItemCount() {
    let count = 0;
    Object.values(checklistData).forEach(section => {
        count += section.items.length;
    });
    return count;
}

/**
 * Reset all checklist items
 */
function resetChecklist() {
    if (confirm('Are you sure you want to reset all checklist items?')) {
        storage.remove('checklistProgress');

        // Uncheck all checkboxes
        document.querySelectorAll('.checklist-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Remove completed class
        document.querySelectorAll('.checklist-item').forEach(item => {
            item.classList.remove('completed');
        });

        updateProgress();
        showAlert('Checklist reset successfully', 'info', 'successMessage');
    }
}

/**
 * Download checklist as text
 */
function downloadChecklist() {
    const savedProgress = storage.get('checklistProgress', {});

    let content = 'WEBSITE LAUNCH CHECKLIST\n';
    content += '='.repeat(50) + '\n\n';

    const tiers = {
        basic: { title: 'BASIC - Essential for Launch', sections: [] },
        advanced: { title: 'ADVANCED - Recommended for Success', sections: [] },
        expert: { title: 'EXPERT - Pro-Level Optimization', sections: [] }
    };

    Object.keys(checklistData).forEach(sectionKey => {
        const section = checklistData[sectionKey];
        tiers[section.tier].sections.push(section);
    });

    Object.keys(tiers).forEach(tierKey => {
        const tier = tiers[tierKey];
        content += '\n' + tier.title.toUpperCase() + '\n';
        content += '='.repeat(tier.title.length) + '\n\n';

        tier.sections.forEach(section => {
            content += section.title + '\n';
            content += '-'.repeat(section.title.length) + '\n';

            section.items.forEach(item => {
                const status = savedProgress[item.id] ? '[✓]' : '[ ]';
                content += `${status} ${item.title}\n`;
                content += `    ${item.description}\n`;
            });

            content += '\n';
        });
    });

    content += '\n' + '='.repeat(50) + '\n';
    content += 'Generated by Small Business Website Starter Kit\n';
    content += 'https://www.sbwsk.io\n';

    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-launch-checklist.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showAlert('Checklist downloaded! Check your downloads folder.', 'success', 'successMessage');
}
