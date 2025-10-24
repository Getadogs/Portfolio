const links = document.querySelectorAll('.link');
const sections = document.querySelectorAll('section');
let activeLink = 0;
let isTransitioning = false;

links.forEach((link, i) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        if(activeLink != i && !isTransitioning){
            isTransitioning = true;
            
            links[activeLink].classList.remove('active');
            link.classList.add('active');
            sections[activeLink].classList.remove('active');
            
            // Add loading state
            document.body.classList.add('transitioning');
            
            setTimeout(() => {
                activeLink = i;
                sections[i].classList.add('active');
                
                // Remove loading state after transition
                setTimeout(() => {
                    document.body.classList.remove('transitioning');
                    isTransitioning = false;
                }, 100);
            }, 1000);
        }
    })
})

// Preload images to prevent loading issues
function preloadImages() {
    const images = [
        'img/EC_site.png',
        'img/Brutality.png', 
        'img/Beetrains.png',
        'img/Banner.png',
        'img/HTML.png',
        'img/PS.png',
        'img/AI.png',
        'img/me.jpg'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize preloading when page loads
document.addEventListener('DOMContentLoaded', function() {
    preloadImages();
    
    // Add image loading error handling
    const projectImages = document.querySelectorAll('.project-img');
    projectImages.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        img.addEventListener('error', function() {
            this.classList.add('error');
            console.warn('Failed to load image:', this.src);
        });
    });
    
    // Download CV button functionality
    const downloadCvBtn = document.querySelector('.download-cv-btn');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', function() {
            // Create a simple CV content
            const cvContent = `
AUYEZ ORAZKHANULY - CV

Contact Information:
Email: ajiauyez@gmail.com
Portfolio: http://localhost:8000

About:
カザフスタンのアルマトイ出身、アウウエズと申します。 私はカザフ語、トルコ語、ロシア語、英語、そして日本語の五か国語を話すマルチリンガルです。この多言語能力は、多様な文化背景を持つ人々との円滑なコミュニケーションを可能にする、最大の強みだと考えております。 
幼少期から語学に強い関心を持ち、高校時代には英語を活かしてデザイン、IT、ゲーム開発といった分野の知識を独学しました。その後、日本でのキャリア構築を目指し、日本語学習を経て、「日本工学院八王子専門学校」のウェブデザイン科に入学、 2023年に卒業いたしました。 
これまでに培ってきたマルチリンガルとしての能力と、専門学校で習得したウェブデザインのスキルを活かし、
日本の企業様で即戦力として貢献できることを心から願っております。

Skills:
- HTML: 90%
- CSS: 90%
- Java Script: 75%
- PHP: 25%
- Adobe Photoshop: 90%
- Adobe Illustrator: 95%

Languages:
- Kazakh (Native)
- Russian
- Turkish
- English
- Japanese

Education:
日本工学院八王子専門学校 - Web Design Department

Experience:
2024: Boolean 3D Print designer company
2025: Smart Contents IT Consulting and support company
            `;
            
            // Create and download the CV file
            const blob = new Blob([cvContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Auyez_Orazkhanuly_CV.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showNotification('CV downloaded successfully!', 'success');
        });
    }
    
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('msg').value;
            
            // Validate form fields
            if (!name || !email || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Create mailto link with form data
            const subject = encodeURIComponent('Portfolio Contact from ' + name);
            const body = encodeURIComponent(
                'Name: ' + name + '\n' +
                'Email: ' + email + '\n' +
                'Message: ' + message
            );
            
            // Updated email address
            const mailtoLink = `mailto:ajiauyez@gmail.com?subject=${subject}&body=${body}`;
            
            // Open default email client
            window.location.href = mailtoLink;
            
            // Show improved notification
            showNotification('Opening your email client... Please complete sending the email from your email application.', 'info');
            
            // Reset form
            contactForm.reset();
        });
    }
});

// Improved notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}