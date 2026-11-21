(() => {
    const nearbyIcons = {
        restaurant: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v7"/><path d="M10 3v7"/><path d="M7 7h3"/><path d="M8.5 10v11"/><path d="M17 3v18"/><path d="M17 3c-2 2-2 6 0 8"/></svg>',
        cafe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h13v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M18 10h1a2.5 2.5 0 0 1 0 5h-2"/><path d="M8 3v2"/><path d="M12 3v2"/><path d="M16 3v2"/><path d="M3 21h17"/></svg>',
        fuel: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h14"/><path d="M6 21V4h9v17"/><path d="M6 8h9"/><path d="M15 8h3l2 3v6a2 2 0 0 1-4 0v-3h-1"/></svg>',
        supermarket: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.5 12.5A2 2 0 0 0 8.5 17H18a2 2 0 0 0 2-1.6L22 8H5"/></svg>',
        pharmacy: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/></svg>'
    };

    const messages = {
        vi: {
            appTitle: 'Bản đồ GPS',
            searchPlaceholder: 'Nhập địa điểm...',
            clearSearch: 'Xóa nội dung tìm kiếm',
            suggestionsLabel: 'Địa điểm gợi ý',
            startTrip: 'Bắt đầu',
            startTripButton: 'Bắt đầu lộ trình',
            endTrip: 'Kết thúc',
            endTripButton: 'Kết thúc hành trình',
            gps: 'GPS',
            gpsOn: 'GPS BẬT',
            gpsTurnOn: 'Bật GPS',
            gpsTurnOff: 'Tắt GPS',
            gpsButton: 'Bật / tắt GPS',
            themeButton: 'Chuyển giao diện Sáng / Tối',
            languageButton: 'Chuyển sang Tiếng Anh',
            viewButton: 'Chuyển góc nhìn 2D / 3D',
            northButton: 'Hướng Bắc',
            modeGroup: 'Chế độ di chuyển',
            modeMotorbike: 'Xe máy',
            modeCar: 'Ô tô',
            recenterButton: 'Quay lại vị trí',
            gpsDot: 'Trạng thái GPS',
            ready: 'Sẵn sàng',
            accuracyEmpty: 'Sai số: --',
            accuracy: 'Sai số: ±{meters}m',
            routeSummary: '{km} km • ~{mins} phút',
            then: 'Sau đó: {instruction}',
            navEtaLabel: 'Dự kiến đến',
            navDurationLabel: 'Thời gian',
            navDistanceLabel: 'Còn lại',
            navEndButton: 'Kết thúc',
            navSpeedLabel: 'Tốc độ hiện tại',
            durationMinutes: '{mins} phút',
            durationHours: '{hours} giờ {mins} phút',
            searchRequired: 'Nhập tên địa điểm trước khi tìm kiếm',
            searchingPlace: 'Đang tìm "{query}"...',
            placeNotFound: 'Không tìm thấy địa điểm phù hợp',
            destination: 'Đích: {name}',
            searchError: 'Lỗi tìm kiếm địa điểm',
            routeSearchRequired: 'Hãy tìm kiếm địa điểm trước rồi bấm Bắt đầu',
            vehicleRequired: 'Chọn Xe máy hoặc Ô tô để bắt đầu',
            routeLoading: 'Đang tìm lộ trình {mode} tới {name}...',
            routeRecalculating: 'Đang tính lại lộ trình {mode} tới {name}...',
            routeNotFound: 'Không tìm thấy tuyến đường phù hợp',
            routeComplete: 'Lộ trình {mode} -> {name}',
            routeError: 'Lỗi khi tải lộ trình OSRM',
            gpsUnsupported: 'Trình duyệt không hỗ trợ GPS.',
            gpsStarting: 'Đang dò vị trí GPS...',
            gpsStale: 'Tín hiệu trễ nhịp',
            gpsWeak: 'GPS yếu',
            gpsActive: 'GPS đang hoạt động',
            gpsError: 'Lỗi GPS: {message}',
            gpsStartError: 'Không thể bật GPS: {message}',
            gpsStopped: 'Đã tắt GPS',
            themeLight: 'Giao diện Sáng',
            themeDark: 'Giao diện Tối',
            suggestionsLoading: 'Đang tìm địa điểm...',
            suggestionsNone: 'Không tìm thấy địa điểm phù hợp',
            suggestionsError: 'Không tải được gợi ý. Vui lòng thử lại.',
            translationPendingName: 'Đang dịch tên địa điểm…',
            translationPendingAddress: 'Đang dịch địa chỉ…',
            translationUnavailableName: 'Tên địa điểm chưa có bản dịch',
            translationUnavailableAddress: 'Địa chỉ chưa có bản dịch',
            findNearby: 'Tìm quanh đây',
            nearbyRestaurants: 'Quán ăn',
            nearbyCafes: 'Cà phê',
            nearbyFuel: 'Trạm xăng',
            nearbyMarkets: 'Siêu thị',
            nearbyPharmacies: 'Nhà thuốc',
            nearbySearching: 'Đang tìm {category} gần bạn...',
            country: 'Việt Nam',
            north: 'Bắc',
            distanceUnit: 'm',
            distanceUnitKm: 'km',
            minuteUnit: 'phút',
            // Turn-by-turn maneuvers & warnings
            maneuverTurnLeft: 'Rẽ trái',
            maneuverTurnRight: 'Rẽ phải',
            maneuverSlightLeft: 'Đi chếch trái',
            maneuverSlightRight: 'Đi chếch phải',
            maneuverSharpLeft: 'Rẽ ngoặt trái',
            maneuverSharpRight: 'Rẽ ngoặt phải',
            maneuverStraight: 'Đi thẳng',
            maneuverContinue: 'Đi tiếp',
            maneuverUturn: 'Quay đầu xe',
            maneuverRoundabout: 'Vào vòng xoay',
            maneuverDepart: 'Bắt đầu di chuyển',
            maneuverArrive: 'Đến điểm đích',
            prepOnto: 'vào {street}',
            prepOn: 'trên {street}',
            prepAt: 'tại {street}',
            warningEarlyBadge: 'Sắp rẽ',
            warningImminentBadge: 'Rẽ ngay',
            arrivedBadge: 'Đã đến nơi',
            arrivedMessage: 'Bạn đã đến nơi!',
            statusTurnEarly: 'Sắp rẽ: {action} sau {distance}',
            statusTurnImminent: 'Cận kề: {action} sau {distance}!',
            navigatingRoute: 'Lộ trình {mode} -> {name}',
            // Thẻ chi tiết địa điểm & gần đây
            directions: 'Bắt đầu di chuyển',
            directionsWithEta: 'Bắt đầu • {eta} • {distance}',
            directionsEtaOnly: 'Bắt đầu • {eta}',
            savePlace: 'Lưu',
            savedPlace: 'Đã lưu',
            sharePlace: 'Chia sẻ',
            addressLabel: 'Địa chỉ',
            coordsLabel: 'Tọa độ',
            distanceLabel: 'Khoảng cách',
            recentPlaces: 'Gần đây',
            clearRecent: 'Xóa',
            noRecentPlaces: 'Chưa có địa điểm gần đây',
            copiedCoords: 'Đã sao chép tọa độ vào bộ nhớ tạm',
            placeSaved: 'Đã lưu địa điểm',
            placeUnsaved: 'Đã bỏ lưu địa điểm',
            roadDistance: '{dist} (đường bộ)',
            straightDistance: '{dist} (đường chim bay)',
            closeDetail: 'Đóng chi tiết'
        },
        en: {
            appTitle: 'GPS Map',
            searchPlaceholder: 'Search for a place...',
            clearSearch: 'Clear search',
            suggestionsLabel: 'Suggested places',
            startTrip: 'Start',
            startTripButton: 'Start the route',
            endTrip: 'End',
            endTripButton: 'End the trip',
            gps: 'GPS',
            gpsOn: 'GPS ON',
            gpsTurnOn: 'Turn GPS on',
            gpsTurnOff: 'Turn GPS off',
            gpsButton: 'Toggle GPS',
            themeButton: 'Toggle light / dark appearance',
            languageButton: 'Switch to Vietnamese',
            viewButton: 'Switch between 2D and 3D view',
            northButton: 'North',
            modeGroup: 'Movement mode',
            modeMotorbike: 'Motorbike',
            modeCar: 'Car',
            recenterButton: 'Recenter',
            gpsDot: 'GPS status',
            ready: 'Ready',
            accuracyEmpty: 'Accuracy: --',
            accuracy: 'Accuracy: ±{meters} m',
            routeSummary: '{km} km • ~{mins} min',
            then: 'Then: {instruction}',
            navEtaLabel: 'Arrival',
            navDurationLabel: 'Time',
            navDistanceLabel: 'Remaining',
            navEndButton: 'End',
            navSpeedLabel: 'Current speed',
            durationMinutes: '{mins} min',
            durationHours: '{hours} hr {mins} min',
            searchRequired: 'Enter a place name before searching',
            searchingPlace: 'Searching for "{query}"...',
            placeNotFound: 'No matching place found',
            destination: 'Destination: {name}',
            searchError: 'Place search failed',
            routeSearchRequired: 'Search for a place before tapping Start',
            vehicleRequired: 'Choose a motorbike or car before starting',
            routeLoading: 'Finding a {mode} route to {name}...',
            routeRecalculating: 'Recalculating the {mode} route to {name}...',
            routeNotFound: 'No suitable route found',
            routeComplete: 'Route ({mode}) to {name}',
            routeError: 'Unable to load the OSRM route',
            gpsUnsupported: 'This browser does not support GPS.',
            gpsStarting: 'Finding GPS location...',
            gpsStale: 'GPS signal is delayed',
            gpsWeak: 'Weak GPS signal',
            gpsActive: 'GPS is active',
            gpsError: 'GPS error: {message}',
            gpsStartError: 'Unable to start GPS: {message}',
            gpsStopped: 'GPS is off',
            themeLight: 'Light appearance',
            themeDark: 'Dark appearance',
            suggestionsLoading: 'Searching for places...',
            suggestionsNone: 'No matching places found',
            suggestionsError: 'Could not load suggestions. Please try again.',
            translationPendingName: 'Translating place name…',
            translationPendingAddress: 'Translating address…',
            translationUnavailableName: 'Place name translation unavailable',
            translationUnavailableAddress: 'Address translation unavailable',
            findNearby: 'Find Nearby',
            nearbyRestaurants: 'Restaurants',
            nearbyCafes: 'Cafes',
            nearbyFuel: 'Gas stations',
            nearbyMarkets: 'Supermarkets',
            nearbyPharmacies: 'Pharmacies',
            nearbySearching: 'Finding {category} nearby...',
            country: 'Vietnam',
            north: 'North',
            distanceUnit: 'm',
            distanceUnitKm: 'km',
            minuteUnit: 'min',
            // Turn-by-turn maneuvers & warnings
            maneuverTurnLeft: 'Turn left',
            maneuverTurnRight: 'Turn right',
            maneuverSlightLeft: 'Keep slight left',
            maneuverSlightRight: 'Keep slight right',
            maneuverSharpLeft: 'Sharp left',
            maneuverSharpRight: 'Sharp right',
            maneuverStraight: 'Go straight',
            maneuverContinue: 'Continue',
            maneuverUturn: 'Make a U-turn',
            maneuverRoundabout: 'Enter roundabout',
            maneuverDepart: 'Head out',
            maneuverArrive: 'Arrive at destination',
            prepOnto: 'onto {street}',
            prepOn: 'on {street}',
            prepAt: 'at {street}',
            warningEarlyBadge: 'Upcoming',
            warningImminentBadge: 'Turn now',
            arrivedBadge: 'Arrived',
            arrivedMessage: 'You have arrived!',
            statusTurnEarly: 'Upcoming: {action} in {distance}',
            statusTurnImminent: 'Imminent: {action} in {distance}!',
            navigatingRoute: 'Route ({mode}) to {name}',
            // Place detail card & recents
            directions: 'Start',
            directionsWithEta: 'Start • {eta} • {distance}',
            directionsEtaOnly: 'Start • {eta}',
            savePlace: 'Save',
            savedPlace: 'Saved',
            sharePlace: 'Share',
            addressLabel: 'Address',
            coordsLabel: 'Coordinates',
            distanceLabel: 'Distance',
            recentPlaces: 'Recent',
            clearRecent: 'Clear',
            noRecentPlaces: 'No recent places',
            copiedCoords: 'Coordinates copied to clipboard',
            placeSaved: 'Place saved',
            placeUnsaved: 'Place removed from saved',
            roadDistance: '{dist} (by road)',
            straightDistance: '{dist} (straight line)',
            closeDetail: 'Close details'
        }
    };

    const elements = {
        languageButton: document.getElementById('btn-language'),
        themeButton: document.getElementById('btn-theme'),
        viewButton: document.getElementById('btn-3d'),
        recenterControlButton: document.getElementById('btn-recenter-control'),
        northButton: document.getElementById('btn-north'),
        compassIcon: document.getElementById('compass-icon'),
        compassDirection: document.getElementById('compass-direction'),
        vehicleModeBar: document.getElementById('vehicle-mode-bar'),
        vehicleModeButtons: Array.from(document.querySelectorAll('.mode-chip')),
        recenterButton: document.getElementById('btn-recenter'),
        runButton: document.getElementById('btn-run'),
        gpsButton: document.getElementById('gps-toggle-switch'),
        searchInput: document.getElementById('search-input'),
        searchPill: document.getElementById('search-pill'),
        clearSearchButton: document.getElementById('btn-clear-search'),
        searchWrapper: document.getElementById('search-wrapper'),
        searchPopover: document.getElementById('search-popover'),
        bottomSheet: document.getElementById('bottom-sheet') || document.querySelector('.bottom-sheet'),
        sheetScrollBody: document.getElementById('sheet-scroll-body'),
        suggestionsBox: document.getElementById('suggestions-box'),
        nearbySection: document.getElementById('nearby-section'),
        nearbyTitle: document.getElementById('nearby-title'),
        nearbyButtons: Array.from(document.querySelectorAll('.nearby-chip')),
        statusText: document.getElementById('status-text'),
        routeInfo: document.getElementById('route-info'),
        speedHud: document.querySelector('.top-left-hud'),
        speedDisplay: document.getElementById('speed-display'),
        gpsDot: document.getElementById('gps-dot'),
        leftMapTools: document.getElementById('left-map-tools'),
        turnBanner: document.getElementById('nav-top-banner'),
        turnIconBox: document.getElementById('turn-icon-box'),
        turnDistance: document.getElementById('turn-distance'),
        turnBadge: document.getElementById('turn-badge'),
        turnInstruction: document.getElementById('turn-instruction'),
        turnStreet: document.getElementById('turn-street'),
        navNextSub: document.getElementById('nav-next-sub'),
        navSpeedPill: document.getElementById('nav-speed-pill'),
        navSpeedValue: document.getElementById('nav-speed-value'),
        navBottomHud: document.getElementById('nav-bottom-hud'),
        navEtaValue: document.getElementById('nav-eta-value'),
        navEtaLabel: document.getElementById('nav-eta-label'),
        navDurationValue: document.getElementById('nav-duration-value'),
        navDurationLabel: document.getElementById('nav-duration-label'),
        navDistanceValue: document.getElementById('nav-distance-value'),
        navDistanceLabel: document.getElementById('nav-distance-label'),
        endTripButton: document.getElementById('btn-end-trip'),
        recenterLabel: document.getElementById('label-recenter'),
        // Place Detail Sheet & Recent elements
        placeDetailCard: document.getElementById('place-detail-card'),
        placeTitle: document.getElementById('place-title'),
        placeSavedBadge: document.getElementById('place-saved-badge'),
        placeSubtitle: document.getElementById('place-subtitle'),
        btnClosePlace: document.getElementById('btn-close-place'),
        btnPlaceRoute: document.getElementById('btn-place-route'),
        placeRouteText: document.getElementById('place-route-text'),
        btnPlaceSave: document.getElementById('btn-place-save'),
        placeSaveIcon: document.getElementById('place-save-icon'),
        labelSave: document.getElementById('label-save'),
        btnPlaceShare: document.getElementById('btn-place-share'),
        labelShare: document.getElementById('label-share'),
        labelAddress: document.getElementById('label-address'),
        detailAddress: document.getElementById('detail-address'),
        labelCoords: document.getElementById('label-coords'),
        detailCoords: document.getElementById('detail-coords'),
        labelDistance: document.getElementById('label-distance'),
        detailDistance: document.getElementById('detail-distance'),
        recentPlacesSection: document.getElementById('recent-places-section'),
        recentTitle: document.getElementById('recent-title'),
        btnClearRecent: document.getElementById('btn-clear-recent'),
        recentList: document.getElementById('recent-list'),
        sheetGrabber: document.getElementById('sheet-grabber')
    };

    const searchContentAnchor = elements.recentPlacesSection?.nextSibling || null;

    const savedLanguage = localStorage.getItem('app_lang');
    let language = savedLanguage === 'en' ? 'en' : 'vi';
    let lightMode = true;
    let gpsRunning = false;
    let currentStatus = { key: 'ready', params: {} };
    let currentRouteInfo = { key: 'accuracyEmpty', params: {} };
    let onSearchClose = null;
    let routeActive = false;
    let routePending = false;
    let navigationActive = false;
    let cameraFollowing = false;
    let currentNavigationMetrics = null;
    const labelTextSizes = new Map();
    const labelTextFields = new Map();
    let puckBodyElement = null;
    let puckMode = 'pointer';
    let currentCompassAngle = 0;
    let currentTurnData = null;
    let currentPlaceData = null;
    let currentRecentPlaces = [];
    let recentSelectCallback = null;
    let recentClearCallback = null;
    let currentSheetHeight = elements.bottomSheet.getBoundingClientRect().height || 94;
    let sheetOpen = elements.bottomSheet.dataset.open === 'true';
    let ignoreOutsideClick = false;
    elements.bottomSheet.style.setProperty('--sheet-height', `${currentSheetHeight}px`);

    const puckIcons = {
        pointer: '<svg class="puck-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 40 43 24 33 8 43 24 3Z" fill="currentColor" stroke="var(--puck-outline)" stroke-width="2" stroke-linejoin="round"/><path d="M24 9v20" fill="none" stroke="var(--puck-outline)" stroke-width="1.5" stroke-linecap="round" opacity=".55"/></svg>',
        motorbike: '<svg class="puck-icon" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="8" r="3.5"/><circle cx="24" cy="40" r="3.5"/><path d="M24 12v7m0 0-7 8 7 4 7-7m-14-2-4-3m18 13 5 4m-18-4-5 4"/><path d="M18 27h12"/></g><path d="M20 20h8l4 5-4 6h-8l-4-6z" fill="currentColor" stroke="var(--puck-outline)" stroke-width="1.5" stroke-linejoin="round"/></svg>',
        car: '<svg class="puck-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="m16 5-5 8-3 10v14a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3V23l-3-10-5-8H16Z" fill="currentColor" stroke="var(--puck-outline)" stroke-width="2" stroke-linejoin="round"/><path d="m15 13 3-5h12l3 5 2 7H13l2-7Zm-4 13h5m16 0h5M12 34h5m14 0h5" fill="none" stroke="var(--puck-outline)" stroke-width="1.5" stroke-linecap="round"/><path d="M15 22h18v7H15z" fill="var(--puck-outline)" fill-opacity=".28" stroke="currentColor" stroke-width="1.5"/></svg>'
    };
    const compassDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    const turnIcons = {
        turnLeft: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-9a4 4 0 0 0-4-4H5"/><polyline points="9 4 5 8 9 12"/></svg>',
        turnRight: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21v-9a4 4 0 0 1 4-4h10"/><polyline points="15 4 19 8 15 12"/></svg>',
        slightLeft: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a5 5 0 0 0-1.5-3.5L8 4"/><polyline points="14 4 8 4 8 10"/></svg>',
        slightRight: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21v-8a5 5 0 0 1 1.5-3.5L16 4"/><polyline points="10 4 16 4 16 10"/></svg>',
        sharpLeft: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-8a3 3 0 0 0-1.8-2.7L7 7"/><polyline points="12 5 6 7 8 13"/></svg>',
        sharpRight: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 21v-8a3 3 0 0 1 1.8-2.7L17 7"/><polyline points="12 5 18 7 16 13"/></svg>',
        straight: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="21" x2="12" y2="4"/><polyline points="6 10 12 4 18 10"/></svg>',
        uturn: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 21V9a6 6 0 0 0-12 0v12"/><polyline points="10 17 6 21 2 17"/></svg>',
        roundabout: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.2-8.5"/><polyline points="21 7 21 12 16 12"/><circle cx="12" cy="12" r="3.5"/></svg>',
        depart: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
        arrive: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s-7-4.5-7-11a7 7 0 0 1 14 0c0 6.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
    };

    const saveIconOutline = '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>';
    const saveIconFilled = '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor"></path>';

    function translate(key, params = {}) {
        const template = messages[language][key] || messages.vi[key] || key;
        return template.replace(/\{(\w+)\}/g, (match, name) => {
            if (name === 'mode' && params.modeKey) return translate(params.modeKey);
            return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : match;
        });
    }

    function text(key, params = {}) {
        return translate(key, params);
    }

    function setStatus(key, params = {}) {
        currentStatus = { key, params };
        elements.statusText.textContent = translate(key, params);
    }

    function setRouteInfo(key, params = {}) {
        currentRouteInfo = { key, params };
        elements.routeInfo.textContent = translate(key, params);
    }

    function formatCoordinates(coord) {
        if (!Array.isArray(coord) || coord.length < 2 || !coord.every(Number.isFinite)) return '--';
        const [lng, lat] = coord;
        const latDir = lat >= 0 ? 'N' : 'S';
        const lngDir = lng >= 0 ? 'E' : 'W';
        return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
    }

    function renderTurnBanner() {
        if (!elements.turnBanner || !currentTurnData) return;
        const {
            iconKey = 'straight',
            actionKey = 'maneuverStraight',
            street = '',
            prepType = 'on',
            distanceMeters = 0,
            warningLevel = 'normal',
            isArrived = false,
            destinationName = '',
            nextActionKey = '',
            nextStreet = '',
            nextPrepType = 'on'
        } = currentTurnData;

        if (elements.turnIconBox) {
            elements.turnIconBox.innerHTML = turnIcons[iconKey] || turnIcons.straight;
        }

        if (elements.turnDistance) {
            elements.turnDistance.textContent = isArrived ? '0 m' : formatDistance(distanceMeters);
        }

        elements.turnBanner.classList.remove('warning-early', 'warning-imminent', 'arrived');
        if (elements.turnBadge) {
            if (isArrived) {
                elements.turnBanner.classList.add('arrived');
                elements.turnBadge.textContent = translate('arrivedBadge');
                elements.turnBadge.hidden = false;
            } else if (warningLevel === 'imminent') {
                elements.turnBanner.classList.add('warning-imminent');
                elements.turnBadge.textContent = translate('warningImminentBadge');
                elements.turnBadge.hidden = false;
            } else if (warningLevel === 'early') {
                elements.turnBanner.classList.add('warning-early');
                elements.turnBadge.textContent = translate('warningEarlyBadge');
                elements.turnBadge.hidden = false;
            } else {
                elements.turnBadge.hidden = true;
            }
        }

        if (elements.turnInstruction) {
            elements.turnInstruction.textContent = isArrived
                ? (destinationName || translate('maneuverArrive'))
                : translate(actionKey);
        }

        if (elements.turnStreet) {
            if (isArrived) {
                elements.turnStreet.textContent = translate('arrivedMessage');
            } else if (street) {
                const prepKey = prepType === 'onto' ? 'prepOnto' : (prepType === 'at' ? 'prepAt' : 'prepOn');
                elements.turnStreet.textContent = translate(prepKey, { street });
            } else {
                elements.turnStreet.textContent = '';
            }
        }

        if (elements.navNextSub) {
            const nextInstruction = nextActionKey
                ? [
                    translate(nextActionKey),
                    nextStreet
                        ? translate(nextPrepType === 'onto' ? 'prepOnto' : (nextPrepType === 'at' ? 'prepAt' : 'prepOn'), { street: nextStreet })
                        : ''
                ].filter(Boolean).join(' ')
                : '';
            elements.navNextSub.textContent = nextInstruction
                ? translate('then', { instruction: nextInstruction })
                : '';
            elements.navNextSub.hidden = !nextInstruction;
        }

        elements.turnBanner.hidden = false;
    }

    function setTurnBanner(data) {
        currentTurnData = data;
        renderTurnBanner();
    }

    function hideTurnBanner() {
        currentTurnData = null;
        if (elements.turnBanner) elements.turnBanner.hidden = true;
    }

    function renderPlaceRouteAction() {
        if (!elements.placeRouteText) return;
        if (routeActive) {
            elements.placeRouteText.textContent = translate('endTrip');
            if (elements.btnPlaceRoute) elements.btnPlaceRoute.title = translate('endTripButton');
            return;
        }

        if (currentPlaceData && currentPlaceData.durationSec) {
            const mins = Math.max(1, Math.round(currentPlaceData.durationSec / 60));
            const eta = `${mins} ${translate('minuteUnit')}`;
            elements.placeRouteText.textContent = currentPlaceData.roadDistanceMeters
                ? translate('directionsWithEta', {
                    eta,
                    distance: formatDistance(currentPlaceData.roadDistanceMeters)
                })
                : translate('directionsEtaOnly', { eta });
        } else {
            elements.placeRouteText.textContent = translate('directions');
        }
        if (elements.btnPlaceRoute) elements.btnPlaceRoute.title = translate('startTripButton');
    }

    function showPlaceDetail(placeData) {
        currentPlaceData = placeData;
        if (!elements.placeDetailCard) return;

        elements.placeTitle.textContent = placeData.name || '--';
        elements.placeSubtitle.textContent = formatAddress(placeData.subtitle || placeData.address || '');
        elements.detailAddress.textContent = formatAddress(placeData.address || placeData.subtitle || '--');
        elements.detailCoords.textContent = formatCoordinates(placeData.coord);

        if (placeData.roadDistanceMeters) {
            elements.detailDistance.textContent = translate('roadDistance', {
                dist: formatDistance(placeData.roadDistanceMeters)
            });
        } else if (placeData.distanceMeters) {
            elements.detailDistance.textContent = translate('straightDistance', {
                dist: formatDistance(placeData.distanceMeters)
            });
        } else {
            elements.detailDistance.textContent = '--';
        }

        setPlaceSaved(Boolean(placeData.isSaved));
        renderPlaceRouteAction();

        elements.placeDetailCard.hidden = false;
        setNearbyVisible(false);
        if (elements.recentPlacesSection) elements.recentPlacesSection.hidden = true;
        if (elements.bottomSheet) elements.bottomSheet.classList.add('has-detail');
    }

    function updatePlaceDetailText({ name, subtitle, address }) {
        if (!currentPlaceData) return;
        if (name !== undefined) currentPlaceData.name = name;
        if (subtitle !== undefined) currentPlaceData.subtitle = subtitle;
        if (address !== undefined) currentPlaceData.address = address;
        elements.placeTitle.textContent = currentPlaceData.name || '--';
        elements.placeSubtitle.textContent = formatAddress(
            currentPlaceData.subtitle || currentPlaceData.address || ''
        );
        elements.detailAddress.textContent = formatAddress(
            currentPlaceData.address || currentPlaceData.subtitle || '--'
        );
    }

    function updatePlaceDetailEta({ durationSec, distanceMeters }) {
        if (!currentPlaceData) return;
        currentPlaceData.durationSec = durationSec;
        if (distanceMeters) currentPlaceData.roadDistanceMeters = distanceMeters;

        renderPlaceRouteAction();
        if (elements.detailDistance && distanceMeters) {
            elements.detailDistance.textContent = translate('roadDistance', {
                dist: formatDistance(distanceMeters)
            });
        }
    }

    function setPlaceSaved(isSaved) {
        if (currentPlaceData) currentPlaceData.isSaved = isSaved;
        if (elements.btnPlaceSave) {
            elements.btnPlaceSave.classList.toggle('saved', isSaved);
            if (elements.placeSaveIcon) {
                elements.placeSaveIcon.innerHTML = isSaved ? saveIconFilled : saveIconOutline;
            }
            if (elements.labelSave) {
                elements.labelSave.textContent = translate(isSaved ? 'savedPlace' : 'savePlace');
            }
            elements.btnPlaceSave.setAttribute('aria-pressed', String(isSaved));
        }
        if (elements.placeSavedBadge) {
            elements.placeSavedBadge.textContent = translate('savedPlace');
            elements.placeSavedBadge.hidden = !isSaved;
        }
    }

    function closePlaceDetail() {
        currentPlaceData = null;
        if (elements.placeDetailCard) elements.placeDetailCard.hidden = true;
        if (elements.recentPlacesSection) elements.recentPlacesSection.hidden = false;
        setNearbyVisible(true);
        if (elements.bottomSheet) elements.bottomSheet.classList.remove('has-detail');
    }

    function renderRecentPlaces(items, onSelect, onClear) {
        currentRecentPlaces = items || [];
        if (onSelect) recentSelectCallback = onSelect;
        if (onClear) recentClearCallback = onClear;

        if (!elements.recentList) return;
        elements.recentList.replaceChildren();

        if (currentRecentPlaces.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'recent-empty';
            emptyEl.textContent = translate('noRecentPlaces');
            elements.recentList.appendChild(emptyEl);
            if (elements.btnClearRecent) elements.btnClearRecent.hidden = true;
            return;
        }

        if (elements.btnClearRecent) elements.btnClearRecent.hidden = false;

        currentRecentPlaces.forEach((place) => {
            const item = document.createElement('div');
            item.className = `recent-item ${place.isSaved ? 'saved' : ''}`;
            item.setAttribute('role', 'button');
            const unavailable = place.translationPending || place.isSelectable === false;
            item.setAttribute('aria-disabled', String(Boolean(unavailable)));
            if (unavailable) item.classList.add('translation-unavailable');
            item.tabIndex = unavailable ? -1 : 0;

            const iconEl = document.createElement('div');
            iconEl.className = 'recent-item-icon';
            if (place.isSaved) {
                iconEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${saveIconFilled}</svg>`;
            } else {
                iconEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
            }

            const copyEl = document.createElement('div');
            copyEl.className = 'recent-item-copy';

            const titleEl = document.createElement('div');
            titleEl.className = 'recent-item-title';
            titleEl.textContent = place.name;

            const subEl = document.createElement('div');
            subEl.className = 'recent-item-sub';
            subEl.textContent = formatAddress(place.subtitle || place.address || translate('country'));

            copyEl.append(titleEl, subEl);
            item.append(iconEl, copyEl);

            item.addEventListener('click', () => {
                if (!unavailable && recentSelectCallback) recentSelectCallback(place);
            });
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!unavailable && recentSelectCallback) recentSelectCallback(place);
                }
            });

            elements.recentList.appendChild(item);
        });
    }

    function applyLanguage(nextLanguage, { persist = true, notify = true } = {}) {
        language = nextLanguage === 'en' ? 'en' : 'vi';
        document.documentElement.lang = language;
        document.title = translate('appTitle');
        elements.searchInput.placeholder = translate('searchPlaceholder');
        elements.searchInput.setAttribute('aria-label', translate('searchPlaceholder'));
        elements.clearSearchButton.setAttribute('aria-label', translate('clearSearch'));
        elements.suggestionsBox.setAttribute('aria-label', translate('suggestionsLabel'));
        if (elements.nearbyTitle) elements.nearbyTitle.textContent = translate('findNearby');
        elements.nearbyButtons.forEach((button) => {
            const label = translate(button.dataset.labelKey);
            const labelElement = button.querySelector('.nearby-label');
            const iconElement = button.querySelector('.nearby-icon');
            if (labelElement) labelElement.textContent = label;
            if (iconElement && nearbyIcons[button.dataset.nearbyCategory]) {
                iconElement.innerHTML = nearbyIcons[button.dataset.nearbyCategory];
                iconElement.setAttribute('aria-hidden', 'true');
            }
            button.title = label;
            button.setAttribute('aria-label', label);
        });
        elements.runButton.textContent = translate(routeActive ? 'endTrip' : 'startTrip');
        elements.runButton.title = translate(routeActive ? 'endTripButton' : 'startTripButton');
        elements.gpsButton.title = translate(gpsRunning ? 'gpsTurnOff' : 'gpsTurnOn');
        elements.gpsButton.setAttribute('aria-label', translate(gpsRunning ? 'gpsTurnOff' : 'gpsTurnOn'));
        elements.themeButton.title = translate('themeButton');
        elements.languageButton.textContent = language.toUpperCase();
        elements.languageButton.title = translate('languageButton');
        elements.languageButton.setAttribute('aria-label', translate('languageButton'));
        elements.viewButton.title = translate('viewButton');
        elements.northButton.title = translate('northButton');
        elements.northButton.setAttribute('aria-label', translate('northButton'));
        elements.vehicleModeBar.setAttribute('aria-label', translate('modeGroup'));
        const modeLabelKeys = {
            motorbike: 'modeMotorbike',
            car: 'modeCar'
        };
        elements.vehicleModeButtons.forEach((button) => {
            const label = translate(modeLabelKeys[button.dataset.mode]);
            button.textContent = label;
            button.title = label;
            button.setAttribute('aria-pressed', String(button.dataset.mode === puckMode));
        });
        elements.recenterButton.title = translate('recenterButton');
        if (elements.recenterLabel) elements.recenterLabel.textContent = translate('recenterButton');
        elements.endTripButton.title = translate('endTripButton');
        elements.endTripButton.setAttribute('aria-label', translate('endTripButton'));
        elements.gpsDot.title = translate('gpsDot');
        elements.navSpeedPill.setAttribute('aria-label', translate('navSpeedLabel'));
        elements.navEtaLabel.textContent = translate('navEtaLabel');
        elements.navDurationLabel.textContent = translate('navDurationLabel');
        elements.navDistanceLabel.textContent = translate('navDistanceLabel');
        elements.endTripButton.textContent = translate('navEndButton');

        // Place Detail Sheet & Recent Labels
        if (elements.labelAddress) elements.labelAddress.textContent = translate('addressLabel');
        if (elements.labelCoords) elements.labelCoords.textContent = translate('coordsLabel');
        if (elements.labelDistance) elements.labelDistance.textContent = translate('distanceLabel');
        if (elements.labelShare) elements.labelShare.textContent = translate('sharePlace');
        if (elements.recentTitle) elements.recentTitle.textContent = translate('recentPlaces');
        if (elements.btnClearRecent) elements.btnClearRecent.textContent = translate('clearRecent');
        if (elements.btnClosePlace) elements.btnClosePlace.title = translate('closeDetail');

        setStatus(currentStatus.key, currentStatus.params);
        setRouteInfo(currentRouteInfo.key, currentRouteInfo.params);
        setGpsRunning(gpsRunning);
        if (currentTurnData) renderTurnBanner();
        if (currentNavigationMetrics) renderNavigationMetrics();
        if (currentPlaceData) showPlaceDetail(currentPlaceData);
        if (elements.recentList) renderRecentPlaces(currentRecentPlaces);

        if (persist) localStorage.setItem('app_lang', language);
        if (notify) {
            window.dispatchEvent(new CustomEvent('app-languagechange', {
                detail: { language }
            }));
        }
    }

    function toggleLightMode(map, styles) {
        lightMode = !lightMode;
        document.body.classList.toggle('light-mode', lightMode);
        map.setStyle(lightMode ? styles.light : styles.dark);
        return lightMode;
    }

    function setGpsRunning(running) {
        gpsRunning = running;
        elements.gpsButton.setAttribute('aria-checked', String(gpsRunning));
        elements.gpsButton.querySelector('.gps-switch-label').textContent = gpsRunning ? 'On' : 'Off';
        elements.gpsButton.title = translate(gpsRunning ? 'gpsTurnOff' : 'gpsTurnOn');
        elements.gpsButton.setAttribute('aria-label', translate(gpsRunning ? 'gpsTurnOff' : 'gpsTurnOn'));
    }

    function setGpsActive(active) {
        elements.gpsDot.classList.toggle('active', active);
    }

    function setSpeed(speed) {
        elements.speedDisplay.textContent = String(speed);
        elements.navSpeedValue.textContent = String(speed);
    }

    function setSpeedVisible(visible) {
        const isVisible = Boolean(visible);
        elements.speedHud.classList.toggle('visible', isVisible && !navigationActive);
        elements.navSpeedPill.hidden = !(isVisible && navigationActive);
    }

    function renderNavigationMetrics() {
        if (!currentNavigationMetrics) return;
        const { speedKmh, arrivalTime, remainingSeconds, remainingDistanceMeters } = currentNavigationMetrics;
        setSpeed(Math.round(Math.max(0, speedKmh || 0)));
        elements.navEtaValue.textContent = new Intl.DateTimeFormat(
            language === 'vi' ? 'vi-VN' : 'en-US',
            { hour: '2-digit', minute: '2-digit', hour12: false }
        ).format(new Date(arrivalTime));

        const totalMinutes = Math.max(1, Math.ceil(Math.max(0, remainingSeconds) / 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        elements.navDurationValue.textContent = hours > 0
            ? translate('durationHours', { hours, mins })
            : translate('durationMinutes', { mins: totalMinutes });
        elements.navDistanceValue.textContent = formatDistance(Math.max(0, remainingDistanceMeters));
    }

    function setNavigationMetrics(metrics) {
        currentNavigationMetrics = metrics;
        renderNavigationMetrics();
        setSpeedVisible(true);
    }

    function refreshRecenterButton() {
        elements.recenterButton.hidden = !navigationActive || cameraFollowing;
    }

    function setNavigationActive(active) {
        navigationActive = Boolean(active);
        document.body.classList.toggle('navigating', navigationActive);
        elements.navBottomHud.hidden = !navigationActive;
        elements.navSpeedPill.hidden = !navigationActive;
        if (!navigationActive) {
            currentNavigationMetrics = null;
            elements.turnBanner.hidden = true;
        }
        elements.speedHud.classList.toggle('visible', !navigationActive && elements.speedHud.classList.contains('visible'));
        refreshRecenterButton();
    }

    function setCameraFollowing(following) {
        cameraFollowing = Boolean(following);
        refreshRecenterButton();
    }

    function getSheetHeightBounds() {
        const min = 84;
        const maxRatio = window.innerWidth < 768 ? 0.5 : 0.75;
        const cssMax = Number.parseFloat(getComputedStyle(elements.bottomSheet).maxHeight);
        const fallbackMax = (window.screen.height || window.innerHeight) * maxRatio;
        const max = Math.max(min, Number.isFinite(cssMax) ? cssMax : fallbackMax);
        return { min, max };
    }

    function getDefaultSheetHeight() {
        const { min, max } = getSheetHeightBounds();
        return Math.max(min, Math.min(max, window.innerHeight * 0.3));
    }

    function setSheetHeight(height, { animate = true, open = height > getSheetHeightBounds().min } = {}) {
        const { min, max } = getSheetHeightBounds();
        currentSheetHeight = Math.max(min, Math.min(max, height));
        elements.bottomSheet.style.setProperty('--sheet-height', `${currentSheetHeight}px`);
        sheetOpen = Boolean(open && currentSheetHeight > min + 1);
        elements.bottomSheet.classList.toggle('is-dragging', !animate);
        elements.bottomSheet.dataset.open = String(sheetOpen);
        elements.bottomSheet.style.height = `${currentSheetHeight}px`;
        syncSearchContentPlacement();
    }

    function ensureSheetHeight(minimumHeight) {
        const { min, max } = getSheetHeightBounds();
        const height = Math.max(
            min,
            currentSheetHeight,
            elements.bottomSheet.getBoundingClientRect().height
        );

        if (height < minimumHeight) {
            setSheetHeight(Math.min(max, minimumHeight), { open: true });
            return;
        }

        currentSheetHeight = height;
        elements.bottomSheet.style.setProperty('--sheet-height', `${currentSheetHeight}px`);
        sheetOpen = height > min + 1;
        elements.bottomSheet.dataset.open = String(sheetOpen);
        syncSearchContentPlacement();
    }

    function setSheetSnap(snap) {
        const { min, max } = getSheetHeightBounds();
        if (snap === 'collapsed') {
            setSheetHeight(min, { open: false });
        } else if (snap === 'mid') {
            ensureSheetHeight(getDefaultSheetHeight());
        } else if (snap === 'expanded') {
            setSheetHeight(max, { open: true });
        } else {
            throw new RangeError(`Unsupported sheet state: ${snap}`);
        }
    }

    function setNearbyVisible(visible) {
        if (elements.nearbySection) elements.nearbySection.hidden = !visible;
    }

    function moveSearchContentToPopover() {
        if (!elements.searchPopover) return;
        if (elements.nearbySection && elements.nearbySection.parentNode !== elements.searchPopover) {
            elements.searchPopover.appendChild(elements.nearbySection);
        }
        if (elements.recentPlacesSection && elements.recentPlacesSection.parentNode !== elements.searchPopover) {
            elements.searchPopover.appendChild(elements.recentPlacesSection);
        }
    }

    function restoreSearchContent() {
        const body = elements.sheetScrollBody;
        if (!body) return;
        const anchor = searchContentAnchor?.parentNode === body ? searchContentAnchor : null;
        if (elements.nearbySection && elements.nearbySection.parentNode !== body) {
            body.insertBefore(elements.nearbySection, anchor);
        }
        if (elements.recentPlacesSection && elements.recentPlacesSection.parentNode !== body) {
            body.insertBefore(elements.recentPlacesSection, anchor);
        }
    }

    function syncSearchContentPlacement() {
        if (!elements.searchWrapper.classList.contains('searching')) return;
        if (sheetOpen) {
            restoreSearchContent();
        } else {
            moveSearchContentToPopover();
        }

        const hasQuery = Boolean(elements.searchInput.value.trim());
        setNearbyVisible(!hasQuery && !currentPlaceData);
        if (elements.recentPlacesSection) {
            elements.recentPlacesSection.hidden = hasQuery || Boolean(currentPlaceData);
        }
    }

    function bindSheetDrag() {
        const sheet = elements.bottomSheet;
        if (!sheet) return;

        const header = sheet.querySelector('.sheet-header');
        const scrollBody = sheet.querySelector('.sheet-scroll-body');
        let gesture = null;
        let lastHeaderTapAt = 0;
        const movementThreshold = 6;

        const isInput = (target) => target.closest('input, textarea, select, [contenteditable="true"]');
        const isBlankHeaderTarget = (target) => !target.closest('input, textarea, select, button, a, [contenteditable="true"]');

        const beginDrag = (event) => {
            gesture.dragging = true;
            sheet.classList.add('is-dragging');
            sheet.setPointerCapture(event.pointerId);
        };

        const collapseSheet = () => {
            setSheetHeight(84, { animate: true, open: false });
        };

        sheet.addEventListener('pointerdown', (event) => {
            if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
            if (!(event.target instanceof Element)) return;

            if (elements.searchPopover?.contains(event.target)) {
                gesture = {
                    pointerId: event.pointerId,
                    pointerType: event.pointerType,
                    source: 'popover',
                    startY: event.clientY,
                    startHeight: sheet.getBoundingClientRect().height,
                    startScrollTop: elements.searchPopover.scrollTop,
                    dragging: false,
                    customScrolling: false
                };
                return;
            }

            if (header?.contains(event.target)) {
                if (isInput(event.target)) return;
                gesture = {
                    pointerId: event.pointerId,
                    pointerType: event.pointerType,
                    source: 'header',
                    target: event.target,
                    startY: event.clientY,
                    startHeight: sheet.getBoundingClientRect().height,
                    startScrollTop: 0,
                    dragging: false,
                    customScrolling: false
                };
                return;
            }

            if (scrollBody?.contains(event.target)) {
                if (isInput(event.target)) return;
                gesture = {
                    pointerId: event.pointerId,
                    pointerType: event.pointerType,
                    source: 'scroll',
                    target: event.target,
                    startY: event.clientY,
                    startHeight: sheet.getBoundingClientRect().height,
                    startScrollTop: scrollBody.scrollTop,
                    dragging: false,
                    customScrolling: false
                };
            }
        });

        window.addEventListener('pointermove', (event) => {
            if (!gesture || event.pointerId !== gesture.pointerId) return;
            const deltaY = gesture.startY - event.clientY;

            if (gesture.source === 'header') {
                if (!gesture.dragging && Math.abs(deltaY) < movementThreshold) return;
                if (!gesture.dragging) beginDrag(event);
            } else if (gesture.source === 'popover') {
                if (!gesture.customScrolling && Math.abs(deltaY) >= movementThreshold) {
                    gesture.customScrolling = true;
                    elements.searchPopover.setPointerCapture(event.pointerId);
                }
                if (gesture.customScrolling) {
                    const maxScroll = elements.searchPopover.scrollHeight - elements.searchPopover.clientHeight;
                    elements.searchPopover.scrollTop = Math.max(
                        0,
                        Math.min(maxScroll, gesture.startScrollTop + deltaY)
                    );
                    event.preventDefault();
                    return;
                }
            } else if (gesture.source === 'scroll') {
                if (gesture.pointerType === 'mouse' && !gesture.customScrolling &&
                    Math.abs(deltaY) >= movementThreshold) {
                    if (deltaY <= -8 && gesture.startScrollTop <= 1 && scrollBody.scrollTop <= 1) {
                        beginDrag(event);
                    } else if (deltaY > 0 || gesture.startScrollTop > 1 || scrollBody.scrollTop > 1) {
                        gesture.customScrolling = true;
                        scrollBody.setPointerCapture(event.pointerId);
                    }
                } else if (gesture.pointerType !== 'mouse' && !gesture.dragging &&
                    deltaY < -8 && gesture.startScrollTop <= 1 && scrollBody.scrollTop <= 1) {
                    beginDrag(event);
                }

                if (gesture.customScrolling) {
                    scrollBody.scrollTop = Math.max(0, gesture.startScrollTop + deltaY);
                    event.preventDefault();
                    return;
                }
                if (!gesture.dragging) return;
            }

            setSheetHeight(gesture.startHeight + (gesture.startY - event.clientY), { animate: false });
            event.preventDefault();
        }, { passive: false });

        const finishGesture = (event) => {
            if (!gesture || event.pointerId !== gesture.pointerId) return;
            const finishedGesture = gesture;
            gesture = null;

            if (finishedGesture.dragging) {
                setSheetHeight(currentSheetHeight, { animate: true, open: sheetOpen });
                ignoreOutsideClick = true;
                setTimeout(() => {
                    ignoreOutsideClick = false;
                }, 0);
                return;
            }

            if (finishedGesture.source === 'header' &&
                isBlankHeaderTarget(finishedGesture.target)) {
                const now = performance.now();
                if (now - lastHeaderTapAt <= 300) {
                    lastHeaderTapAt = 0;
                    collapseSheet();
                } else {
                    lastHeaderTapAt = now;
                }
            }
        };

        window.addEventListener('pointerup', finishGesture);
        window.addEventListener('pointercancel', finishGesture);
        header?.addEventListener('dblclick', (event) => {
            if (!(event.target instanceof Element) || !isBlankHeaderTarget(event.target)) return;
            event.preventDefault();
            collapseSheet();
        });
    }

    function openSearchSheet() {
        elements.searchWrapper.classList.add('searching');
        syncSearchContentPlacement();
    }

    function setSearchEnabled(enabled) {
        elements.searchInput.disabled = !enabled;
    }

    function setRunEnabled(enabled) {
        elements.runButton.disabled = !enabled;
        if (elements.btnPlaceRoute) elements.btnPlaceRoute.disabled = !enabled;
    }

    function setDestinationReady(ready) {
        elements.bottomSheet.classList.toggle('destination-ready', ready);
        elements.vehicleModeButtons.forEach((button) => {
            button.disabled = !ready || routeActive || routePending;
        });
        if (!ready) setRunEnabled(false);
    }

    function setRouteActive(active) {
        routeActive = active;
        routePending = false;
        elements.runButton.textContent = translate(active ? 'endTrip' : 'startTrip');
        elements.runButton.title = translate(active ? 'endTripButton' : 'startTripButton');
        elements.runButton.classList.toggle('btn-end', active);
        if (elements.btnPlaceRoute) elements.btnPlaceRoute.classList.toggle('btn-end', active);
        renderPlaceRouteAction();
        elements.vehicleModeButtons.forEach((button) => {
            button.disabled = active || !elements.bottomSheet.classList.contains('destination-ready');
        });
        if (!active) {
            hideTurnBanner();
        }
    }

    function setRoutePending(pending) {
        routePending = pending;
        elements.vehicleModeButtons.forEach((button) => {
            button.disabled = pending || routeActive ||
                !elements.bottomSheet.classList.contains('destination-ready');
        });
    }

    function getSearchValue() {
        return elements.searchInput.value;
    }

    function setRecenterActive(active) {
        setCameraFollowing(active);
        elements.recenterButton.classList.toggle('active', Boolean(active));
    }

    function set3DActive(active) {
        elements.viewButton.classList.toggle('active', active);
    }

    function createPuckElement(mode) {
        const puck = document.createElement('div');
        puck.className = 'user-puck';

        const halo = document.createElement('div');
        halo.className = 'user-puck-halo';
        const body = document.createElement('div');
        body.className = 'user-puck-body';
        body.id = 'user-puck-body';
        puck.append(halo, body);
        puckBodyElement = body;
        setPuckMode(mode);
        return puck;
    }

    function setPuckMode(mode) {
        if (!Object.prototype.hasOwnProperty.call(puckIcons, mode)) {
            throw new RangeError(`Unsupported Puck mode: ${mode}`);
        }
        puckMode = mode;
        if (puckBodyElement) {
            puckBodyElement.innerHTML = puckIcons[mode];
            puckBodyElement.dataset.mode = mode;
        }
        elements.vehicleModeButtons.forEach((button) => {
            const isActive = button.dataset.mode === mode;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function rotatePuck(heading, mapBearing, pitch = 0) {
        updatePuckPose(heading, mapBearing, pitch);
    }

    function computePuckTilt(pitchDeg = 0) {
        const ratio = Math.max(0, Math.min(1, pitchDeg / 60));
        return {
            tiltDeg: ratio * 36,
            scaleY: 1 - ratio * 0.18
        };
    }

    function updatePuckPose(headingDeg = 0, bearingDeg = 0, pitchDeg = 0) {
        if (!puckBodyElement || !Number.isFinite(headingDeg) ||
            !Number.isFinite(bearingDeg) || !Number.isFinite(pitchDeg)) return;

        const puckElement = puckBodyElement.parentElement;
        if (!puckElement) return;

        const relativeHeading = ((headingDeg - bearingDeg) % 360 + 360) % 360;
        const { tiltDeg, scaleY } = computePuckTilt(pitchDeg);
        puckElement.style.setProperty('--puck-tilt', `${tiltDeg.toFixed(2)}deg`);
        puckElement.style.setProperty('--puck-scale-y', scaleY.toFixed(3));
        puckElement.style.setProperty('--puck-heading', `${relativeHeading.toFixed(2)}deg`);
    }

    function rotateCompass(mapBearing) {
        if (!Number.isFinite(mapBearing)) return;
        const targetAngle = ((mapBearing % 360) + 360) % 360;
        const currentNormalized = ((currentCompassAngle % 360) + 360) % 360;
        let delta = targetAngle - currentNormalized;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        currentCompassAngle += delta;
        elements.compassIcon.style.transform = `rotate(${-currentCompassAngle.toFixed(1)}deg)`;
        elements.compassDirection.textContent = compassDirections[Math.round(targetAngle / 45) % compassDirections.length];
    }

    function syncPitchAndBearingUI(pitch, bearing) {
        const tiltedOrRotated = pitch > 5 || Math.abs(bearing) > 2;
        elements.leftMapTools.classList.toggle('visible', tiltedOrRotated);
        set3DActive(pitch > 10);
    }

    function customizeMapLabels(map) {
        if (!map.isStyleLoaded()) return;

        const pitch = map.getPitch();
        const isTilted = pitch > 10;
        const pitchFactor = Math.min(1, Math.max(0, pitch / 60));
        const finalScale = 1.2 + pitchFactor * 0.2;
        const textColor = lightMode ? '#1F2937' : '#F8FAFC';
        const haloColor = lightMode
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(15, 23, 42, 0.92)';

        map.getStyle()?.layers.forEach((layer) => {
            if (layer.type !== 'symbol') return;

            const isRoadLabel = /road|street|highway|path|alley|transportation/.test(layer.id.toLowerCase());
            const textField = map.getLayoutProperty(layer.id, 'text-field');
            if (!labelTextFields.has(layer.id)) labelTextFields.set(layer.id, textField);
            const baseTextField = labelTextFields.get(layer.id);
            const fieldUsesName = typeof baseTextField === 'string'
                ? /\{name(?::[^}]+)?\}/.test(baseTextField)
                : /"name(?::[^"]*)?"/.test(JSON.stringify(baseTextField));
            if (fieldUsesName) {
                map.setLayoutProperty(layer.id, 'text-field', [
                    'coalesce',
                    ['get', `name:${language}`],
                    baseTextField
                ]);
            }

            const textSize = map.getLayoutProperty(layer.id, 'text-size');
            if (!labelTextSizes.has(layer.id)) labelTextSizes.set(layer.id, textSize);
            const baseTextSize = labelTextSizes.get(layer.id);
            if (typeof baseTextSize === 'number') {
                map.setLayoutProperty(layer.id, 'text-size',
                    Number((baseTextSize * finalScale).toFixed(1)));
            } else if (Array.isArray(baseTextSize)) {
                const scaledExpression = baseTextSize.map((item, index) => {
                    if (index >= 4 && typeof item === 'number' && index % 2 === 1) {
                        return Number((item * finalScale).toFixed(1));
                    }
                    return item;
                });
                map.setLayoutProperty(layer.id, 'text-size', scaledExpression);
            }

            map.setLayoutProperty(layer.id, 'text-pitch-alignment',
                isTilted ? (isRoadLabel ? 'map' : 'viewport') : 'auto');
            map.setLayoutProperty(layer.id, 'text-rotation-alignment',
                isTilted ? (isRoadLabel ? 'map' : 'viewport') : 'auto');
            map.setLayoutProperty(layer.id, 'text-padding', isTilted && isRoadLabel ? 8 : 4);
            map.setPaintProperty(layer.id, 'text-color', textColor);
            map.setPaintProperty(layer.id, 'text-halo-color', haloColor);
            map.setPaintProperty(layer.id, 'text-halo-width', isTilted ? 2.2 : 1.6);
        });
    }

    function resetMapStyle() {
        labelTextSizes.clear();
        labelTextFields.clear();
    }

    function formatDistance(meters) {
        const number = new Intl.NumberFormat(language, { maximumFractionDigits: 1 });
        return meters < 1000
            ? `${Math.round(meters)} ${translate('distanceUnit')}`
            : `${number.format(meters / 1000)} ${translate('distanceUnitKm')}`;
    }

    function formatAddress(address) {
        if (typeof address !== 'string' || language !== 'vi') return address || '';
        return [
            [/\bHo Chi Minh City\b/gi, 'TP. Hồ Chí Minh'],
            [/\bHo Chi Minh\b/gi, 'TP. Hồ Chí Minh'],
            [/\bHanoi\b/gi, 'Hà Nội'],
            [/\bDa Nang\b/gi, 'Đà Nẵng'],
            [/\bHai Phong\b/gi, 'Hải Phòng'],
            [/\bCan Tho\b/gi, 'Cần Thơ'],
            [/\bDistrict\s+(\d+)\b/gi, 'Quận $1'],
            [/\bWard\s+(\d+)\b/gi, 'Phường $1'],
            [/\bVietnam\b/gi, 'Việt Nam']
        ].reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), address);
    }

    function getSuggestionIcon(category = '') {
        const value = category.toLowerCase();
        if (/airport|aeroway/.test(value)) return { icon: '✈', iconClass: 'airport' };
        if (/water|river|lake|beach|harbour/.test(value)) return { icon: '≋', iconClass: 'water' };
        if (/school|college|university|education/.test(value)) return { icon: '▦', iconClass: 'school' };
        if (/shop|mall|commercial/.test(value)) return { icon: '▣', iconClass: 'shop' };
        if (/sport|stadium|pitch/.test(value)) return { icon: '⚽', iconClass: 'sport' };
        return { icon: '●', iconClass: 'place' };
    }

    function clearSuggestions() {
        elements.suggestionsBox.classList.remove('show');
        elements.searchPopover.classList.remove('has-suggestions');
        elements.suggestionsBox.replaceChildren();
    }

    function showSuggestionMessage(key) {
        elements.suggestionsBox.replaceChildren();
        const message = document.createElement('div');
        message.className = 'suggestion-message';
        message.textContent = translate(key);
        elements.suggestionsBox.appendChild(message);
        elements.suggestionsBox.classList.add('show');
        elements.searchPopover.classList.add('has-suggestions');
    }

    function renderSuggestions(items, onSelect) {
        const scrollTop = elements.suggestionsBox.scrollTop;
        elements.suggestionsBox.replaceChildren();
        items.forEach((place) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.setAttribute('role', 'option');
            const unavailable = place.translationPending || place.isSelectable === false;
            item.setAttribute('aria-disabled', String(Boolean(unavailable)));
            if (unavailable) item.classList.add('translation-unavailable');

            const icon = document.createElement('div');
            icon.className = `suggestion-icon ${place.iconClass}`;
            icon.textContent = place.icon;

            const copy = document.createElement('div');
            copy.className = 'suggestion-copy';

            const title = document.createElement('div');
            title.className = 'suggestion-title';
            title.textContent = place.name;

            const subtitle = document.createElement('div');
            subtitle.className = 'suggestion-sub';
            subtitle.textContent = formatAddress(place.subtitle);

            copy.append(title, subtitle);
            item.append(icon, copy);
            item.addEventListener('click', () => {
                if (!unavailable) onSelect(place);
            });
            elements.suggestionsBox.appendChild(item);
        });
        elements.suggestionsBox.scrollTop = scrollTop;
        elements.suggestionsBox.classList.add('show');
        elements.searchPopover.classList.add('has-suggestions');
    }

    function setSearchValue(value) {
        elements.searchInput.value = value;
        elements.searchPill.classList.toggle('has-value', value.length > 0);
    }

    function closeSearch({ collapse = true } = {}) {
        elements.searchWrapper.classList.remove('searching');
        clearSuggestions();
        restoreSearchContent();
        setNearbyVisible(!currentPlaceData);
        if (elements.recentPlacesSection) {
            elements.recentPlacesSection.hidden = Boolean(currentPlaceData);
        }
        if (onSearchClose) onSearchClose();
        elements.searchInput.blur();
        if (collapse && !currentPlaceData && !routeActive) setSheetSnap('collapsed');
    }

    function bindSearch({ onInput, onSubmit, onClose, onNearbyCategory }) {
        onSearchClose = onClose || null;
        bindSheetDrag();
        elements.searchInput.addEventListener('pointerdown', () => {
            if (document.activeElement !== elements.searchInput) {
                elements.searchInput.focus({ preventScroll: true });
            }
            openSearchSheet();
        });
        elements.searchInput.addEventListener('focus', () => {
            openSearchSheet();
            const query = elements.searchInput.value.trim();
            if (query.length >= 2 && !elements.suggestionsBox.classList.contains('show')) {
                setNearbyVisible(false);
                if (elements.recentPlacesSection) elements.recentPlacesSection.hidden = true;
                onInput(query, true);
            } else if (query.length === 0) {
                clearSuggestions();
                setNearbyVisible(!currentPlaceData);
                if (elements.recentPlacesSection) {
                    elements.recentPlacesSection.hidden = Boolean(currentPlaceData);
                }
            }
        });
        elements.searchInput.addEventListener('click', openSearchSheet);
        elements.searchInput.addEventListener('input', () => {
            const query = elements.searchInput.value.trim();
            elements.searchPill.classList.toggle('has-value', query.length > 0);
            setNearbyVisible(query.length === 0 && !currentPlaceData);
            if (elements.recentPlacesSection) {
                elements.recentPlacesSection.hidden = query.length > 0 || Boolean(currentPlaceData);
            }
            onInput(query, false);
        });
        elements.clearSearchButton.addEventListener('click', () => {
            elements.searchInput.value = '';
            elements.searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            elements.searchInput.focus({ preventScroll: true });
        });
        elements.nearbyButtons.forEach((button) => {
            button.addEventListener('click', () => {
                setNearbyVisible(false);
                if (elements.recentPlacesSection) elements.recentPlacesSection.hidden = true;
                elements.searchInput.blur();
                if (onNearbyCategory) onNearbyCategory(button.dataset.nearbyCategory);
            });
        });
        elements.searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
                closeSearch({ collapse: false });
            } else if (event.key === 'Escape') {
                closeSearch();
            }
        });
        document.addEventListener('click', (event) => {
            if (ignoreOutsideClick) {
                ignoreOutsideClick = false;
                return;
            }
            if (!event.target.closest('.search-wrapper') &&
                !navigationActive &&
                elements.searchWrapper.classList.contains('searching')) {
                closeSearch({ collapse: false });
            }
        });
    }

    function bindControls(handlers) {
        elements.languageButton.addEventListener('click', () => {
            applyLanguage(language === 'vi' ? 'en' : 'vi');
        });
        elements.themeButton.addEventListener('click', handlers.onTheme);
        elements.viewButton.addEventListener('click', handlers.on3D);
        elements.northButton.addEventListener('click', handlers.onNorth);
        elements.vehicleModeButtons.forEach((button) => {
            button.addEventListener('click', () => handlers.onPuckMode(button.dataset.mode));
        });
        elements.recenterButton.addEventListener('click', handlers.onRecenter);
        elements.recenterControlButton.addEventListener('click', handlers.onRecenter);
        elements.runButton.addEventListener('click', handlers.onRun);
        elements.endTripButton.addEventListener('click', handlers.onEndTrip || handlers.onRun);
        elements.gpsButton.addEventListener('click', handlers.onGPS);
        if (handlers.onTurnBannerClick && elements.turnBanner) {
            elements.turnBanner.addEventListener('click', handlers.onTurnBannerClick);
        }
    }

    function bindPlaceDetailEvents(handlers) {
        if (elements.btnClosePlace && handlers.onClose) {
            elements.btnClosePlace.addEventListener('click', handlers.onClose);
        }
        if (elements.btnPlaceRoute && handlers.onRoute) {
            elements.btnPlaceRoute.addEventListener('click', handlers.onRoute);
        }
        if (elements.btnPlaceSave && handlers.onSave) {
            elements.btnPlaceSave.addEventListener('click', handlers.onSave);
        }
        if (elements.btnPlaceShare && handlers.onShare) {
            elements.btnPlaceShare.addEventListener('click', handlers.onShare);
        }
        if (elements.btnClearRecent && handlers.onClearRecent) {
            elements.btnClearRecent.addEventListener('click', handlers.onClearRecent);
        }
    }

    function updateTurnBanner(message, visible = Boolean(message)) {
        if (!elements.turnBanner) return;
        if (!visible || !message) {
            hideTurnBanner();
            return;
        }
        if (typeof message === 'object') {
            setTurnBanner(message);
        } else {
            if (elements.turnInstruction) elements.turnInstruction.textContent = message;
            if (elements.turnDistance) elements.turnDistance.textContent = '';
            if (elements.turnStreet) elements.turnStreet.textContent = '';
            if (elements.turnBadge) elements.turnBadge.hidden = true;
            elements.turnBanner.hidden = false;
        }
    }

    document.body.classList.toggle('light-mode', lightMode);
    applyLanguage(language, { persist: false, notify: false });

    window.GPSMapUI = {
        applyLanguage,
        bindControls,
        bindPlaceDetailEvents,
        bindSearch,
        clearSuggestions,
        closePlaceDetail,
        closeSearch,
        customizeMapLabels,
        createPuckElement,
        formatCoordinates,
        formatAddress,
        formatDistance,
        getSearchValue,
        getLanguage: () => language,
        getLightMode: () => lightMode,
        getSuggestionIcon,
        hideTurnBanner,
        isSuggestionsVisible: () => elements.suggestionsBox.classList.contains('show'),
        renderRecentPlaces,
        renderSuggestions,
        rotateCompass,
        rotatePuck,
        resetMapStyle,
        setDestinationReady,
        setGpsActive,
        setGpsRunning,
        setNavigationActive,
        setNavigationMetrics,
        setCameraFollowing,
        setPlaceSaved,
        setPuckMode,
        setRecenterActive,
        setRouteActive,
        setRouteInfo,
        setRoutePending,
        setRunEnabled,
        set3DActive,
        setSearchEnabled,
        setSearchValue,
        setSheetHeight,
        setSpeed,
        setSpeedVisible,
        setSheetSnap,
        setNearbyVisible,
        setStatus,
        setTurnBanner,
        showPlaceDetail,
        showSuggestionMessage,
        syncPitchAndBearingUI,
        text,
        toggleLightMode,
        updatePlaceDetailEta,
        updatePlaceDetailText,
        updatePuckPose,
        updateTurnBanner
    };
})();
