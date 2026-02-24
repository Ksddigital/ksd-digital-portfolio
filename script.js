$(function() {


 // 2. Smooth Scrolling
    $(document).on('click', '.page-scroll', function(event) {
        var $anchor = $(this);
        var targetID = $anchor.attr('href');

        // Safety check: Only scroll if the section actually exists
        if ($(targetID).length) {
            // Calculate distance, but use Math.max to ensure it never goes below 0
            var targetTop = Math.max(0, $(targetID).offset().top - 60);

            $('html, body').stop().animate({
                scrollTop: targetTop
            }, 1000, 'easeInOutExpo');
            
            event.preventDefault();
        }
    });
    // 3. Navbar Background Change on Scroll
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('.navbar').addClass('scrolled'); // Add custom CSS for this if needed
        } else {
            $('.navbar').removeClass('scrolled');
        }
    });

    // 4. Typing Effect (Retained)
    const text = "Marketing Alchemist";
    const typingElement = document.getElementById("typing");
    let index = 0;

    function type() {
        if (index < text.length) {
            typingElement.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 2000);
        }
    }

    function erase() {
        if (index > 0) {
            typingElement.innerHTML = text.substring(0, index - 1);
            index--;
            setTimeout(erase, 50);
        } else {
            setTimeout(type, 500);
        }
    }
    type(); // Initialize

    // 5. Scroll Reveal Animation (New Premium Feature)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // If it's a progress bar, animate width
                if(entry.target.querySelector('.progress-bar')) {
                   // Logic for bars if needed, but CSS transition handles it well
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // 6. Counters Logic
    if ($(".section-counters .counter").length > 0) {
        $('.section-counters').each(function() {
            var $section = $(this);
            var waypoint = new IntersectionObserver(function(entries) {
                if(entries[0].isIntersecting) {
                    $('.counter').countTo();
                    waypoint.disconnect(); // Run once
                }
            });
            waypoint.observe(this);
        });
    }
    
    // Infinity Counter
    $('#infinity').data('countToOptions', {
        onComplete: function (value) {
            count.call(this, {
                from: value,
                to: value + 1
            });
        }
    });

    function count(options) {
        var $this = $(this);
        options = $.extend({}, options || {}, $this.data('countToOptions') || {});
        $this.countTo(options);
    }

 /* --- SMART GALLERY LOGIC (Balanced View + Load More) --- */
    
    // Settings
    var itemsPerCategory = 2; // How many from each section to show initially
    var itemsToAdd = 4;       // How many to add when "See More" is clicked
    var $gridItems = $('.masonry-item');
    var $loadMoreBtn = $('#loadMore');

    // 1. Smart Reset: Shows a balanced mix (2 of each)
    function resetGallery() {
        // First, hide everything
        $gridItems.hide();
        $gridItems.removeClass('show'); // Remove animation class to reset

        // Define your categories (these must match your HTML classes)
        var categories = ['print', 'web', 'logo', 'social'];

        // Loop through each category and show the first 2
        categories.forEach(function(category) {
            // Find items with this class, slice the first 2, and show them
            $gridItems.filter('.' + category).slice(0, itemsPerCategory).show();
        });

        // Toggle Button Visibility
        checkButtonVisibility();
    }

    function checkButtonVisibility() {
        // Count how many visible items are currently hidden
        var hiddenItems = $('.masonry-item:not(.hide):hidden').length;
        if (hiddenItems > 0) {
            $loadMoreBtn.fadeIn();
        } else {
            $loadMoreBtn.fadeOut();
        }
    }

    // Initialize on Page Load
    resetGallery();

    // 2. // --- UPDATED "SEE MORE" LOGIC (The Cap & Redirect) ---

    // Define your limit
    var maxItemsOnHome = 12; // Cap it at 12 or 16 images
    var behanceLink = "https://www.behance.net/KSDDIGITAL"; // PUT YOUR LINK HERE

    $loadMoreBtn.on('click', function(e) {
        
        // 1. Check if the button has already transformed into a link
        if ($(this).hasClass('redirect-mode')) {
            window.open(behanceLink, '_blank');
            return; // Stop the function here
        }

        // 2. Normal "Load More" Behavior
        var hiddenItems = $('.masonry-item:not(.hide):hidden');
        var itemsToReveal = hiddenItems.slice(0, itemsToAdd);
        
        itemsToReveal.fadeIn();

        // 3. Check current count to see if we should switch modes
        var visibleCount = $('.masonry-item:not(.hide):visible').length;
        var remainingHidden = $('.masonry-item:not(.hide):hidden').length;

        // Condition A: We hit your specific limit (e.g., 16)
        // Condition B: We ran out of images to show
        if (visibleCount >= maxItemsOnHome || remainingHidden === 0) {
            
            // Change the Button Text
            $(this).find('span').text("View Full Archive");
            $(this).find('i').removeClass('fa-plus').addClass('fa-arrow-up-right-from-square');
            
            // Add a class so next time we know to redirect
            $(this).addClass('redirect-mode');
            
            // Optional: If you ran out of items but haven't hit the limit, 
            // you might want to hide the button. 
            // But if you want to push traffic to Behance, keep it visible!
            if (remainingHidden === 0 && visibleCount < maxItemsOnHome) {
                 // Decide: Fade out? or Keep as Behance link?
                 // Let's keep it as a Behance link for social proof.
            }
        }
    });

    // 3. Filter Buttons Click Event
    $('.filter-btn').on('click', function() {
        var category = $(this).attr('data-filter');
        
        // Highlight active button
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        // Reset visibility classes
        if (category == 'all') {
            $gridItems.removeClass('hide');
            // Re-apply the balanced mix for "All" view
            resetGallery(); 
        } else {
            $gridItems.addClass('hide'); // Hide everything first
            $gridItems.filter('.' + category).removeClass('hide').fadeIn(); // Show specific category
            $gridItems.not('.' + category).hide(); // Ensure others are hidden
            
            // Hide "See More" on specific category tabs (optional, keeps it clean)
            $loadMoreBtn.fadeOut(); 
        }
    });


    /* --- LIGHTBOX LOGIC --- */
    var $lightbox = $('#lightbox');
    var $lightboxImg = $('#lightbox-img');
    var $caption = $('#caption');

    // 1. Click on Gallery Item
    $('.masonry-item').on('click', function() {
        var src = $(this).find('img').attr('src'); // Get the image
        var title = $(this).find('h5').text(); // Get the title
        var desc = $(this).find('p').text(); // Get the category/desc

        $lightbox.fadeIn();
        $lightboxImg.attr('src', src);
        $caption.html("<b>" + title + "</b><br><span style='color:#42867b; font-size:13px;'>" + desc + "</span>");
        
        // Disable scrolling on body so it feels immersive
        $('body').css('overflow', 'hidden');
    });

    // 2. Close Button
    $('.lightbox-close').on('click', function() {
        $lightbox.fadeOut();
        $('body').css('overflow', 'auto'); // Re-enable scrolling
    });

    // 3. Close when clicking outside the image
    $lightbox.on('click', function(e) {
        if (e.target !== $lightboxImg[0]) {
            $lightbox.fadeOut();
            $('body').css('overflow', 'auto');
        }
    });

    /* --- STATS COUNTER ANIMATION --- */
    var countStarted = false;
    
    $(window).scroll(function() {
        var oTop = $('#stats').offset().top - window.innerHeight;
        if (countStarted == false && $(window).scrollTop() > oTop) {
            $('.counter').each(function() {
                var $this = $(this),
                    countTo = $this.attr('data-count');
                
                $({ countNum: $this.text() }).animate({
                    countNum: countTo
                }, {
                    duration: 2000, // Takes 2 seconds to count up
                    easing: 'swing',
                    step: function() {
                        $this.text(Math.floor(this.countNum));
                    },
                    complete: function() {
                        $this.text(this.countNum);
                    }
                });
            });
            countStarted = true;
        }
    });

/* --- LEAD MAGNET FORM LOGIC (WITH FORMSPREE) --- */
$('#auditForm').on('submit', function(e) {
    e.preventDefault(); // Stops the page from refreshing

    // Grab the button and change text to show it's working
    var $submitBtn = $(this).find('button[type="submit"]');
    var originalText = $submitBtn.html();
    
    // Changes button to a spinning loader so the user knows to wait
    $submitBtn.html('Preparing Audit... <i class="fa-solid fa-spinner fa-spin" style="margin-left: 8px;"></i>').prop('disabled', true);

    // 1. Grab the data from the inputs
    var leadName = $('#auditName').val();
    var leadEmail = $('#auditEmail').val();

   // 2. Send the data to your Formspree account silently
    $.ajax({
        url: 'https://formspree.io/f/mvgwwdjn',
        method: 'POST',
        dataType: 'json',
        headers: {
            'Accept': 'application/json' // 🚨 THIS IS THE MAGIC VIP PASS FORMSPREE NEEDS 
        },
        data: {
            name: leadName,
            email: leadEmail,
            _subject: '🔥 NEW LEAD: Visibility Audit Download'
        },
        success: function(response) {
            // 3. Trigger the PDF download ONLY if the email was successfully saved
            
            // IMPORTANT: Make sure this points to your actual PDF file in the assets folder!
            var pdfUrl = 'Assets/KSD-Digital-Visibility-Gap-Audit.pdf'; 
            
            var link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'KSD_Business_Visibility_Audit.pdf'; // The name the file saves as on their computer
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 4. Close the popup
            $('#auditModal').modal('hide');

            // 5. Reset the form and button for the next user
            $('#auditForm')[0].reset();
            $submitBtn.html(originalText).prop('disabled', false);
        },
        error: function() {
            // Just in case something goes wrong with their connection
            alert('Oops! There was a problem processing your request. Please check your connection and try again.');
            $submitBtn.html(originalText).prop('disabled', false);
        }
    });
});
// ==============================================
// WEBSITE PERFORMANCE AUDITOR ENGINE
// ==============================================

// 🚨 PASTE YOUR GOOGLE API KEY BETWEEN THE QUOTES BELOW 🚨
const GOOGLE_API_KEY = 'AIzaSyDMZdLFxIBwkXTb4qFW5qjjkXQ1w5cira0'; 

document.getElementById('performance-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Grab what the user typed and remove extra spaces
    let urlInput = document.getElementById('site-url').value.trim();
    
    // 🔥 THE MOBILE FIX: Auto-add https:// if they forgot it
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
        urlInput = 'https://' + urlInput;
    }

    const scanBtn = document.getElementById('audit-btn');
    const resultsCard = document.getElementById('audit-results');
    const scoreDisplay = document.getElementById('score-display');
    
    // 1. Trigger the Loading State
    scanBtn.innerHTML = 'Scanning... <i class="fa-solid fa-spinner fa-spin"></i>';
    scanBtn.disabled = true;

    try {
        // 2. Ping Google's Servers with the corrected URL
        const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(urlInput)}&key=${GOOGLE_API_KEY}&strategy=mobile`);
        const data = await response.json();

        // 3. Extract the Score
        const score = data.lighthouseResult.categories.performance.score * 100;

        // 4. Update the UI with the real score
        scoreDisplay.innerText = `${Math.round(score)}/100`;
        
        // Color-code the score psychology
        if (score >= 90) {
            scoreDisplay.style.color = '#00cc66'; 
        } else if (score >= 50) {
            scoreDisplay.style.color = '#ff9900'; 
        } else {
            scoreDisplay.style.color = '#ff3333'; 
        }

        // 5. Reveal the results card
        resultsCard.style.display = 'block';
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        alert('Error scanning website. Please check the URL and try again.');
        console.error(error);
    } finally {
        scanBtn.innerHTML = 'Scan Website <i class="fa-solid fa-magnifying-glass"></i>';
        scanBtn.disabled = false;
    }
});


// ==============================================
// THE EMAIL TRAP (FORMSPREE INTEGRATION)
// ==============================================
document.getElementById('unlock-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('lead-email').value;
    const urlInput = document.getElementById('site-url').value;
    const unlockBtn = this.querySelector('button');
    
    unlockBtn.innerHTML = 'Unlocking...';
    unlockBtn.disabled = true;

    // 🚨 PASTE YOUR NEW AUDITOR FORMSPREE ID BELOW 🚨
    fetch('https://formspree.io/f/mnjbladd', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailInput,
            website_scanned: urlInput,
            message: 'New Website Audit Lead! They want their full performance report.'
        })
    }).then(response => {
        if (response.ok) {
            // Remove the Blur and Show Success Message!
            document.querySelector('.blur-overlay').innerHTML = `
                <h4 style="color: #42867b;"><i class="fa-solid fa-check-circle"></i> Audit Captured</h4>
                <p>Your preliminary diagnostic is complete. Our growth team is compiling your customized strategy and will email the PDF to <b>${emailInput}</b> shortly.</p>
            `;
            document.querySelector('.fake-metrics').style.filter = 'none';
            document.querySelector('.fake-metrics').style.opacity = '1';
        } else {
            alert('Oops! There was a problem submitting your email.');
            unlockBtn.innerHTML = 'Reveal My Report';
            unlockBtn.disabled = false;
        }
    }).catch(error => {
        alert('Oops! There was a network error.');
    });
});

});