const idGrab = document.getElementById('mapHouse');

function fbButton() {
    const fbButWrap = document.createElement("div");
    idGrab.appendChild(fbButWrap);
    fbButWrap.className = 'fbButWrap';
    fbButWrap.setAttribute('id', 'buttDrop');

    const fbButLink = document.createElement('a');
    fbButWrap.appendChild(fbButLink);
    fbButLink.onclick = function(){
        idGrab.removeChild(fbButWrap);
        fbFeed();
    }

    const fbTopText = document.createElement('p');
    fbButLink.appendChild(fbTopText);
    fbTopText.innerText = "Show";

    const fbIco = document.createElement('img');
    fbButLink.appendChild(fbIco);
    fbIco.src = "images/Group 1130.png";

    const fbBottomText = document.createElement('p');
    fbButLink.appendChild(fbBottomText);
    fbBottomText.innerText = "Feed";

    fbButtDrop();
}

function fbFeed() {
    const fbFeedWrap = document.createElement("div");
    idGrab.appendChild(fbFeedWrap);
    fbFeedWrap.className = 'fbFeedWrap';
    fbFeedWrap.id = 'fbFeedWrap';
    fbFeedWrap.style.display = "none"

    const feedHeadWrap = document.createElement("div");
    fbFeedWrap.appendChild(feedHeadWrap);
    feedHeadWrap.className = "feedHeadWrap";

    const wrapLeft = document.createElement("div");
    feedHeadWrap.appendChild(wrapLeft);
    wrapLeft.className = "wrapLeft"

    const wrapRight = document.createElement("div");
    feedHeadWrap.appendChild(wrapRight);
    wrapRight.className = "wrapRight";

    const leftImg = document.createElement('img');
    wrapLeft.appendChild(leftImg);
    leftImg.src = "images/Group 1130.png";

    const leftText = document.createElement('p');
    wrapLeft.appendChild(leftText);
    leftText.innerText = "Facebook Feed";

    const wrapRightLink = document.createElement("a");
    wrapRight.appendChild(wrapRightLink);
    wrapRightLink.onclick = function(){
        fbClick();
    }

    const rightText = document.createElement('p');
    wrapRightLink.appendChild(rightText);
    rightText.innerText = "close";

    const rightXWrap = document.createElement("div");
    wrapRightLink.appendChild(rightXWrap);
    rightXWrap.className = "rightXWrap";

    const rightX = document.createElement('p');
    rightXWrap.appendChild(rightX);
    rightX.innerText = "X";

    const feedBody = document.createElement("div");
    fbFeedWrap.appendChild(feedBody);
    feedBody.className = "feedBody";
    feedBody.innerHTML = '<div class="elfsight-app-5866a186-9389-4272-b820-b026393cf266"></div>'
}

function fbButtDrop() {
    document.getElementById('buttDrop').style.display = 'block';

// Set up a 90-second timer
setTimeout(function() {
    // Change the display property to none after 30 seconds
    document.getElementById('buttDrop').style.display = 'none';
}, 10); // 30 seconds in milliseconds

}

function fbClick() {
    const fbFeedWrap = document.getElementById('fbFeedWrap');

    fbFeedWrap.style.display = fbFeedWrap.style.display === 'block' ? 'none' : 'block';
    if (!document.getElementById('elfsight-platform-script')) {
        const script = document.createElement('script');
        script.id = 'elfsight-platform-script';
        script.src = 'https://static.elfsight.com/platform/platform.js';
        script.setAttribute('data-use-service-core', '');
        script.async = true;
        script.defer = true;
    
        // Append the script to the document head
        document.head.appendChild(script);
    };
}

fbFeed()