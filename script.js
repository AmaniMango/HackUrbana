 //run script after htmls done loading
document.addEventListener('DOMContentLoaded', function() {
    
    //constants an configs
    const TOTAL_PAGES = 10;                //0 .. 9
    const BAD_MAX = 10;                    //0-10 BAD
    const SOSO_MAX = 20;                   //11-20 so-so, 21-30 good

    // the states
    let currentPage = 0;                    // 0-based index (0..9)
    let totalScore = 0;
    // scores per page (0..9)
    let pageScores = new Array(TOTAL_PAGES).fill(0);

    //dom elements
    const pages = document.querySelectorAll('.page');
    const endGood = document.getElementById('endGood');
    const endSoso = document.getElementById('endSoso');
    const endBad = document.getElementById('endBad');
    const resetBtn = document.getElementById('resetBtn');

    //predefine button containers (for dynamic generation)
    const pageBtnGroups = [];
    for (let i = 0; i < TOTAL_PAGES; i++) {
        pageBtnGroups[i] = document.getElementById(`btnGroup${i}`);
    }

    //financial scenarios refs
    const SCENARIOS = [
        {
            title: "Credit Card Purchase",
            description: "You want to buy a new gaming console that costs $500. You have a credit card with a $1,000 limit and $300 in your checking account.",
            options: [
                "Put the whole $500 on your credit card and pay it off over 6 months with interest",
                "Use your debit card and drain your checking account to $0",
                "Save $200 more over 2 months, then put $300 from savings + $200 on credit card, pay in full"
            ]
        },
        {
            title: "First Paycheck",
            description: "You just got your first job paying $2,000/month. You need to decide what to do with the money.",
            options: [
                "Spend it all on clothes, dining out, and entertainment",
                "Put 50% in savings, spend 50% on wants",
                "Follow 50/30/20 rule: 50% needs, 30% wants, 20% savings"
            ]
        },
        {
            title: "Emergency Expense",
            description: "Your car needs $800 in unexpected repairs. You have $1,000 in savings.",
            options: [
                "Put it on a high-interest credit card and hope to pay later",
                "Borrow from a payday lender",
                "Use $800 from your emergency savings"
            ]
        },
        {
            title: "Student Loans",
            description: "You have $10,000 in student loans at 4% interest. You got a $5,000 bonus at work.",
            options: [
                "Buy a new TV and take a vacation",
                "Put $2,000 toward loans, spend $3,000",
                "Put all $5,000 toward loans"
            ]
        },
        {
            title: "Buying a Phone",
            description: "Your phone broke. A new flagship phone costs $1,200. A refurbished model costs $400.",
            options: [
                "Finance the $1,200 phone with a 24-month payment plan at 25% APR",
                "Buy the refurbished phone with cash you have",
                "Put the $1,200 phone on a 0% APR card but only pay minimum"
            ]
        },
        {
            title: "Investment Choice",
            description: "You have $1,000 to invest for the long term (20+ years).",
            options: [
                "Put it all in one 'hot' stock tip from social media",
                "Keep it in a savings account earning 0.5%",
                "Invest in a low-cost index fund tracking the S&P 500"
            ]
        },
        {
            title: "Rent vs. Buy",
            description: "You plan to stay in a city for 2 years for a job. You have enough for a down payment.",
            options: [
                "Buy a house anyway, hoping prices go up",
                "Rent an apartment",
                "Buy a condo and rent it out when you leave"
            ]
        },
        {
            title: "Grocery Shopping",
            description: "You're grocery shopping on a $100 weekly budget.",
            options: [
                "Buy all prepared meals and expensive brands",
                "Shop without a list, buy what looks good",
                "Make a list, check sales, use coupons, buy in bulk for staples"
            ]
        },
        {
            title: "Windfall Gift",
            description: "Your grandmother gave you $5,000 for your future.",
            options: [
                "Spend it all on a designer bag and concert tickets",
                "Put it in a savings account for a future car",
                "$3,000 in Roth IRA, $1,000 in emergency fund, $1,000 for something fun"
            ]
        },
        {
            title: "Subscription Services",
            description: "You have 8 different subscriptions totaling $120/month (Netflix, Spotify, gym, meal kits, etc.).",
            options: [
                "Keep them all, you 'might use them'",
                "Cancel everything, even ones you use daily",
                "Audit usage, keep the 3 you actually use, cancel the rest"
            ]
        }
    ];

    //fixed point val for every page
    //each page has buttons that add 1, 2, or 3 points in a SPECIFIC order
    //1 = Bad choice, 2 = Okay choice, 3 = Best choice
    
    const PAGE_POINTS = [
        [1, 2, 3], //page 0: First button = 1pt , Second = 2pt , Third = 3pt 
        [2, 1, 3], //page 1: First button = 2pt , Second = 1pt, Third = 3pt 
        [3, 1, 2], //page 2: First button = 3pt , Second = 1pt, Third = 2pt 
        [1, 3, 2], //page 3: First button = 1pt , Second = 3pt , Third = 2pt 
        [2, 3, 1], //page 4: First button = 2pt , Second = 3pt , Third = 1pt 
        [3, 2, 1], //page 5: First button = 3pt , Second = 2pt , Third = 1pt 
        [1, 2, 3], //page 6: First button = 1pt, Second = 2pt , Third = 3pt 
        [2, 1, 3], //page 7: First button = 2pt , Second = 1pt , Third = 3pt 
        [3, 1, 2], //page 8: First button = 3pt , Second = 1pt, Third = 2pt 
        [1, 3, 2]  //page 9: First button = 1pt , Second = 3pt , Third = 2pt
    ];

    //BUTTON VISUAL ORDER
    //Each inner array is a shuffle of [0, 1, 2] representing positions
    const VISUAL_ORDER = [
        [0, 1, 2], // Page 0: original order
        [1, 0, 2], // Page 1: second button first, first button second, third button last
        [2, 0, 1], // Page 2:third button first, first button second, second button last
        [0, 2, 1], // Page 3:first button first, third button second, second button last
        [1, 2, 0], // Page 4:second button first, third button second, first button last
        [2, 1, 0], // Page 5:third button first, second button second, first button last
        [0, 1, 2], // Page 6: Origin order
        [1, 0, 2], // Page 7: 
        [2, 0, 1], // Page 8: 
        [0, 2, 1]  // Page 9: 
    ];

    function getButtonMapping(pageIndex) {
        const points = PAGE_POINTS[pageIndex];        //[1,2,3] in LOGICAL order
        const visualOrder = VISUAL_ORDER[pageIndex];   //[1,0,2] means visual pos0 gets logical pos1, etc.
        
        //create mapping array where index = visual position, value = points
        const mapping = [];
        for (let visualPos = 0; visualPos < 3; visualPos++) {
            const logicalPos = visualOrder[visualPos];
            mapping[visualPos] = points[logicalPos];
        }
        
        return mapping; //returns [points_for_visual_button_0, points_for_visual_button_1, points_for_visual_button_2]
    }

    //temporary emojis for easily identifying whie testing 
    function getChoiceRating(points) {
        switch(points) {
            case 1: return '❌ BAD';
            case 2: return '⚠️ OKAY';
            case 3: return '✅ BEST';
            default: return '';
        }
    }

    //temporary emojis for easily identifying whie testing 
    function getRatingEmoji(points) {
        switch(points) {
            case 1: return '❌';
            case 2: return '⚠️';
            case 3: return '✅';
            default: return '';
        }
    }

    //create buttons for a specific page
    function buildButtonsForPage(pageIndex) {
        const container = pageBtnGroups[pageIndex];
        if (!container) return;
        container.innerHTML = ''; //clear the old 

        //Get the point values for each visual position
        const buttonPoints = getButtonMapping(pageIndex);
        
        //Log mapping to see what each buttob does
        console.log(`===== PAGE ${pageIndex}: ${SCENARIOS[pageIndex].title} =====`);
        console.log(`LOGICAL order (points by position): ${PAGE_POINTS[pageIndex]} (1=Bad, 2=Okay, 3=Best)`);
        console.log(`VISUAL order (which logical pos appears where): ${VISUAL_ORDER[pageIndex]}`);
        console.log(`RESULT: Visual button 0 adds ${buttonPoints[0]} points (${getChoiceRating(buttonPoints[0])})`);
        console.log(`RESULT: Visual button 1 adds ${buttonPoints[1]} points (${getChoiceRating(buttonPoints[1])})`);
        console.log(`RESULT: Visual button 2 adds ${buttonPoints[2]} points (${getChoiceRating(buttonPoints[2])})`);
        console.log(`------------------------`);
        
        
        //make 3 buttons in VISUAL order
        for (let visualPos = 0; visualPos < 3; visualPos++) {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            
            //option text for button
            const optionText = SCENARIOS[pageIndex].options[visualPos];
            const points = buttonPoints[visualPos];
            const ratingEmoji = getRatingEmoji(points);
            const ratingText = getChoiceRating(points);
            
            //option text to buttons
            const shortOption = optionText.length > 200 ? optionText.substring(0, 200) + '…' : optionText;
            btn.textContent = `${ratingEmoji} ${shortOption}`;
            
            //title attribute for hover tooltip with full option text
            btn.title = `${ratingText}: ${optionText}`;
            
            //point value based on our mapping
            btn.dataset.points = points;
            btn.dataset.page = pageIndex;
            
            //data attribute to help with debugging
            btn.dataset.pointValue = points;
            
            btn.addEventListener('click', pageChoiceHandler);
            container.appendChild(btn);
        }
    }

    //update score displays on all pages
    function refreshAllScoreDisplays() {
        for (let p = 0; p < TOTAL_PAGES; p++) {
            const badge = document.getElementById(`scoreDisplay${p}`);
            if (badge) {
                badge.textContent = `${totalScore} pts`;
            }
        }
    }

    //switch to a specific page
    function showPage(pageIndex) {
        //hide all pages
        pages.forEach(p => p.style.display = 'none');
        //hide end screens
        endGood.style.display = 'none';
        endSoso.style.display = 'none';
        endBad.style.display = 'none';

        if (pageIndex >= 0 && pageIndex < TOTAL_PAGES) {
            //show the game page
            const targetPage = document.getElementById(`page${pageIndex}`);
            if (targetPage) targetPage.style.display = 'block';
            refreshAllScoreDisplays();
            
            //log current page info when showing it
            console.log(`\n--- NOW ON PAGE ${pageIndex}: ${SCENARIOS[pageIndex].title} ---`);
            const buttonPoints = getButtonMapping(pageIndex);
            console.log(`To get BAD ending (0-10): Choose the ❌ BAD options (1 point each)`);
            console.log(`To get SO-SO ending (11-20): Choose the ⚠️ OKAY options (2 points each)`);
            console.log(`To get GOOD ending (21-30): Choose the ✅ BEST options (3 points each)`);
            console.log(`On THIS page: Visual button 0 = ${buttonPoints[0]}pt (${getChoiceRating(buttonPoints[0])}), Visual button 1 = ${buttonPoints[1]}pt (${getChoiceRating(buttonPoints[1])}), Visual button 2 = ${buttonPoints[2]}pt (${getChoiceRating(buttonPoints[2])})`);
            
        } else {
            //if invalid, fallback to page0
            document.getElementById('page0').style.display = 'block';
            refreshAllScoreDisplays();
        }
    }

    //show final end screen based on totalScore
    function showEndScreen() {
        //hide all pages
        pages.forEach(p => p.style.display = 'none');
        endGood.style.display = 'none';
        endSoso.style.display = 'none';
        endBad.style.display = 'none';

        console.log(`\n========== GAME OVER ==========`);
        console.log(`FINAL SCORE: ${totalScore} points`);
        
        if (totalScore <= BAD_MAX) {
            console.log(`RESULT: BAD ENDING (0-10 points) - Time to learn financial basics!`);
            endBad.style.display = 'block';
        } else if (totalScore <= SOSO_MAX) { //11 to 20
            console.log(`RESULT: SO-SO ENDING (11-20 points) - Good start, keep learning!`);
            endSoso.style.display = 'block';
        } else { //21 to 30
            console.log(`RESULT: GOOD ENDING (21-30 points) - Financial literacy champion!`);
            endGood.style.display = 'block';
        }
    }

    //choice handler
    function pageChoiceHandler(ev) {
        const btn = ev.currentTarget;
        const pageIdx = parseInt(btn.dataset.page, 10);
        const points = parseInt(btn.dataset.points, 10);

        //add to total and record page score
        const oldPageVal = pageScores[pageIdx] || 0;
        totalScore = totalScore - oldPageVal + points;
        pageScores[pageIdx] = points;

        const rating = getChoiceRating(points);
        console.log(`\n>>> Page ${pageIdx} choice: ${rating} (+${points} points) - total now: ${totalScore}`);

        //last page so show the end screen (theres 3 versions)
        if (pageIdx === TOTAL_PAGES - 1) {
            showEndScreen();
        } else {
            //otherwise go to next page
            currentPage = pageIdx + 1;
            showPage(currentPage);
        }
        //refresh badges after score change
        refreshAllScoreDisplays();
    }

    //reset game
    function resetGame() {
        totalScore = 0;
        pageScores.fill(0);
        currentPage = 0;

        //rebuild buttons for every page
        for (let i = 0; i < TOTAL_PAGES; i++) {
            buildButtonsForPage(i);
        }

        //display first page
        showPage(0);
        refreshAllScoreDisplays();
        
        console.log('\n========== GAME RESET ==========');
        console.log('Financial Literacy Game - Make smart choices!');
        console.log('❌ BAD = 1 point | ⚠️ OKAY = 2 points | ✅ BEST = 3 points');
    }

    //setup initially at start
    function initGame() {
        console.log('%c💰 FINANCIAL LITERACY GAME 💰', 'font-size: 18px; font-weight: bold; color: #2ecc71;');
        console.log('Make 10 financial decisions. Your total score determines your ending:');
        console.log('❌ BAD ending: 0-10 points (poor financial choices)');
        console.log('⚠️ SO-SO ending: 11-20 points (mixed decisions)');
        console.log('✅ GOOD ending: 21-30 points (financially savvy!)\n');
        
        //build buttons for each page
        for (let i = 0; i < TOTAL_PAGES; i++) {
            buildButtonsForPage(i);
        }
        //set current page = 0 and display
        currentPage = 0;
        showPage(0);
        refreshAllScoreDisplays();
    }

    //attach reset button
    resetBtn.addEventListener('click', resetGame);

    //start
    initGame();
});