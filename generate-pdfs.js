/**
 * Generate PDF versions of Copy Kit templates
 * Run this script to create professional PDF files from the templates
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Colors
const PRIMARY_COLOR = '#667eea';
const SECONDARY_COLOR = '#764ba2';
const TEXT_COLOR = '#333333';
const LIGHT_GRAY = '#f9fafb';
const MEDIUM_GRAY = '#6b7280';

// Create PDFs directory if it doesn't exist
const pdfDir = path.join(__dirname, 'copy-kit-templates', 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Helper function to add header
function addHeader(doc, title, subtitle) {
  // Gradient-like effect with rectangles
  doc.rect(0, 0, doc.page.width, 120).fill(PRIMARY_COLOR);

  // Title
  doc.fillColor('white')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(title, 50, 40, { align: 'left' });

  // Subtitle
  if (subtitle) {
    doc.fontSize(12)
       .font('Helvetica')
       .text(subtitle, 50, 70, { align: 'left' });
  }

  doc.moveDown(3);
}

// Helper function to add section
function addSection(doc, title, content, yPos) {
  if (yPos && doc.y > yPos) {
    doc.addPage();
  }

  doc.fillColor(PRIMARY_COLOR)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text(title, { continued: false });

  doc.moveDown(0.5);

  doc.fillColor(TEXT_COLOR)
     .fontSize(11)
     .font('Helvetica')
     .text(content, { align: 'left', lineGap: 4 });

  doc.moveDown(1);
}

// Helper function to add fillable field
function addField(doc, label, lines = 1) {
  doc.fillColor(MEDIUM_GRAY)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text(label);

  doc.moveDown(0.3);

  for (let i = 0; i < lines; i++) {
    doc.strokeColor('#d1d5db')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke();
    doc.moveDown(0.8);
  }

  doc.moveDown(0.5);
}

// Helper function to add checkbox
function addCheckbox(doc, label) {
  const y = doc.y;

  // Draw checkbox
  doc.rect(50, y, 12, 12)
     .strokeColor('#d1d5db')
     .stroke();

  // Add label
  doc.fillColor(TEXT_COLOR)
     .fontSize(10)
     .font('Helvetica')
     .text(label, 70, y);

  doc.moveDown(0.7);
}

console.log('🎨 Generating Copy Kit PDFs...\n');

// ========================================
// 1. Quick Start Guide PDF
// ========================================
console.log('Creating: Quick Start Guide...');
const quickStartDoc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 120, bottom: 50, left: 50, right: 50 }
});

quickStartDoc.pipe(fs.createWriteStream(path.join(pdfDir, 'QUICK-START-GUIDE.pdf')));

addHeader(quickStartDoc, '🚀 Quick Start Guide', 'The 10-Minute Website Copy Kit');

quickStartDoc.fillColor(TEXT_COLOR)
  .fontSize(11)
  .font('Helvetica')
  .text('Congratulations on your purchase! This kit contains 5 professional copywriting templates to help you create compelling website copy in minutes, not hours.', { lineGap: 4 });

quickStartDoc.moveDown(1.5);

addSection(quickStartDoc, '📦 What\'s Included',
  '• Homepage Template - Complete homepage structure with fill-in-the-blank sections\n' +
  '• About Page Template - Tell your story and build trust with visitors\n' +
  '• Services Page Template - Showcase what you offer with clear, benefit-driven copy\n' +
  '• Contact Page Template - Make it easy for customers to reach you\n' +
  '• SEO Meta Tags Template - Optimize your site for search engines');

addSection(quickStartDoc, '🎯 How to Use These Templates',
  '1. Open each PDF template\n' +
  '2. Read the instructions at the top of each page\n' +
  '3. Fill in the blanks with your business information\n' +
  '4. Type or write your responses in the provided spaces\n' +
  '5. Transfer the completed copy to your website\n' +
  '6. Customize and adjust to match your brand voice');

addSection(quickStartDoc, '💡 Tips for Success',
  '✓ Be specific - Use numbers, timelines, and concrete details\n' +
  '✓ Focus on benefits - What customers GET, not what you DO\n' +
  '✓ Use "you/your" - Speak directly to visitors\n' +
  '✓ Keep it short - Short sentences and paragraphs\n' +
  '✓ Add personality - Let your unique voice shine\n' +
  '✓ Include proof - Testimonials, numbers, results\n' +
  '✓ Have clear CTAs - Tell people what to do next');

addSection(quickStartDoc, '📝 Recommended Order',
  '1. Homepage (Most important - do this first!)\n' +
  '2. About Page (Builds trust and connection)\n' +
  '3. Services/Products (Shows what you offer)\n' +
  '4. Contact (Makes it easy to reach you)\n' +
  '5. SEO Meta Tags (Helps people find you on Google)\n\n' +
  'Time estimate: 10-15 minutes per page = ~1 hour total');

quickStartDoc.addPage();

addSection(quickStartDoc, '🎨 Power Words to Use',
  'Transform, Discover, Proven, Guaranteed, Easy, Simple, Fast, Professional, Premium, Exclusive, Limited, Free, Instant, Revolutionary, Ultimate');

addSection(quickStartDoc, '⭐ Before You Launch Checklist',
  '');

addCheckbox(quickStartDoc, 'Clear headline explaining what you do');
addCheckbox(quickStartDoc, 'Customer problems identified');
addCheckbox(quickStartDoc, 'Your solution clearly explained');
addCheckbox(quickStartDoc, 'How it works section');
addCheckbox(quickStartDoc, 'Testimonials (even if just 1-2)');
addCheckbox(quickStartDoc, 'Strong call-to-action');
addCheckbox(quickStartDoc, 'All services/products listed');
addCheckbox(quickStartDoc, 'Contact information easy to find');
addCheckbox(quickStartDoc, 'No spelling or grammar errors');
addCheckbox(quickStartDoc, 'Mobile-friendly formatting');

quickStartDoc.moveDown(2);

quickStartDoc.fillColor(MEDIUM_GRAY)
  .fontSize(10)
  .font('Helvetica')
  .text('Need help? Email: tom@lowlightdigital.com', { align: 'center' });

quickStartDoc.moveDown(0.5);

quickStartDoc.fillColor(MEDIUM_GRAY)
  .fontSize(8)
  .text('© 2025 Small Business Website Starter Kit (SBWSK)', { align: 'center' });

quickStartDoc.end();

// ========================================
// 2. Homepage Template PDF
// ========================================
console.log('Creating: Homepage Template...');
const homepageDoc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 120, bottom: 50, left: 50, right: 50 }
});

homepageDoc.pipe(fs.createWriteStream(path.join(pdfDir, '1-Homepage-Template.pdf')));

addHeader(homepageDoc, '🏠 Homepage Copy Template', 'Fill in the blanks to create your homepage');

homepageDoc.fillColor(TEXT_COLOR)
  .fontSize(11)
  .font('Helvetica-Bold')
  .text('INSTRUCTIONS: ', { continued: true })
  .font('Helvetica')
  .text('Replace the text in [BRACKETS] with your own information. Keep the structure but make it yours!');

homepageDoc.moveDown(2);

// Hero Section
addSection(homepageDoc, '🎯 HERO SECTION (Top of Homepage)', '');
homepageDoc.fillColor(TEXT_COLOR)
  .fontSize(10)
  .font('Helvetica')
  .text('Headline Formula: [Action Verb] + [What You Help With] + for [Target Audience]');
homepageDoc.moveDown(0.5);
homepageDoc.fontSize(9)
  .fillColor(MEDIUM_GRAY)
  .text('Examples: "Launch Your Dream Website in 7 Days or Less" • "Professional Bookkeeping Services for Growing Businesses"');
homepageDoc.moveDown(1);

addField(homepageDoc, '✍️ Your Headline:', 2);

homepageDoc.fillColor(TEXT_COLOR)
  .fontSize(10)
  .font('Helvetica')
  .text('Subheadline: Explain HOW you help and WHY it matters');
homepageDoc.moveDown(0.5);
homepageDoc.fontSize(9)
  .fillColor(MEDIUM_GRAY)
  .text('Example: "We handle the tech so you can focus on your business. No coding required."');
homepageDoc.moveDown(1);

addField(homepageDoc, '✍️ Your Subheadline:', 2);

homepageDoc.fillColor(TEXT_COLOR)
  .fontSize(10)
  .font('Helvetica')
  .text('Call-to-Action Button Text:');
homepageDoc.moveDown(0.5);

addCheckbox(homepageDoc, 'Get Started');
addCheckbox(homepageDoc, 'Book a Free Consultation');
addCheckbox(homepageDoc, 'See Our Work');
addCheckbox(homepageDoc, 'Get Your Free Quote');
addField(homepageDoc, 'Custom:', 1);

// Problem Section
homepageDoc.addPage();
addSection(homepageDoc, '⚠️ PROBLEM SECTION', 'List 3-4 problems your customers face');

addField(homepageDoc, 'Problem 1: [Common frustration]', 2);
addField(homepageDoc, 'Problem 2: [Time/money waste]', 2);
addField(homepageDoc, 'Problem 3: [Fear/concern]', 2);
addField(homepageDoc, 'Problem 4 (optional):', 2);

// Solution Section
addSection(homepageDoc, '✨ SOLUTION SECTION', '[Your Business Name] helps [target audience] [achieve desired outcome] through [your unique approach/method].');

addField(homepageDoc, '✍️ Your Solution Statement:', 3);

// Features/Services
homepageDoc.addPage();
addSection(homepageDoc, '🎁 FEATURES/SERVICES', 'List 3-6 key features or services');

for (let i = 1; i <= 4; i++) {
  addField(homepageDoc, `Service/Feature ${i} - Name:`, 1);
  addField(homepageDoc, 'Description (1-2 sentences):', 2);
  homepageDoc.moveDown(0.5);
}

// How It Works
homepageDoc.addPage();
addSection(homepageDoc, '🔄 HOW IT WORKS', 'Describe your process in 3-4 simple steps');

for (let i = 1; i <= 4; i++) {
  addField(homepageDoc, `Step ${i}:`, 2);
}

// Testimonials
homepageDoc.addPage();
addSection(homepageDoc, '💬 SOCIAL PROOF / TESTIMONIALS', 'Add 2-3 customer testimonials');

for (let i = 1; i <= 3; i++) {
  addField(homepageDoc, `Client ${i} - Name:`, 1);
  addField(homepageDoc, 'Quote:', 3);
  addField(homepageDoc, 'Title/Business:', 1);
  homepageDoc.moveDown(1);
}

// Final CTA
homepageDoc.addPage();
addSection(homepageDoc, '🚀 FINAL CALL-TO-ACTION', '');

addField(homepageDoc, 'CTA Headline (e.g., "Ready to Launch Your Website?"):', 2);
addField(homepageDoc, 'Supporting Text (one sentence about what happens next):', 2);
addField(homepageDoc, 'Button Text:', 1);

addSection(homepageDoc, '🛡️ TRUST ELEMENTS', 'Pick 2-3 to include on your homepage:');

addCheckbox(homepageDoc, 'Money-Back Guarantee');
addCheckbox(homepageDoc, 'Free Trial/Consultation');
addField(homepageDoc, 'Years in Business: _____ years', 1);
addField(homepageDoc, 'Number of Happy Clients: _____ clients served', 1);
addField(homepageDoc, 'Industry Certifications:', 1);
addField(homepageDoc, 'Awards/Recognition:', 1);

homepageDoc.moveDown(2);
homepageDoc.fillColor(MEDIUM_GRAY)
  .fontSize(10)
  .text('Need help? Email: tom@lowlightdigital.com', { align: 'center' });

homepageDoc.end();

console.log('✅ PDFs generated successfully in copy-kit-templates/pdfs/\n');
console.log('Generated files:');
console.log('  • QUICK-START-GUIDE.pdf');
console.log('  • 1-Homepage-Template.pdf');
console.log('\n📝 Run this script again if you make changes to the templates.');
