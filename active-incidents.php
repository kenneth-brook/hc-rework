<!DOCTYPE html>
<html lang="en-US">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>Active Incidents | Hamilton County 9-1-1 Emergency Communications District</title>
    <meta name="Description"
        content="Active incidents are dispatched from the Hamilton County 9-1-1 Center. Contents are updated regularly from the Computer Aided Dispatch system." />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.8.0/dist/leaflet.css"
        integrity="sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ=="
        crossorigin="" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.fullscreen@1.6.0/Control.FullScreen.css" type="text/css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@latest/dist/MarkerCluster.css"
        type="text/css" />
    <script src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js"
        integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ=="
        crossorigin=""></script>
    <script type="text/javascript" src="https://unpkg.com/leaflet.fullscreen@1.6.0/Control.FullScreen.js"></script>
    <script type="text/javascript" src="https://unpkg.com/leaflet.markercluster@latest/dist/leaflet.markercluster.js">
    </script>
    <script type="text/javascript" src="https://hc911.org/js/kennetic-popup.js"></script>




    <?php include "includes/header-code.php"; ?>
</head>



<body onload=startMap()>




    <div id="inactive-popup" class="inactive">
        <div id="popup">
            <div>
                <h4>Sorry for the interruption</h4>
                <p>Due to the high volume of traffic to our site we have limited session time to 15 minutes.<br> This is
                    to help give everyone a chance to use this map running at its best.<br> If you wish to continue
                    viewing this content just click the button below. </p>
                <button class="btn" id="close-btn">
                    Continue Viewing
                </button>
            </div>
        </div>
    </div>
    <div id="page" class="site page-active-incidents">
        <header id="masthead" class="site-header clearfix" role="banner">
            <?php include "includes/appbar-map.php"; ?>

            <div class="header-image" id="mapHouse">


                <div class="map-area">
                    <div id="map" class="map-landing">
                        <div id="weathBar"></div>
                    </div>
                    <button id="btn" onclick="mapToggle()" class="mapButton">
                        OPEN MAP
                    </button>
                    <div class="message">

                        <div class="inner">
                            <p>The following active incidents are dispatched from the <strong>Hamilton County 9-1-1
                                    Center</strong>.
                                <br>The contents are updated regularly from the <strong>CAD (Computer Aided
                                    Dispatch)</strong> system.
                            </p>
                            <p><small class="font-italic">Not all incident types are displayed on this page.</small></p>
                        </div>
                        <button type="button" class="close">Close</button>
                        <a href="#list">
                            <div class="jumpButt">
                                Jump To List View
                            </div>
                        </a>
                    </div>
                </div>
                <div class="header-title-wrapper">
                    <div class="container-md">
                        <h1 class="main-logo"><a href="./">Hamilton County 9-1-1 Emergency Communications District</a>
                        </h1>
                        <h1 class="header-title">Active Incidents</h1>
                    </div>
                </div>
            </div>
            <div class="data-status-wrapper">
                <div class="data-status">
                    <div class="container-md">
                        <div class="links">
                            <ul>
                                <li><a href="9-1-1-text.php">9-1-1 and Texting</a></li>
                                <li><a href="9-1-1-for-kids.php">9-1-1 for Kids</a></li>
                            </ul>
                        </div>
                        <div class="data-status-inner" id="list">
                            <p>Click to Filter by Status:</p>
                            <ul>
                                <li><label><input type="radio" name="rStatus" value="all" checked onclick="call()">
                                        <span>All
                                            Status</span></label></li>
                                <li><label><input type="radio" name="rStatus" value="Reported" onclick="call()">
                                        <span>R
                                            =
                                            Reported</span></label></li>
                                <li><label><input type="radio" name="rStatus" value="Enroute" onclick="call()">
                                        <span>E
                                            =
                                            Enroute</span></label>
                                </li>
                                <li><label><input type="radio" name="rStatus" value="On Scene" onclick="call()">
                                        <span>OS = On
                                            Scene</span></label></li>
                                <li><label><input type="radio" name="rStatus" value="Transporting" onclick="call()">
                                        <span>T =
                                            Transporting</span></label></li>
                                <li><label><input type="radio" name="rStatus" value="At Hospital" onclick="call()">
                                        <span>H = At
                                            Hospital</span></label></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="header-lower">
                <div class="data-filter">
                    <div class="container">
                        <div class="data-filter-inner">
                            <div class="data-filter-group">
                                <label for="data-type">Filter by Type:</label>
                                <div class="select-wrapper">

                                    <select id="dtype" name="typefilter" class="custom-select" onchange="call()">
                                        <option value="all" selected>All Agency Types</option>
                                        <option value="Law">Law</option>
                                        <option value="Fire">Fire</option>
                                        <option value="EMS">EMS</option>
                                        <option value="HC911">Road Closure</option>
                                    </select>

                                </div>
                            </div>
                            <div class="data-filter-group">
                                <label for="data-agency">Filter by Agency:</label>
                                <div class="select-wrapper">
                                    <select name="agencyfilter" id="data-agency" class="custom-select"
                                        onchange="call()">
                                        <option value="all">All Agencies</option>
                                        <option value="Collegedale PD">Collegedale Police Department</option>
                                        <option value="Chattanooga PD">Chattanooga Police Department</option>
                                        <option value="East Ridge PD">East Ridge Police Department</option>
                                        <option value="Hamilton Co SO">Hamilton County Sheriff's Office</option>
                                        <option value="Red Bank PD">Red Bank Police Department</option>
                                        <option value="Signal Mountain PD">Signal Mountain Police Department</option>
                                        <option value="Chattanooga FD">Chattanooga Fire Department</option>
                                        <option value="East Ridge FD">East Ridge Fire Department</option>
                                        <option value="Red Bank FD">Red Bank Fire Department</option>
                                        <option value="Chattanooga Hamilton Co Rescue">Hamilton County (Volunteer) Fire
                                            & Rescue</option>
                                        <option value="Signal Mountain FD">Signal Mountain Fire Department</option>
                                        <option value="Hamilton Co EMS">Hamilton County EMS</option>
                                        <option value="Soddy Daisy FD">Soddy-Daisy Fire Department</option>
                                        <option value="Soddy Daisy PD">Soddy-Daisy Police Department</option>
                                    </select>
                                </div>
                            </div>
                            <div class="data-filter-group">
                                <label for="data-area">Filter by Area:</label>
                                <div class="select-wrapper">
                                    <select name="areafilter" id="data-area" class="custom-select" onchange="call()">
                                        <option value="all">All Areas</option>
                                        <option value="COLLEGEDALE">Collegedale</option>
                                        <option value="CHATTANOOGA">Chattanooga</option>
                                        <option value="EAST RIDGE">East Ridge</option>
                                        <option value="HAMILTON COUNTY">Hamilton County</option>
                                        <option value="RED BANK">Red Bank</option>
                                        <option value="SIGNAL MOUNTAIN">Signal Mountain</option>
                                        <option value="SODDY DAISY">Soddy-Daisy</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <?php include "includes/secondary-menu.php"; ?>
            </div>
        </header>
        <!-- /#masthead -->

        <main id="content" class="site-content clearfix" role="main">
            <div class="container">
                <section class="clearfix">
                    <table id="sortTable">
                        <thead>
                            <tr style="height: 85px;">
                                <th onclick="sortTable(0)" class="sorting"><span>Type</span></th>
                                <th onclick="sortTable(1)" class="sorting"><span>Status</span></th>
                                <th onclick="sortTable(2)" class="sorting col-incident"><span>Master Incident</span>
                                </th>
                                <th onclick="sortTable(3)" class="sorting sorting_desc"><span>Time
                                        Created</span></th>
                                <!--<td class="mobile-visible"></td>
                                <td class="mobile-visible"></td>-->
                                <th onclick="sortTable(4)" class="sorting"><span>Agency</span></th>
                                <th onclick="sortTable(5)" class="sorting"><span>Event</span></th>
                                <th onclick="sortTable(6)" class="sorting"><span>Location</span><br>Click Buttons to
                                    Locate on Map</th>
                                <th onclick="sortTable(7)" class="sorting col-area"><span>Area</span></th>
                            </tr>
                        </thead>
                        <tbody id="chart"></tbody>
                    </table>
                </section>
            </div>
        </main>

        <footer id="colophone" class="site-footer clearfix" role="contentinfo">
            <?php include "includes/footer.php"; ?>
        </footer>
        <!-- /#colophone -->

        <?php include "includes/quick-links.php"; ?>
        <?php include "includes/alert.php"; ?>
    </div>
    <!-- /#page -->

    <?php include "includes/footer-code.php"; ?>


    <script type="text/javascript" src="js/select.js"></script>
    <script>
    $('.map-area .message button').click(function() {
        $('.map-area .message').fadeOut(200);
    });

    $('.col-next a').click(function(e) {
        e.preventDefault();
        $(this).parents('tr').addClass('last-visible');
    });
    $('.col-prev a').click(function(e) {
        e.preventDefault();
        $(this).parents('tr').removeClass('last-visible');
    });

    // DUMMY SORT
    $('table .sorting').click(function(e) {
        $(this).siblings().removeClass('sorting_asc').removeClass('sorting_desc');
        if ($(this).hasClass('sorting_asc')) {
            $(this).removeClass('sorting_asc').addClass('sorting_desc');
        } else {
            $(this).addClass('sorting_asc').removeClass('sorting_desc');
        }
    });
    </script>

    <script>
    function sortTable(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("sortTable");
        switching = true;
        // Set the sorting direction to ascending:
        dir = "asc";
        /* Make a loop that will continue until
        no switching has been done: */
        while (switching) {
            // Start by saying: no switching is done:
            switching = false;
            rows = table.rows;
            /* Loop through all table rows (except the
            first, which contains table headers): */
            for (i = 1; i < (rows.length - 1); i++) {
                // Start by saying there should be no switching:
                shouldSwitch = false;
                /* Get the two elements you want to compare,
                one from current row and one from the next: */
                x = rows[i].getElementsByTagName("TD")[n];
                y = rows[i + 1].getElementsByTagName("TD")[n];
                /* Check if the two rows should switch place,
                based on the direction, asc or desc: */
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if (shouldSwitch) {
                /* If a switch has been marked, make the switch
                and mark that a switch has been done: */
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                // Each time a switch is done, increase this count by 1:
                switchcount++;
            } else {
                /* If no switching has been done AND the direction is "asc",
                set the direction to "desc" and run the while loop again. */
                if (switchcount == 0 && dir == "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
    }
    </script>

    <script>
    const btn = document.querySelector("#btn");

    function textSwap() {

        if (btn.innerHTML == "CLOSE MAP") {
            btn.innerHTML = "OPEN MAP";
            btn.style.marginTop = "0";
        } else {
            btn.innerHTML = "CLOSE MAP";
            btn.style.marginTop = "55px";
        }

    }

    function textOpen() {
        btn.innerHTML = "CLOSE MAP";
    }

    document.getElementById('close-btn').addEventListener('click', (e) => {
        document.getElementById('inactive-popup').style.visibility = "hidden";
        window.location.reload();
    });
    </script>

    <script type="text/javascript" src="js/map.js"></script>
    <script type="text/javascript" src="js/fbPop.js"></script>
    <script>
    fbButton();
    </script>
    
</body>
<!-- <script src=https://static.elfsight.com/platform/platform.js data-use-service-core defer></script> -->
</html>

