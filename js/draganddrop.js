/// <reference path="../jquery-1.10.2.js" />

/*global options*/
var DragonFP = (function () {
    var self = this;
    self.options = {};
    self.containerId;
    self.homes = [];

    function create(containerId, opts) {

        var defaultOptions = {
            showFeatureList: true,                                                          //show list of home options
            //refreshResults: false,                                                        //load results on same page or new page
            debugMode: true,                                                                //show table with debug options
            showTabs: true,                                                                 //show tabs for singlewide and doublewide
            homeHeight: 15,                                                                 //size of each home section/room
            imagePath: 'https://www.cmhinfo.com/Content/draganddropsearch/images/',         //path to room image location
            //imagePath: 'http://localhost:59197/Content/draganddropsearch/images/',
            singleDouble: 'double',                                                         //start with singlewide, doublewide, or tabs for both
            drawDecoration: true,
            drawInstructions: true,
            postalCode: null
        };

        $.extend(self.options, defaultOptions, opts);

        self.containerId = containerId;

        var original_roombox = $('div#roombox').clone(true);

        $(document.body).on('click', 'div#delete_room', function () {
            var roomToDelete = ($('div#delete_room').closest('div.draggable_room').attr('id'));
            removeRoomFromHome(roomToDelete);
        });

        //feed in 3 for a singlewide, and 7 for a doublewide
        if (self.options.singleDouble === 'single') {
            initializeHome(3, self.options.homeHeight);
            drawInstructionOverlay('single');
        } else {
            initializeHome(7, self.options.homeHeight * 2);
            drawInstructionOverlay('double');
        }

        $('#style_double').on('click', function () {
            var self = this;
            $('div#roombox').empty().append(original_roombox.html());
            initializeHome(7, options.homeHeight * 2);
            drawInstructionOverlay('double');
            $('div#master-bedroom-horiz').show();
            $('div#master-bedroom-vert').show();
            $('div#master-bedroom').hide();
            $('#style_single').removeClass('active_tab');
            $(self).addClass('active_tab');
        });

        $('#style_single').on('click', function () {
            var self = this;
            $('div#roombox').empty().append(original_roombox.html());
            initializeHome(3, options.homeHeight);
            drawInstructionOverlay('single');
            $('div#master-bedroom-horiz').hide();
            $('div#master-bedroom-vert').hide();
            $('div#master-bedroom').show();
            $('#style_double').removeClass('active_tab');
            $(self).addClass('active_tab');
        });

    }

    /**
     * @description: Draws the two main divs for the Drag and Drop Tool
     */
    function drawContainers() {
        if ((!$('#home_search_left').length) && (!$('#roombox').length)) {
            $(self.containerId).append('<div id="home_search_left"></div>' +
                                       '<div id="roombox"></div>');
        }
    }

    /**
     * @description: Draws the initial layout for the Drag and Drop Tool
     */
    function drawStage() {
        if (!$('#stage').length) {
            $('#home_search_left').append('<div id="stage">' +
                                            '<div id="droppable"></div>' +
                                          '</div>');
        }
    }

    /**
     * @description: Draws the 4, or 8 sections of the home
     * @param int numSquares - feed in 3 for a singlewide, or 7 for a doublewide
     */
    function drawHome(numSquares) {
        //clear out what's already there to draw the type of home the user asks for
        $('#droppable').empty();

        for (var i = 0; i <= numSquares; i++) {
            $('#droppable').append('<div id="dropregion_' + i + '" class="drop_regions"></div>');
        }
    }

    /**
     * @description: Draws plants or other decorations around the floor plan
     */
    function drawDecoration() {
        if (self.options.drawDecoration === true) {
            $('#stage').append('<img src="' + options.imagePath + 'shrubs.png" id="shrubs">');
            $('#home_listings').append('<img src="' + options.imagePath + 'shrubs.png" id="shrubs">');
        }
    }

    function showErrorBox(errorText) {
        $('#stage').append('<div id="errors">' + errorText + '</div>');
    }

    /**
     * @description: Draws instructions over the drop area
     */
    function drawInstructionOverlay(homeType) {
        if (self.options.drawInstructions === true || homeType === 'single') {
            $('#instructions').remove();
        }
        $('#stage').append('<div id="instructions" class="double">&nbsp;</div>');
    }

    /**
     * @description: Rules that determine which rooms can be dropped on which squares in the home
     * @param roomNames - an array of rooms
     */
    function assignDropRegions(roomNames) {
        var allRegions = 'drag_region_0 drag_region_1 drag_region_2 drag_region_3 drag_region_4 drag_region_5 drag_region_6 drag_region_7';

        switch (roomNames) {
            case 'master-bedroom':
                $('div#master-bedroom').addClass('drag_region_0 drag_region_1 drag_region_2 drag_region_3').css('display', 'none');
                break;
            case 'master-bedroom-horiz':
                $('div#master-bedroom-horiz').addClass('drag_region_0 drag_region_2 drag_region_4 drag_region_6');
                break;
            case 'master-bedroom-vert':
                $('div#master-bedroom-vert').addClass('drag_region_0 drag_region_3');
                break;
            case 'bedroom-double':
                $('div#bedroom-double').addClass(allRegions);
                break;
            case 'bedroom-triple':
                $('div#bedroom-triple').addClass(allRegions);
                break;
            case 'office-den':
                $('div#office-den').addClass(allRegions);
                break;
            case 'living-room':
                $('div#living-room').addClass(allRegions);
                break;
            case 'kitchen':
                $('div#kitchen').addClass(allRegions);
                break;
            case 'dining':
                $('div#dining').addClass(allRegions);
                break;
            case 'bathroom':
                $('div#bathroom').addClass(allRegions);
                break;
            default:
                break;
        }
    }

    /**
     * @description: Draws the tabs to switch between singlewide and doublewide
     */
    function drawTabs() {
        if ((!$('#home_style_tabs').length) && (self.options.showTabs === true)) {
            $('#home_search_left').append('<div id="home_style_tabs">' +
                '<a href="#" id="style_double" class="active_tab">Double Unit Home</a>' +
                '<a href="#" id="style_single">Single Unit Home</a></div>');
        }
    }

    /**
     * @description: Draws the initial box of homes 
     * @param int numSquares - feed in 3 for a singlewide, or 7 for a doublewide
     * @param int homeHeight - this determines the dimensions of each section of the home, measure in VW (viewport width)
     */
    function initializeHome(numSquares, homeHeight) {
        var roomArray = [
            'bathroom',
            'kitchen',
            'living-room',
            'bedroom-double',
            'bedroom-triple',
            'office-den',
            'dining',
            'master-bedroom-horiz',
            'master-bedroom-vert',
            'master-bedroom'
        ];

        drawContainers();

        drawTabs();
        drawStage();
        drawDecoration();
        drawHome(numSquares);
        setDropRegions(numSquares);
        setDroppables(roomArray);
        createDebugTable();
        drawRoomBox(roomArray);
        createDraggables();

        $('div#droppable').css('height', homeHeight + 'vw');
    }

    /**
     * @description: Makes the rooms draggable (out of the roombox)
     */
    function createDraggables() {
        $('.draggable_room').draggable({
            cursor: 'grab',
            opacity: 0.80,
            start: function () {
                var self = this;
                $('#' + self.id + ' img').attr('src', options.imagePath + self.id + '.png');
                $('#instructions').fadeOut('fast');
            },
            stop: function () {
                var self = this;
                $(self).css({ 'left': '0', 'top': '0' });
                //if it's being put back in the original bank of rooms, change the src to an icon
                if ($(self).parents('div#droppable').length) {
                    //change it to an image of a floor plan room when it's being drug or dropped into the home
                    $('#' + self.id + ' img').attr('src', options.imagePath + self.id + '.png');
                } else {
                    //change it back to an icon when it's in the original room box
                    $('#' + self.id + ' img').attr('src', options.imagePath + self.id + '-icon.png');
                    //test to see if it's a master bedroom
                    //if it is, re-enable dragging for both types of master bedroom
                    if (self.id === 'master-bedroom-horiz' || self.id === 'master-bedroom-vert') {
                        removeRoomFromHome(self.id);
                    }
                }
            }
        });
    }

    /**
     * @description: Checks whether the room being dragged is a larger room that occupies two sections, detects its orientation and changes size accordingly. Disables dragging on master if the home already has one.
     * @param item_being_drug - the name of the room being moved
     */
    function checkDouble(item_being_drug) {
        var bedroomErrorMessage = 'You\'ve already placed a master bedroom in your home.';

        if (item_being_drug.attr('id') === 'master-bedroom-horiz') {
            //TODO: feed in sizes
            $('#master-bedroom-horiz img').css('width', '30vw');

            //disable dragging for master-bedroom-vert
            if ($('#master-bedroom-horiz').parents('#droppable').length === 1) {
                $('#master-bedroom-vert').fadeOut();
                $('#master-bedroom-vert').draggable('disable', function () {
                    sweetAlert(bedroomErrorMessage);
                });
            }
        }

        if (item_being_drug.attr('id') === 'master-bedroom-vert') {

            $('#master-bedroom-vert img').css('height', '30vw');

            //disable dragging for master-bedroom-horiz
            if ($('#master-bedroom-vert').parents('#droppable').length === 1) {
                $('#master-bedroom-horiz').fadeOut();
                $('#master-bedroom-horiz').draggable('disable', function () {
                    sweetAlert(bedroomErrorMessage);
                });
            }
        }
    }

    /**
     * @description: Gives the 4 or 8 sections of a home the ability to have rooms dropped on them. 
     * @param int numSquares - feed in 3 for a singlewide, or 7 for a doublewide
     */
    function setDropRegions(numSquares) {
        for (var i = 0; i <= numSquares; i++) {
            $('#dropregion_' + i).droppable({
                accept: '.drag_region_' + i,
                activeClass: 'active_dragging_class',
                drop: function (ev, ui) {
                    var self = this;
                    if ($('#' + self.id + ' div').size() < 1) {
                        $(ui.draggable).appendTo(self);
                        //TODO: feed in size
                        $('#' + self.id + ' .draggable_room img').css({ 'width': '15vw', 'height': '15vw' });
                        checkDouble(ui.draggable);
                    }

                    //show the delete room button on hover
                    $('.drop_regions div').on('touchstart mouseenter', function () {
                        $(this).append('<div id="delete_room"></div>');
                    });
                    $('.drop_regions div').on('touchend mouseleave', function () {
                        $('div#delete_room').remove();
                    });

                },
                tolerance: 'touch'
            });
        }
    }

    /**
     * @description: Gives original bank of rooms the ability to have rooms dropped on them (after they have been removed from the home). 
     * @param roomNames - an array with all the rooms available for dropping into the home
     */
    function setDroppables(roomNames) {

        for (var i = 0; i <= roomNames.length; i++) {

            $('#dz-' + roomNames[i]).droppable({
                accept: '#' + roomNames[i],
                activeClass: 'active_dragging_class',
                drop: function (ev, ui) {
                    var self = this;
                    $(self).droppable('option', 'accept', ui.draggable);
                    $(ui.draggable).appendTo(self);
                },
                out: function () {
                    var self = this;
                    $(self).droppable('option', 'accept', roomNames[i]);
                }
            });
        }
    }

    /**
     * @description: Counts the number of bedrooms
     */
    function getBedroomCount() {
        //count double bedrooms, multiply by 2
        var numDoubleBedrooms = $('div#droppable div#bedroom-double').length * 2;

        //count triple bedrooms, multiply by 3
        var numTripleBedrooms = $('div#droppable div#bedroom-triple').length * 3;

        //add master to the total of double and triple bedroom clusters
        var finalBedroomCount = 1 + numDoubleBedrooms + numTripleBedrooms;

        $('#num_beds').text(finalBedroomCount);

        return finalBedroomCount;
    }

    /**
     * @description: Figures out the coordinates needed to perform a floor plan search
     */
    function prepInfo() {

        var master_coord_x;
        var master_coord_y;
        var kitchen_coord_y;
        var kitchen_coord_x;
        var den_office_coord_y;
        var den_office_coord_x;
        var ew_orientation;
        var east_oriented;
        var enum_index;
     

        getBedroomCount();

        function getXCoordinate(counterI) {
            if (counterI === 0 || counterI === 4) { return 0; }
            if (counterI === 1 || counterI === 5) { return 1; }
            if (counterI === 2 || counterI === 6) { return 2; }
            if (counterI === 3 || counterI === 7) { return 3; }

            return -1;
        };

        for (var i = 0; i <= 7; i++) {
            //x, y coordinates of the horizontal master
            if (($('#master-bedroom-horiz').parent().attr('id') === 'dropregion_' + i) ||
                ($('#master-bedroom-vert').parent().attr('id') === 'dropregion_' + i)) {

                master_coord_x = getXCoordinate(i);
                master_coord_y = (i <= 3) ? 0 : 1;

                $('#master_coord_x').text(master_coord_x);
                $('#master_coord_y').text(master_coord_y);
            }

            if ($('#kitchen').parent().attr('id') === 'dropregion_' + i) {

                kitchen_coord_x = getXCoordinate(i);
                kitchen_coord_y = (i <= 3) ? 0 : 1;

                $('#kitchen_coord_x').text(kitchen_coord_x);
                $('#kitchen_coord_y').text(kitchen_coord_y);
            }

            //x, y coordinates of the office/den
            if ($('#den-office').parent().attr('id') === 'dropregion_' + i) {

                den_office_coord_x = getXCoordinate(i);
                den_office_coord_y = (i <= 3) ? 0 : 1;

                $('#den_office_coord_x').text(den_office_coord_x);
                $('#den_office_coord_y').text(den_office_coord_y);
            }
        }

        //determine whether the master suite is east-oriented or west-oriented
        if (($('#master-bedroom-vert').parent().attr('id') === 'dropregion_0') ||
            ($('#master-bedroom-vert').parent().attr('id') === 'dropregion_1') ||
            ($('#master-bedroom-horiz').parent().attr('id') === 'dropregion_0') ||
            ($('#master-bedroom-horiz').parent().attr('id') === 'dropregion_1') ||
            ($('#master-bedroom-horiz').parent().attr('id') === 'dropregion_4') ||
            ($('#master-bedroom-horiz').parent().attr('id') === 'dropregion_5')) {
            ew_orientation = 'west';
            east_oriented = 'false';
        } else {
            ew_orientation = 'east';
            east_oriented = 'true';
        }

        $('#ew_orientation').text(ew_orientation);

        if ($('div.drop_regions').length === 8) {

            //This is all for doublewides
            $('span#home_style').text('double_section');

            if ((master_coord_x === 0 && kitchen_coord_x === 3) || (master_coord_x === 3 && kitchen_coord_x === 0)) {
                //home type 1: multi-section, grouped bedrooms, living area on end - royal noodle
                enum_index = 1;
                $('#enum_index').text(enum_index);
            }

            else if ((master_coord_x === 0 && kitchen_coord_x === 1) || (master_coord_x === 3 && kitchen_coord_x === 2)) {
                //same as a two, but with the kitchen in the middle area
                if (kitchen_coord_y === 0) { enum_index = 2; } else { enum_index = 3; }
            } else {
                if ((kitchen_coord_y === 1) && (kitchen_coord_x === master_coord_x)) { enum_index = 4; }
                if ((kitchen_coord_y === 0) && (kitchen_coord_x === master_coord_x)) { enum_index = 5; }
                if ((kitchen_coord_y === 1) && (kitchen_coord_x !== master_coord_x)) { enum_index = 6; }
                if ((kitchen_coord_y === 0) && (kitchen_coord_x !== master_coord_x)) { enum_index = 7; }
            }
            

        } else if ($('div.drop_regions').length === 4) {
            $('span#home_style').text('single_section');

            //a single is a 9 if the kitchen or living room are on an end
            if (($('#kitchen').parent().attr('id') === 'dropregion_3') || ($('#living').parent().attr('id') === 'dropregion_3') || ($('#kitchen').parent().attr('id') === 'dropregion_0') || ($('#living').parent().attr('id') === 'dropregion_0')) {
                enum_index = 9;
                
            } else {
                enum_index = 8;
                
            }
        }

        $('#enum_index').text(enum_index);

        //alert(self.options.postalCode);


        var homeOptions = {
            LayoutType: enum_index,
            MasterBedroomIsEastOriented: east_oriented,
            Beds: getBedroomCount(),
            DenOfficeX: den_office_coord_x,
            DenOfficeY: den_office_coord_y,
            clientKey: '55244b8a-3e9a-4017-92b9-b712dfd4892c',
            postalCode: self.options.postalCode
        };

        search(homeOptions);
    }

    /**
     * @description: Calls the web service for searching
     */
    function search(searchParameters) {

        var currentEnv = findEnvironment();
        //currentEnv = "dev";

        function findEnvironment(env) {
            //Determine the URL that this site is on and return it to who ever needs it.
            var str = window.location.host;
            env = '';

            var nDEV = str.search('.pubdev.');
            var nQUA = str.search('.pubqua.');

            if (nDEV <= 0 && nQUA <= 0) {
                env = 'prod';
            } else if (nDEV > 0) {
                env = 'dev';
            } else if (nQUA > 0) {
                env = 'qua';
            }

            return env;
        }

        var envUrl = '';

        if (currentEnv === 'dev') {
            envUrl = 'https://dev.cmhinfo.biz/media/api/FloorPlanSearch';
        }
        else if (currentEnv === "qua") {
            envUrl = 'https://qua.cmhinfo.biz/media/api/FloorPlanSearch';
        }
        else if (currentEnv === "prod") {
            envUrl = 'https://www.cmhinfo.biz/media/api/FloorPlanSearch';
        }

        //show loading image
        $('#shrubs').hide();
        $('#home_listings').fadeIn().append('<div id="loading_graphic"><img src="' + options.imagePath + 'loading.gif"></div>');

        $.ajax({
            url: envUrl,
            method: 'GET',
            data: searchParameters,
            contentType: 'application/json',
            dataType: 'jsonp',
            crossDomain: true
        })
         .done(function (data) {
             // success
             $('#loading_graphic').hide();
             $('#shrubs').show();
             self.homes = data;
             showListings();
         })
         .fail(function () {
             // failure
             sweetAlert("An error has occured. Please try again.");
         });
    }

    /**
     * @description: Creates Sorting Drop Down and Pagination
     */
    function createSortingDropdown() {
        $('#home_listings_content').prepend('<div id="top_info"><div id="sorting">Sort By:' +
                                                    '<select id="sorting_options">' +
                                                        '<option value="0">Square Feet: High to Low</option>' +
                                                        '<option value="1">Square Feet: Low to High</option>' +
                                                        '<option value="2">Baths: High to Low</option>' +
                                                        '<option value="3">Baths: Low to High</option>' +
                                                    '</select>' +
                                                '</div>' +
                                                '<div id="pagination">' + 
                                                    '<a id="home_listings_content_homes-previous" href="#" class="disabled">&laquo; Previous</a>' +
                                                    '<a id="home_listings_content_homes-next" href="#">Next &raquo;</a>' +
                                                '</div></div>');

        var sortedHomes = [];

        /**
         * Generic array sorting
         *
         */
        var sortByProperty = function (property, order) {
            if (order === 'asc') {
                return function (x, y) {
                    return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
                };
            }
            if (order === 'dsc') {
                return function (x, y) {
                    return ((x[property] === y[property]) ? 0 : ((x[property] < y[property]) ? 1 : -1));
                };
            }
        };

       
        $('#sorting_options').change(function () {
            var selectedValue = parseInt(jQuery(this).val());
            $('div.home_listing').remove();
            switch (selectedValue) {
                case 0:
                    sortedHomes = self.homes.sort(sortByProperty('MaxSquareFeet', 'dsc'));
                    generateHomeList(sortedHomes);
                    break;
                case 1:
                    sortedHomes = self.homes.sort(sortByProperty('MaxSquareFeet', 'asc'));
                    generateHomeList(sortedHomes);
                    break;
                case 2:
                    sortedHomes = self.homes.sort(sortByProperty('Baths', 'dsc'));
                    generateHomeList(sortedHomes);
                    break;
                case 3:
                    sortedHomes = self.homes.sort(sortByProperty('Baths','asc'));
                    generateHomeList(sortedHomes);
                    break;
                default:
                    break;
            }
        });

    }

    /**
     * @description: Shows search results
     */
    function showListings() {

        var homeInfo = self.homes;

        $('#home_listings').fadeIn().append('<div id="home_listings_filters">' +
            '<a href="#" id="return_to_search">Back to Floor Plan Builder</a>' +
            '<h1>Select Feature Preferences</h1>' +

            '<div class="filter_list"><h2>Layout</h2>' +
            '<ul><li><input type="checkbox" id="HasOpenFloorPlan"> Open Floor Plan</li>' +
            '<li><input type="checkbox" id="HasKitchenIsland"> Kitchen Island</li>' +
            '<li><input type="checkbox" id="HasBreakfastBar"> Breakfast Bar</li>' +
            '<li><input type="checkbox" id="HasEntertainmentUnit"> Entertainment Unit</li>' +
            '<li><input type="checkbox" id="HasFireplace"> Fireplace</li></ul></div>' +

            '<div class="filter_list"><h2>Room</h2>' +
            '<ul><li><input type="checkbox" id="HasOffice"> Office</li>' +
            '<li><input type="checkbox" id="HasFamilyRoom"> Family Room</li>' +
            '<li><input type="checkbox" id="HasBonusRoom"> Bonus Room</li>' +
            '<li><input type="checkbox" id="HasUtilityRoom"> Utility Room</li>' +
            '<li><input type="checkbox" id="HasDiningRoom"> Dining Room</li></ul></div>' +

            '<div class="filter_list"><h2>Other</h2>' +
            '<ul><li><input type="checkbox" id="HasComputerStation"> Computer Station</li>' +
            '<li><input type="checkbox" id="HasPantry"> Pantry</li>' +
            '<li><input type="checkbox" id="HasFoyer"> Foyer</li>' +
            '<li><input type="checkbox" id="HasDrywall"> Drywall</li>' +
            '<li><input type="checkbox" id="HasTrayCeilings"> Tray Ceilings</li></ul></div>' +

            '<br class="clear"></div><div id="home_listings_content"><div id="home_listings_content_homes"></div></div>');

        createSortingDropdown();

        $('div.filter_list ul li input').on('click', filterResults);

        $('#return_to_search').on('click', function () {
            location.reload();
        });

        generateHomeList(homeInfo);
    }

    function filterResults() {

        $('p#nothing_found').remove();

        var has_office = $('input#HasOffice').is(':checked');
        var has_family_room = $('input#HasFamilyRoom').is(':checked');
        var has_bonus_room = $('input#HasBonusRoom').is(':checked');
        var has_utility_room = $('input#HasUtilityRoom').is(':checked');
        var has_dining_room = $('input#HasDiningRoom').is(':checked');
        var has_open_floor_plan = $('input#HasOpenFloorPlan').is(':checked');
        var has_kitchen_island = $('input#HasKitchenIsland').is(':checked');
        var has_breakfast_bar = $('input#HasBreakfastBar').is(':checked');
        var has_entertainment_unit = $('input#HasEntertainmentUnit').is(':checked');
        var has_computer_station = $('input#HasComputerStation').is(':checked');
        var has_pantry = $('input#HasPantry').is(':checked');
        var has_foyer = $('input#HasFoyer').is(':checked');
        var has_drywall = $('input#HasDrywall').is(':checked');
        var has_tray_ceilings = $('input#HasTrayCeilings').is(':checked');

        $('div.home_listing').remove();

        var filteredHomes = [];

        if (has_office || has_family_room || has_bonus_room || has_utility_room || has_dining_room || has_open_floor_plan || has_kitchen_island || has_breakfast_bar || has_entertainment_unit || has_computer_station || has_pantry || has_foyer || has_drywall || has_tray_ceilings) {
            for (var i = 0; i < self.homes.length; i++) {
                var home = self.homes[i];
                if ((has_office && home.HasOffice || !has_office) &&
                    (has_family_room && home.HasFamilyRoom || !has_family_room) &&
                    (has_bonus_room && home.HasBonusRoom || !has_bonus_room) &&
                    (has_utility_room && home.HasUtilityRoom || !has_utility_room) &&
                    (has_dining_room && home.HasDiningRoom || !has_dining_room) &&
                    (has_open_floor_plan && home.HasOpenFloorPlan || !has_open_floor_plan) &&
                    (has_kitchen_island && home.HasKitchenIsland || !has_kitchen_island) &&
                    (has_breakfast_bar && home.HasBreakfastBar || !has_breakfast_bar) &&
                    (has_entertainment_unit && home.HasEntertainmentUnit || !has_entertainment_unit) &&
                    (has_computer_station && home.HasComputerStation || !has_computer_station) &&
                    (has_pantry && home.HasPantry || !has_pantry) &&
                    (has_foyer && home.HasFoyer || !has_foyer) &&
                    (has_drywall && home.HasDrywall || !has_drywall) &&
                    (has_tray_ceilings && home.HasTrayCeilings || !has_tray_ceilings)) {

                    filteredHomes.push(home);
                }
            }

        } else {
            filteredHomes = self.homes;
        }

        generateHomeList(filteredHomes);
    }

    function generateHomeList(homeInfo) {

        for (var i = 0; i < homeInfo.length; i++) {
            $('#home_listings_content_homes').append('<div class="home_listing">' +
                    '<a href="http://claytonhomes.com/home-details.cfm?modelNo=' + homeInfo[i].ModelNumber + '" target="_blank"><div class="home_specs">' +
                        '<h3>' + homeInfo[i].ModelDescription + '</h3>' + homeInfo[i].Beds + ' Beds &bull; '
                        + homeInfo[i].Baths + ' Baths<br>' + homeInfo[i].MaxSquareFeet + ' sq. ft.</p>' + homeInfo[i].ModelNumber + '<br>' +
                        'More Info' +
                    '</div></a>' +
                    '<div class="home_images home_images_' + i + '"></div><br class="clear"></div>');

            if (homeInfo[i].InteriorImageReference) {
                $('.home_images_' + i).append('<img class="image_int" src="http://www.clayton-media.com/imagesInv/' + homeInfo[i].InteriorImageReference + '?width=400" alt="' +
                    homeInfo[i].InteriorImageCaption + '">');
            } else {
                $('.home_images_' + i).append('<img class="image_int" src="' + options.imagePath + 'no-pic.gif" alt="No Picture Available">');
            }

            if (homeInfo[i].FloorPlanImageReference) {
                $('.home_images_' + i).append('<img class="image_fp" src="http://www.clayton-media.com/imagesInv/' + homeInfo[i].FloorPlanImageReference + '?width=400" alt="' +
                    homeInfo[i].FloorPlanImageCaption + '">');
            } else {
                $('.home_images_' + i).append('<img class="image_fp" src="' + options.imagePath + 'no-pic.gif" alt="No Picture Available">');
            }
        }

        if (homeInfo.length === 0) {
            $('#home_listings_content_homes').append('<p id="nothing_found">No search results were found.</p>');
        }

        if (homeInfo.length < 5) {
            $('#pagination').hide();
        } else {
            $('#home_listings_content_homes').paginate({ itemsPerPage: 5 });
        }

        
    }

    /**
   * @description: Draws the tabs to switch between singlewide and doublewide
   * @param roomNames - an array with all the rooms available for dropping into the home
   */
    function drawRoomBox(roomNames) {
        for (var i = 0, len = roomNames.length; i < len; i++) {
            var div = '<div id="dz-' + roomNames[i] + '" class="drop_zone"></div>';
            $('#roombox').append(div);
            createDropZones(roomNames[i]);
            assignDropRegions(roomNames[i]);
        }

        $('#roombox').append('<div id="buttons">' + '<a href="#" id="find_homes" class="find_button">Search Similar Floor Plans</a>' + '</div>');

        $('a#find_homes').on('click', function () {
            //require kitchen, master bedroom
            if (($('div.drop_regions #master-bedroom-horiz').length > 0 ||
                 $('div.drop_regions #master-bedroom-vert').length > 0 ||
                 $('div.drop_regions #master-bedroom').length > 0) && ($('div.drop_regions #kitchen').length > 0)) {
                $(self.containerId).fadeOut();
                $('#select_features').fadeOut();
                prepInfo();
            } else {
                sweetAlert('Your home plan must have a kitchen and master bedroom!');
            }
            return false;
        });
    }

    /**
     * @description: Removes a home from the floor plan and puts it in the original bank of homes
     */
    function createDropZones(room) {
        $('#dz-' + room).append('<div id="' + room + '" class="draggable_room"><img src="' + options.imagePath + room + '-icon.png"></div>').droppable({
            accept: '#' + room,
            activeClass: 'active_dragging_class',
            drop: function (ev, ui) {
                var self = this;
                $(self).droppable('option', 'accept', ui.draggable);
                $(ui.draggable).appendTo(self);
            }
        });
    }

    /**
     * @description: Removes a home from the floor plan and puts it in the original bank of homes
     */
    function removeRoomFromHome(roomToDelete) {
        //fade home image out for effect, then remove it from the home completely
        $('#' + roomToDelete).fadeOut('slow', function () {
            $(this).remove();
        });

        //if the deleted room is the master-bedroom-vert, re-enable dragging on master-bedroom-horiz
        if (roomToDelete === 'master-bedroom-vert') {
            $('#master-bedroom-horiz').fadeIn().draggable('enable');
        }

        //if the deleted room is the master-bedroom-horiz, re-enable dragging on master-bedroom-vert
        if (roomToDelete === 'master-bedroom-horiz') {
            $('#master-bedroom-vert').fadeIn().draggable('enable');
        }

        //make original room draggable/droppable again
        createDropZones(roomToDelete);
        assignDropRegions(roomToDelete);
        setDroppables(roomToDelete);
        createDraggables();
    }

    /**
     * @description: Shows coordinates in a table, for debugging purposes
     */
    function createDebugTable() {
        if (!$('#debug_table').length && self.options.debugMode === true) {
            $('body').append('<table id="debug_table"></table>');
            $('#debug_table').append('<tr><td>Home Style</td><td><span id="home_style"></span></td></tr>');
            $('#debug_table').append('<tr><td>Enum Index</td><td><span id="enum_index"></span></td></tr>');
            $('#debug_table').append('<tr><td>Master bedroom X</td><td><span id="master_coord_x"></span></td></tr>');
            $('#debug_table').append('<tr><td>Master bedroom Y</td><td><span id="master_coord_y"></span></td></tr>');
            $('#debug_table').append('<tr><td>Kitchen X</td><td><span id="kitchen_coord_x"></span></td></tr>');
            $('#debug_table').append('<tr><td>Kitchen Y</td><td><span id="kitchen_coord_y"></span></td></tr>');
            $('#debug_table').append('<tr><td>Number of Bedrooms</td><td><span id="num_beds"></span></td></tr>');
            $('#debug_table').append('<tr><td>Master E or W?</td><td><span id="ew_orientation"></span></td></tr>');
        }
    }

    return {
        create: create
    };

})();