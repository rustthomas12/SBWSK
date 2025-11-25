/**
 * Website Launch Checklist
 * Interactive checklist with localStorage persistence
 */

const checklistData = {
    section1: {
        title: 'Before You Start',
        items: [
            {
                id: 'business-goals',
                title: 'Define your website goals',
                description: 'What do you want your website to achieve? (leads, sales, information, etc.)'
            },
            {
                id: 'target-audience',
                title: 'Identify your target audience',
                description: 'Who are you trying to reach? What are their needs and pain points?'
            },
            {
                id: 'competitor-research',
                title: 'Research competitor websites',
                description: 'Look at 3-5 competitor sites to see what works in your industry'
            },
            {
                id: 'content-prepared',
                title: 'Prepare your content',
                description: 'Write or gather all text, images, and other content for your pages'
            }
        ]
    },
    section2: {
        title: 'Domain & Hosting',
        items: [
            {
                id: 'domain-registered',
                title: 'Domain name registered',
                description: 'Purchase your domain name (preferably .com)',
                link: { text: 'Get Domain', url: 'https://bluehost.sjv.io/DyaJob' }
            },
            {
                id: 'hosting-setup',
                title: 'Web hosting account set up',
                description: 'Choose and set up reliable web hosting',
                link: { text: 'Get Hosting', url: 'https://bluehost.sjv.io/DyaJob' }
            },
            {
                id: 'ssl-installed',
                title: 'SSL certificate installed',
                description: 'Ensure your site uses HTTPS (usually free with hosting)'
            },
            {
                id: 'email-setup',
                title: 'Professional email set up',
                description: 'Create yourname@yourdomain.com email addresses'
            }
        ]
    },
    section3: {
        title: 'Essential Pages',
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
            },
            {
                id: 'privacy-policy',
                title: 'Privacy Policy page',
                description: 'Required if you collect any user data or use cookies'
            }
        ]
    },
    section4: {
        title: 'Functionality',
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
                id: 'cross-browser',
                title: 'Cross-browser compatibility',
                description: 'Test in Chrome, Firefox, Safari, and Edge'
            },
            {
                id: 'loading-speed',
                title: 'Fast loading speed',
                description: 'Optimize images and code for quick load times (under 3 seconds)'
            },
            {
                id: 'broken-links',
                title: 'No broken links',
                description: 'Check all internal and external links work correctly'
            }
        ]
    },
    section5: {
        title: 'SEO & Analytics',
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
            },
            {
                id: 'google-analytics',
                title: 'Google Analytics installed',
                description: 'Track your website traffic and user behavior'
            },
            {
                id: 'google-search-console',
                title: 'Google Search Console set up',
                description: 'Submit sitemap and monitor search performance'
            }
        ]
    },
    section6: {
        title: 'Pre-Launch',
        items: [
            {
                id: 'content-proofread',
                title: 'All content proofread',
                description: 'Check for typos, grammar, and factual errors'
            },
            {
                id: 'favicon',
                title: 'Favicon uploaded',
                description: 'Small icon that appears in browser tabs'
            },
            {
                id: 'social-media-links',
                title: 'Social media links added',
                description: 'Link to your business social media profiles'
            },
            {
                id: 'backup-plan',
                title: 'Backup system in place',
                description: 'Automatic backups configured (usually through hosting)'
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

    // Render each section
    Object.keys(checklistData).forEach(sectionKey => {
        const section = checklistData[sectionKey];
        const sectionElement = document.getElementById(sectionKey);

        if (!sectionElement) return;

        section.items.forEach(item => {
            const isCompleted = savedProgress[item.id] || false;
            const listItem = createChecklistItem(item, isCompleted);
            sectionElement.appendChild(listItem);
        });
    });
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
 * Download checklist as text (simulated PDF for MVP)
 * In production, you could use jsPDF or similar library for actual PDF generation
 */
function downloadChecklist() {
    const savedProgress = storage.get('checklistProgress', {});

    let content = 'WEBSITE LAUNCH CHECKLIST\n';
    content += '='.repeat(50) + '\n\n';

    Object.values(checklistData).forEach(section => {
        content += section.title.toUpperCase() + '\n';
        content += '-'.repeat(section.title.length) + '\n\n';

        section.items.forEach(item => {
            const status = savedProgress[item.id] ? '[✓]' : '[ ]';
            content += `${status} ${item.title}\n`;
            content += `    ${item.description}\n\n`;
        });

        content += '\n';
    });

    content += '\n' + '='.repeat(50) + '\n';
    content += 'Generated by Small Business Website Starter Kit\n';
    content += 'https://yourwebsite.com\n';

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
