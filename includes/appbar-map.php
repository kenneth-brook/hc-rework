<div class="appbar" id="appBar">
    <div class="appbar-top">
        <div class="inner container-md">
            <h1 class="mobile-logo">
                <a href="./">Hamilton County 9-1-1 Emergency Communications District</a>
            </h1>
            <button type="button" class="mobile-menu-btn">Navigation</button>
            <!-- <button type="button" class="mobile-search-btn">Search</button> -->
            <nav class="desktop-nav">
                <ul class="menu-list menu">
                    <li><a href="#">9-1-1 Center</a></li>
                    <li><a href="#">FAQs</a></li>
                    <li><a href="#">Public Information</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Personnel</a></li>
                    <li><a href="#">Contact Us</a></li>
                </ul>
                <ul class="social-media menu">
                    <li><a href="#" onclick="fbClick(); return false;" class="facebook">facebook</a></li>
                    <li><a href="https://twitter.com/HC911ECD" target="_blank" class="twitter">twitter</a></li>
                </ul>
            </nav>
            <nav class="submenu-area">
                <div class="container-fluid">
                    <?php include "primary-menu.php"; ?>

                    <div class="menu-after">
                        <ul class="social-media menu">
                            <li>
                                <a href="#" onclick="fbClick(); return false;" class="facebook">facebook</a>
                            </li>
                            <li>
                                <a href="https://twitter.com/HC911ECD" target="_blank" class="twitter">twitter</a>
                            </li>
                        </ul>
                        <div class="live-clock">
                            <!--  <?php echo date('H:i:s \<\s\m\a\l\l\>a\<\/\s\m\a\l\l\>'); ?> -->
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </div>

    <div class="appbar-bottom">
        <div class="container-md">
            <div class="inner">
                <div class="incidents-list-wrapper">
                    <ul class="incidents-list">
                        <li>
                            <a href="active-incidents.php" class="incident-data">Current Active Incidents: <strong
                                    id="current">
                                    <div class="lds-ring">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </strong></a>
                        </li>
                        <li>
                            <a href="active-incidents.php" class="incident-data">Daily Total Incidents:
                                <strong id="dayCount">
                                    <div class="lds-ring">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </strong></a>
                        </li>
                        <li>
                            <a href="active-incidents.php" class="incident-data">Yearly Incidents:
                                <strong id="yearCount">
                                    <div class="lds-ring">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </strong></a>
                        </li>
                    </ul>
                </div>
                <!-- <div class="search-form-wrapper">
                    <button type="button" class="search-form-toggler">Search</button>
                    <form class="search-form">
                        <input type="search" name="s" class="search-form-input" placeholder=" Search for anything"
                            tabindex="-1">
                    </form>
                </div> -->
                <div class="live-clock">
                    <?php echo date('H:i:s \<\s\m\a\l\l\>a\<\/\s\m\a\l\l\>'); ?>
                </div>
            </div>
        </div>
    </div>
    <div id="ticker">
        <marquee style="background-color: black; height: 40px; color: white;">
            <?php include "ticker.php"; ?>
        </marquee>
    </div>

    <script>
    function ticker() {
        const ticker = document.getElementById('tickerContent');
        const tickerBox = document.getElementById('ticker');

        if (ticker.textContent == "") {
            tickerBox.style = "display: none;";
        }
    }

    function countStart() {
        countCall();
        const countTimer = setInterval(countCall, 600000);
    }

    const cur_url = 'https://hc911server.com/api/calls';
    const countUrl = 'https://hc911server.com/api/count';
    //const countUrl = 'http://localhost:8080/api/count';
    const thisDay = new Date().toDateString();
    const tYear = new Date().getFullYear();
    const cYear = 2024;
    let countPool = [];
    let dayPool = [];
    let cur_datapool = [];
    let yearCount = 0;
    let dayCount = 0;

    function countCall() {
        fetch(countUrl)
            .then(response => response.json()) //converts request from fetch to json
            .then(data => {
                console.log(data);
                if (data.length != 2) {
                    //location.reload();
                }
                yearCount = Object.values(data[0][0]);
                dayCount = Object.values(data[1][0]);

                document.getElementById('yearCount').innerHTML = yearCount;

                document.getElementById('dayCount').innerHTML = dayCount;

                
            });

    }

    function currentCall() {
        fetch(cur_url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Frontend-Auth": "my-secure-token",  // Required for security
                "Origin": "https://www.hamiltontn911.gov"  // Helps with CORS and verification
            }
        })
        .then(response => response.json())
        .then(data => {
            // Assume the response is an array (or adjust based on your actual data structure)
            cur_datapool = data;
            let count = cur_datapool.length;
            document.getElementById('current').innerHTML = count;
            console.log('count: ', count);
            document.getElementById('current').innerHTML = count;
        })
        .catch(error => console.error("🚨 API Call Failed:", error));
    }

    currentCall()
    countStart();
    ticker();
    </script>
</div>