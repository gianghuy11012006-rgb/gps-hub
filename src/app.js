const UI = window.GPSMapUI;

const STYLES = {
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
};

const savedViewMode = localStorage.getItem('gps_view_mode');
let is3D = savedViewMode !== '2d';

const PUCK_MODES = new Set(['pointer', 'motorbike', 'car']);
const savedPuckMode = localStorage.getItem('gps_puck_mode');
let preferredVehicleMode = PUCK_MODES.has(savedPuckMode) && savedPuckMode !== 'pointer'
    ? savedPuckMode
    : null;
let puckMode = 'pointer';
let isLightMode = UI.getLightMode();
let currentRouteGeoJSON = null;
let routeActive = false;
let isNavigating = false;
let isCameraFollowing = false;
let activeRouteMode = null;
let routeRequestId = 0;
let destinationLanguageRequestId = 0;
let destinationTranslationController = null;
let navigationWakeLock = null;
let rerouteInProgress = false;
let lastRerouteAt = 0;
const localizedRouteStreets = new Map();
const pendingRouteStreetLocalizations = new Set();

// Trạng thái dẫn đường & cảnh báo rẽ
let navigationSteps = null;
let activeStepIndex = 0;
let currentManeuverData = null;

// Khóa lưu trữ địa điểm gần đây & đã lưu
const STORAGE_KEY_RECENTS = 'gps_recent_places';
const STORAGE_KEY_SAVED = 'gps_saved_places';
const TRANSLATION_CACHE_KEY = 'gps_translation_cache_v1';
const TRANSLATION_CACHE_LIMIT = 500;
const TRANSLATION_TIMEOUT_MS = 1800;
const translationCache = loadTranslationCache();
let previewAbortController = null;
const NEARBY_CATEGORIES = {
    restaurant: { labelKey: 'nearbyRestaurants', vi: 'quán ăn', en: 'restaurant' },
    cafe: { labelKey: 'nearbyCafes', vi: 'cà phê', en: 'cafe' },
    fuel: { labelKey: 'nearbyFuel', vi: 'trạm xăng', en: 'gas station' },
    supermarket: { labelKey: 'nearbyMarkets', vi: 'siêu thị', en: 'supermarket' },
    pharmacy: { labelKey: 'nearbyPharmacies', vi: 'nhà thuốc', en: 'pharmacy' }
};

const map = new maplibregl.Map({
    container: 'map',
    style: isLightMode ? STYLES.light : STYLES.dark,
    center: [106.7009, 10.7769],
    zoom: 16,
    pitch: is3D ? 60 : 0,
    bearing: 0,
    attributionControl: false
});

// Puck vị trí hiện tại
const puckEl = UI.createPuckElement(puckMode);

const userMarker = new maplibregl.Marker({ element: puckEl, rotationAlignment: 'viewport' })
    .setLngLat([106.7009, 10.7769])
    .addTo(map);

// Marker điểm đến sau khi Search
const destEl = document.createElement('div');
destEl.className = 'dest-pin';
destEl.innerHTML = `<div class="dest-pin-head"></div>`;
let destMarker = null;
let selectedDestination = null; // { name, coord: [lng, lat], subtitle, address, category }

let watchId = null;
let followUser = true;
let prevSample = null;
let currentBearing = 0;
let puckHeading = 0;
let smoothedSpeed = 0;

// Quản lý LocalStorage cho địa điểm gần đây & đã lưu
function loadStoredPlaces(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveStoredPlaces(key, list) {
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
        console.warn('Storage error', e);
    }
}

function loadTranslationCache() {
    const cache = new Map();
    try {
        const parsed = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return cache;
        Object.entries(parsed).slice(-TRANSLATION_CACHE_LIMIT).forEach(([source, translated]) => {
            if (source && typeof translated === 'string' && translated) {
                cache.set(source, translated);
            }
        });
    } catch (error) {
        console.warn('Unable to load place translation cache', error);
    }
    return cache;
}

function persistTranslationCache() {
    try {
        const entries = Array.from(translationCache.entries()).slice(-TRANSLATION_CACHE_LIMIT);
        localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch (error) {
        console.warn('Unable to save place translation cache', error);
    }
}

function getCachedTranslation(source) {
    if (typeof source !== 'string' || !source.trim()) return null;
    const key = source.trim().replace(/\s+/g, ' ');
    const translated = translationCache.get(key);
    if (!translated) return null;
    translationCache.delete(key);
    translationCache.set(key, translated);
    return translated;
}

function cacheTranslation(source, translated) {
    if (typeof source !== 'string' || !source.trim() || !translated) return;
    const key = source.trim().replace(/\s+/g, ' ');
    translationCache.delete(key);
    translationCache.set(key, translated);
    while (translationCache.size > TRANSLATION_CACHE_LIMIT) {
        translationCache.delete(translationCache.keys().next().value);
    }
    persistTranslationCache();
}

function decodeTranslation(value) {
    return new DOMParser().parseFromString(value, 'text/html').body.textContent.trim();
}

async function translateTextToVietnamese(source, signal) {
    if (typeof source !== 'string') return null;
    const text = source.trim().replace(/\s+/g, ' ');
    if (!text) return null;

    const cached = getCachedTranslation(text);
    if (cached) return cached;
    if (signal?.aborted) throw new DOMException('Search was cancelled', 'AbortError');

    const controller = new AbortController();
    const abortFromSearch = () => controller.abort();
    signal?.addEventListener('abort', abortFromSearch, { once: true });
    const timeoutId = setTimeout(abortFromSearch, TRANSLATION_TIMEOUT_MS);

    try {
        const params = new URLSearchParams({ q: text, langpair: 'en|vi' });
        const response = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' }
        });
        if (!response.ok) return null;

        const data = await response.json();
        if (Number(data.responseStatus) !== 200 || typeof data.responseData?.translatedText !== 'string') {
            return null;
        }

        const translated = decodeTranslation(data.responseData.translatedText);
        if (!translated || translated.toLocaleLowerCase() === text.toLocaleLowerCase()) return null;
        cacheTranslation(text, translated);
        return translated;
    } catch (error) {
        if (signal?.aborted) throw error;
        return null;
    } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', abortFromSearch);
    }
}

function getPlaceKey(place) {
    if (!place) return '';
    const coordKey = place.coord ? `${place.coord[0].toFixed(5)},${place.coord[1].toFixed(5)}` : '';
    return coordKey ? `coord_${coordKey}` : (place.sourceName || place.name || '');
}

function isPlaceSaved(place) {
    if (!place) return false;
    const saved = loadStoredPlaces(STORAGE_KEY_SAVED);
    const key = getPlaceKey(place);
    return saved.some(p => getPlaceKey(p) === key);
}

function toggleSavePlace(place) {
    if (!place) return false;
    let saved = loadStoredPlaces(STORAGE_KEY_SAVED);
    const key = getPlaceKey(place);
    const index = saved.findIndex(p => getPlaceKey(p) === key);
    let nowSaved = false;

    if (index >= 0) {
        saved.splice(index, 1);
        nowSaved = false;
        UI.setStatus('placeUnsaved');
    } else {
        saved.unshift({
            name: place.name,
            coord: place.coord,
            subtitle: place.subtitle || '',
            address: place.address || '',
            sourceName: place.sourceName || place.name,
            sourceAddress: place.sourceAddress || place.address || '',
            nameIsLocalized: Boolean(place.nameIsLocalized),
            addressIsLocalized: Boolean(place.addressIsLocalized),
            category: place.category || '',
            isSaved: true
        });
        nowSaved = true;
        UI.setStatus('placeSaved');
    }

    saveStoredPlaces(STORAGE_KEY_SAVED, saved);
    UI.setPlaceSaved(nowSaved);
    refreshRecentPlacesUI();
    return nowSaved;
}

function addRecentPlace(place) {
    if (!place || !place.coord) return;
    let recents = loadStoredPlaces(STORAGE_KEY_RECENTS);
    const key = getPlaceKey(place);
    recents = recents.filter(p => getPlaceKey(p) !== key);
    recents.unshift({
        name: place.name,
        coord: place.coord,
        subtitle: place.subtitle || '',
        address: place.address || '',
        sourceName: place.sourceName || place.name,
        sourceAddress: place.sourceAddress || place.address || '',
        nameIsLocalized: Boolean(place.nameIsLocalized),
        addressIsLocalized: Boolean(place.addressIsLocalized),
        category: place.category || '',
        timestamp: Date.now()
    });
    if (recents.length > 10) recents = recents.slice(0, 10);
    saveStoredPlaces(STORAGE_KEY_RECENTS, recents);
    refreshRecentPlacesUI();
}

function clearRecentPlaces() {
    localStorage.removeItem(STORAGE_KEY_RECENTS);
    refreshRecentPlacesUI();
}

function refreshRecentPlacesUI() {
    if (recentTranslationController) {
        recentTranslationController.abort();
        recentTranslationController = null;
    }

    const recents = loadStoredPlaces(STORAGE_KEY_RECENTS);
    const saved = loadStoredPlaces(STORAGE_KEY_SAVED);
    const savedKeys = new Set(saved.map(p => getPlaceKey(p)));

    const list = recents.map((recent) => {
        const place = {
            ...recent,
            sourceName: recent.sourceName || recent.name,
            sourceAddress: recent.sourceAddress || recent.address || recent.subtitle || '',
            isSaved: savedKeys.has(getPlaceKey(recent))
        };
        if (UI.getLanguage() === 'vi') {
            const name = getCachedPlaceText(place, 'name');
            const address = getCachedPlaceText(place, 'address');
            setVietnamesePlaceDisplay(place, name, address, !name || !address);
        } else {
            place.name = place.sourceName;
            place.address = place.sourceAddress;
            place.subtitle = place.sourceAddress || place.subtitle;
            place.translationPending = false;
            place.isSelectable = true;
        }
        return place;
    });

    UI.renderRecentPlaces(list, (selected) => {
        selectDestinationPlace(selected);
    }, clearRecentPlaces);

    if (UI.getLanguage() === 'vi') void translateRecentPlaces(list);
}

async function translateRecentPlaces(places) {
    const controller = new AbortController();
    recentTranslationController = controller;
    const language = UI.getLanguage();
    for (let index = 0; index < places.length; index += 4) {
        const batch = places.slice(index, index + 4)
            .filter((place) => place.translationPending);
        try {
            await Promise.all(batch.map((place) => resolvePlaceForVietnamese(place, controller.signal)));
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.warn('Unable to translate recent places', error);
        }
        if (controller.signal.aborted || recentTranslationController !== controller ||
            language !== UI.getLanguage()) return;
        UI.renderRecentPlaces(places, (selected) => {
            selectDestinationPlace(selected);
        }, clearRecentPlaces);
    }
    if (recentTranslationController === controller) recentTranslationController = null;
}

function updateStoredPlaceLanguage(place) {
    if (!place.coord) return;

    [STORAGE_KEY_RECENTS, STORAGE_KEY_SAVED].forEach((key) => {
        const places = loadStoredPlaces(key);
        let changed = false;
        places.forEach((storedPlace) => {
            if (!storedPlace.coord ||
                storedPlace.coord.some((value, index) => Math.abs(value - place.coord[index]) > 0.00001)) return;
            storedPlace.name = place.name;
            storedPlace.subtitle = place.subtitle;
            storedPlace.address = place.address;
            changed = true;
        });
        if (changed) saveStoredPlaces(key, places);
    });
}

function shareCoordinates(place) {
    if (!place || !place.coord) return;
    const [lng, lat] = place.coord;
    const textToCopy = `${place.name}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            UI.setStatus('copiedCoords');
        }).catch(() => {
            promptCopy(textToCopy);
        });
    } else {
        promptCopy(textToCopy);
    }
}

function promptCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        UI.setStatus('copiedCoords');
    } catch {
        // Fallback
    }
    ta.remove();
}

// Lấy trước thời gian ước tính (ETA) tuyến đường từ OSRM
async function fetchRoutePreview(destCoord) {
    if (previewAbortController) previewAbortController.abort();
    previewAbortController = new AbortController();

    const destination = selectedDestination;
    const startCoord = prevSample ? prevSample.coord : userMarker.getLngLat().toArray();
    const language = UI.getLanguage();
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${destCoord[0]},${destCoord[1]}?overview=full&geometries=geojson&steps=false`;

    try {
        const res = await fetch(url, {
            signal: previewAbortController.signal,
            headers: { 'Accept-Language': language }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            if (selectedDestination !== destination || isNavigating) return;
            UI.updatePlaceDetailEta({
                durationSec: route.duration,
                distanceMeters: route.distance
            });
            if (route.geometry?.coordinates?.length) {
                const preview = {
                    type: 'Feature',
                    properties: { preview: true },
                    geometry: route.geometry
                };
                drawRouteLayer(preview);
                const bounds = new maplibregl.LngLatBounds();
                route.geometry.coordinates.forEach((coord) => bounds.extend(coord));
                map.fitBounds(bounds, {
                    padding: { top: 100, right: 70, bottom: Math.max(220, window.innerHeight * 0.34), left: 70 },
                    maxZoom: 16,
                    duration: 650
                });
            }
        }
    } catch (e) {
        // Bỏ qua lỗi hủy
    }
}

function drawRouteLayer(geojson) {
    if (!geojson) return;
    currentRouteGeoJSON = geojson;
    if (!map.isStyleLoaded()) return;

    if (map.getSource('osrm-route')) {
        map.getSource('osrm-route').setData(geojson);
    } else {
        map.addSource('osrm-route', {
            type: 'geojson',
            data: geojson
        });
        map.addLayer({
            id: 'osrm-route-line',
            type: 'line',
            source: 'osrm-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': '#0A84FF',
                'line-width': 6,
                'line-opacity': 0.9
            }
        });
    }
}

function clearRouteLayer() {
    currentRouteGeoJSON = null;
    if (!map.isStyleLoaded()) return;
    if (map.getLayer('osrm-route-line')) map.removeLayer('osrm-route-line');
    if (map.getSource('osrm-route')) map.removeSource('osrm-route');
}

function resetDestination({ clearSearch = false, updateStatus = true } = {}) {
    if (destinationTranslationController) {
        destinationTranslationController.abort();
        destinationTranslationController = null;
    }
    if (isNavigating) {
        sendEspHudState(false);
        releaseNavigationWakeLock();
    }
    isNavigating = false;
    isCameraFollowing = false;
    UI.setNavigationActive(false);
    UI.setCameraFollowing(false);
    routeRequestId += 1;
    navigationSteps = null;
    activeStepIndex = 0;
    currentManeuverData = null;
    UI.hideTurnBanner();
    UI.closePlaceDetail();
    selectedDestination = null;
    routeActive = false;
    activeRouteMode = null;
    clearRouteLayer();
    if (destMarker) {
        destMarker.remove();
        destMarker = null;
    }

    puckMode = 'pointer';
    UI.setPuckMode(puckMode);
    UI.setRouteActive(false);
    UI.setRoutePending(false);
    UI.setDestinationReady(false);
    UI.setRunEnabled(false);
    UI.setRouteInfo('accuracyEmpty');
    UI.setSpeedVisible(smoothedSpeed >= 2.5);
    UI.setSheetSnap('collapsed');
    UI.setNearbyVisible(true);
    if (clearSearch) UI.setSearchValue('');
    if (updateStatus) UI.setStatus('ready');
    followUser = watchId !== null;
    UI.setRecenterActive(followUser);
    refreshRecentPlacesUI();
}

function setDestination(name, coord, details = {}) {
    if (destinationTranslationController) {
        destinationTranslationController.abort();
        destinationTranslationController = null;
    }
    routeRequestId += 1;
    navigationSteps = null;
    activeStepIndex = 0;
    currentManeuverData = null;
    UI.hideTurnBanner();
    clearRouteLayer();

    const origin = prevSample ? prevSample.coord : userMarker.getLngLat().toArray();
    const straightDist = getDistanceMeters(origin, coord);
    const subtitle = details.subtitle || details.address || '';
    const address = details.address || subtitle || name;

    selectedDestination = {
        name,
        coord,
        subtitle,
        address,
        sourceName: details.sourceName || name,
        sourceAddress: details.sourceAddress || address,
        nameIsLocalized: Boolean(details.nameIsLocalized),
        localizedName: details.localizedName || (details.nameIsLocalized ? name : ''),
        addressIsLocalized: Boolean(details.addressIsLocalized),
        category: details.category || '',
        distanceMeters: straightDist
    };
    routeActive = false;
    if (isNavigating) {
        sendEspHudState(false);
        releaseNavigationWakeLock();
    }
    isNavigating = false;
    isCameraFollowing = false;
    activeRouteMode = null;
    UI.setNavigationActive(false);
    UI.setCameraFollowing(false);

    if (!destMarker) {
        destMarker = new maplibregl.Marker({ element: destEl, anchor: 'bottom' })
            .setLngLat(coord)
            .addTo(map);
    } else {
        destMarker.setLngLat(coord);
    }

    puckMode = preferredVehicleMode || 'pointer';
    UI.setPuckMode(puckMode);
    UI.setRouteActive(false);
    UI.setRoutePending(false);
    UI.setDestinationReady(true);
    UI.setRunEnabled(puckMode !== 'pointer');

    const savedState = isPlaceSaved(selectedDestination);

    // Mở Thẻ chi tiết địa điểm kiểu Apple Maps
    UI.showPlaceDetail({
        name,
        subtitle,
        address,
        coord,
        distanceMeters: straightDist,
        isSaved: savedState
    });
    UI.setSheetSnap('mid');

    // Lưu vào lịch sử gần đây
    addRecentPlace(selectedDestination);

    // Lấy trước thời gian ước tính (ETA)
    fetchRoutePreview(coord);

    followUser = false;
    UI.setRecenterActive(false);
    map.flyTo({ center: coord, zoom: 16, duration: 800 });
    UI.setStatus('destination', { name });
}

function syncMapOrientationUI() {
    const bearing = map.getBearing();
    const pitch = map.getPitch();
    UI.syncPitchAndBearingUI(pitch, bearing);
    UI.rotateCompass(bearing);
    UI.rotatePuck(puckHeading, bearing, pitch);
}

map.on('pitch', syncMapOrientationUI);
map.on('rotate', syncMapOrientationUI);

map.on('pitch', () => UI.customizeMapLabels(map));
map.on('move', syncMapOrientationUI);
syncMapOrientationUI();

// 3. Camera follow and manual map exploration
function stopNavigationCameraFollowing() {
    if (!isNavigating) return;
    isCameraFollowing = false;
    followUser = false;
    UI.setCameraFollowing(false);
    UI.setRecenterActive(false);
}

map.on('dragstart', () => {
    if (isNavigating) {
        stopNavigationCameraFollowing();
    } else {
        followUser = false;
        UI.setRecenterActive(false);
    }
});
const mapGestureSurface = map.getCanvasContainer();
mapGestureSurface.addEventListener('wheel', stopNavigationCameraFollowing, { passive: true });
mapGestureSurface.addEventListener('touchstart', stopNavigationCameraFollowing, { passive: true });

// 4. Tìm kiếm địa điểm bằng Nominatim + cắm Marker điểm đến & mở chi tiết
async function searchPlace() {
    const query = UI.getSearchValue().trim();
    if (!query) {
        UI.setStatus('searchRequired');
        return;
    }

    UI.setStatus('searchingPlace', { query });
    UI.setSearchEnabled(false);

    try {
        const lang = UI.getLanguage();
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=1&accept-language=en&q=${encodeURIComponent(query)}`;
        const origin = prevSample ? prevSample.coord : map.getCenter().toArray();
        let place = null;

        try {
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            if (!res.ok) throw new Error(`Nominatim search failed: HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length) {
                place = normalizeNominatimSuggestion(data[0], query, origin, lang);
            }
        } catch {
            place = null;
        }

        if (!place) {
            const fallbackPlaces = await fetchPhotonSuggestions(
                query,
                origin,
                1,
                lang,
                new AbortController().signal
            );
            place = fallbackPlaces[0] || null;
        }

        if (!place) {
            UI.setStatus('placeNotFound');
            return;
        }

        if (UI.getLanguage() === 'vi') {
            place = await resolvePlaceForVietnamese(place, new AbortController().signal);
        } else {
            place.name = place.sourceName;
            place.address = place.sourceAddress;
            place.subtitle = [place.distanceText, place.address].filter(Boolean).join(' · ');
        }

        if (!place.isSelectable && place.nameIsLocalized === false && UI.getLanguage() === 'vi') {
            UI.setStatus('translationUnavailableName');
            return;
        }

        setDestination(place.name, place.coord, {
            address: place.address,
            subtitle: place.subtitle,
            sourceName: place.sourceName,
            sourceAddress: place.sourceAddress,
            nameIsLocalized: place.nameIsLocalized,
            addressIsLocalized: place.addressIsLocalized,
            category: place.category
        });
    } catch (err) {
        UI.setStatus('searchError');
    } finally {
        UI.setSearchEnabled(true);
    }
}

let searchDebounceTimer = null;
let searchAbortController = null;
let recentTranslationController = null;
let activeNearbyCategory = null;

function cancelSuggestionSearch() {
    clearTimeout(searchDebounceTimer);
    if (searchAbortController) {
        searchAbortController.abort();
        searchAbortController = null;
    }
}

// Hàm chọn 1 địa điểm từ gợi ý hoặc gần đây -> mở Thẻ chi tiết
function selectDestinationPlace(placeOrName, coord, details) {
    if (placeOrName?.translationPending || placeOrName?.isSelectable === false) return;
    activeNearbyCategory = null;
    let name = '';
    let coordinates = coord;
    let placeDetails = details || {};

    if (typeof placeOrName === 'object' && placeOrName !== null) {
        name = placeOrName.name;
        coordinates = placeOrName.coord;
        placeDetails = {
            subtitle: placeOrName.subtitle,
            address: placeOrName.address || placeOrName.subtitle,
            sourceName: placeOrName.sourceName || placeOrName.name,
            sourceAddress: placeOrName.sourceAddress || placeOrName.address || placeOrName.subtitle,
            nameIsLocalized: placeOrName.nameIsLocalized,
            addressIsLocalized: placeOrName.addressIsLocalized,
            category: placeOrName.category
        };
    } else {
        name = placeOrName;
    }

    UI.setSearchValue(name);
    UI.closeSearch();
    setDestination(name, coordinates, placeDetails);
}

// Gọi API gợi ý khi người dùng gõ chữ
async function fetchPlaceSuggestions(query, { nearby = false } = {}) {
    if (searchAbortController) searchAbortController.abort();
    searchAbortController = new AbortController();

    const signal = searchAbortController.signal;
    const center = prevSample ? prevSample.coord : map.getCenter().toArray();
    const lang = UI.getLanguage();
    const limit = nearby ? 10 : 5;
    let places;

    try {
        places = await fetchPhotonSuggestions(query, center, limit, lang, signal);
    } catch (err) {
        if (err.name === 'AbortError') return;
        if (query !== UI.getSearchValue().trim() || lang !== UI.getLanguage()) return;
        UI.showSuggestionMessage('suggestionsError');
        return;
    }

    if (query !== UI.getSearchValue().trim() || lang !== UI.getLanguage()) return;

    if (places.length === 0) {
        UI.showSuggestionMessage('suggestionsNone');
        return;
    }

    if (nearby) {
        places.sort((first, second) => first.distanceMeters - second.distanceMeters);
    }

    if (lang === 'vi') {
        void localizeSuggestionPlaces(places, query, signal);
    } else {
        UI.renderSuggestions(places, selectDestinationPlace);
    }
}

async function fetchPhotonSuggestions(query, center, limit, language, signal) {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${center[1]}&lon=${center[0]}&limit=${limit}&lang=en`;
    const options = { signal, headers: { 'Accept-Language': 'en' } };

    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Photon suggestions failed: HTTP ${res.status}`);
    const data = await res.json();
    const features = Array.isArray(data.features) ? data.features : [];
    return features
        .map((feature) => normalizePhotonSuggestion(feature, query, language, center))
        .filter(Boolean);
}

function createSuggestionPlace(name, coord, address, category, origin, {
    sourceName = name,
    nameIsLocalized = false
} = {}) {
    const distance = getDistanceMeters(origin, coord);
    const sourceAddress = address || 'Vietnam';
    const safeAddress = UI.formatAddress(sourceAddress);
    const distanceText = UI.formatDistance(distance);
    return {
        name,
        sourceName,
        nameIsLocalized,
        coord,
        sourceAddress,
        addressIsLocalized: !address && UI.getLanguage() === 'vi',
        distanceText,
        subtitle: [distanceText, safeAddress].join(' · '),
        address: safeAddress,
        category,
        distanceMeters: distance,
        ...UI.getSuggestionIcon(category)
    };
}

function getCachedPlaceText(place, field) {
    if (field === 'name' && place.nameIsLocalized) return place.name;
    if (field === 'address' && place.addressIsLocalized) return place.sourceAddress;
    return getCachedTranslation(field === 'name' ? place.sourceName : place.sourceAddress);
}

function setVietnamesePlaceDisplay(place, name, address, pending = false) {
    const displayedName = name || (pending
        ? UI.text('translationPendingName')
        : UI.text('translationUnavailableName'));
    const displayedAddress = address
        ? UI.formatAddress(address)
        : pending
            ? UI.text('translationPendingAddress')
            : UI.text('translationUnavailableAddress');

    place.name = displayedName;
    place.address = displayedAddress;
    place.subtitle = [place.distanceText, displayedAddress].filter(Boolean).join(' · ');
    place.translationPending = pending;
    place.isSelectable = Boolean(name);
}

async function resolvePlaceForVietnamese(place, signal) {
    const namePromise = place.nameIsLocalized
        ? Promise.resolve(place.name)
        : translateTextToVietnamese(place.sourceName, signal);
    const addressPromise = place.addressIsLocalized
        ? Promise.resolve(place.sourceAddress)
        : translateTextToVietnamese(place.sourceAddress, signal);
    const [name, address] = await Promise.all([namePromise, addressPromise]);

    setVietnamesePlaceDisplay(place, name, address);
    return place;
}

async function localizeSuggestionPlaces(places, query, signal) {
    places.forEach((place) => {
        const name = getCachedPlaceText(place, 'name');
        const address = getCachedPlaceText(place, 'address');
        const pending = !name || !address;
        setVietnamesePlaceDisplay(place, name, address, pending);
    });
    UI.renderSuggestions(places, selectDestinationPlace);

    for (let index = 0; index < places.length; index += 4) {
        if (signal.aborted) return;
        const batch = places.slice(index, index + 4)
            .filter((place) => place.translationPending);
        try {
            await Promise.all(batch.map((place) => resolvePlaceForVietnamese(place, signal)));
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.warn('Unable to translate place suggestions', error);
        }

        if (signal.aborted || query !== UI.getSearchValue().trim() || UI.getLanguage() !== 'vi') return;
        UI.renderSuggestions(places, selectDestinationPlace);
    }
}

function normalizeNominatimSuggestion(place, query, origin, language = 'vi') {
    const coord = [Number.parseFloat(place.lon), Number.parseFloat(place.lat)];
    if (!coord.every(Number.isFinite)) return null;

    const displayParts = (place.display_name || '').split(',').map((part) => part.trim());
    const localizedName = language === 'vi' ? place.namedetails?.['name:vi'] : '';
    const sourceName = place.name || displayParts[0] || query;
    const name = localizedName ||
        place.namedetails?.[`name:${language}`] ||
        place.namedetails?.name ||
        sourceName;
    const address = displayParts.slice(1).join(', ');
    const category = place.type || place.category || '';
    return createSuggestionPlace(name, coord, address, category, origin, {
        sourceName,
        nameIsLocalized: Boolean(localizedName)
    });
}

function normalizePhotonSuggestion(feature, query, language, origin) {
    const properties = feature.properties || {};
    const coord = feature.geometry?.coordinates;
    if (!Array.isArray(coord) || coord.length < 2 || !coord.every(Number.isFinite)) return null;

    const localizedName = language === 'vi' ? properties['name:vi'] : '';
    const sourceName = properties['name:en'] || properties.name || properties.street || query;
    const name = localizedName || properties[`name:${language}`] || sourceName;
    const category = [
        properties.osm_key,
        properties.osm_value,
        properties.type,
        properties.category
    ].filter(Boolean).join(' ').toLowerCase();
    const address = getLocalizedPhotonAddress(properties, 'en', sourceName);
    return createSuggestionPlace(name, coord, address, category, origin, {
        sourceName,
        nameIsLocalized: Boolean(localizedName)
    });
}

function getLocalizedPhotonValue(properties, key, language) {
    return properties?.[`${key}:${language}`] || properties?.[key] || '';
}

function getLocalizedPhotonAddress(properties, language, name = '') {
    const addressParts = [
        properties.housenumber || properties.house_number,
        getLocalizedPhotonValue(properties, 'street', language),
        getLocalizedPhotonValue(properties, 'district', language),
        getLocalizedPhotonValue(properties, 'city', language) ||
            getLocalizedPhotonValue(properties, 'county', language),
        getLocalizedPhotonValue(properties, 'state', language),
        getLocalizedPhotonValue(properties, 'country', language)
    ];
    return addressParts
        .filter((value, index, parts) => value && value !== name && parts.indexOf(value) === index)
        .join(', ');
}

async function fetchPhotonPropertiesAt(coord) {
    const url = `https://photon.komoot.io/reverse?lon=${coord[0]}&lat=${coord[1]}&lang=en`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) throw new Error(`Photon reverse geocoding failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.features?.[0]?.properties || null;
}

async function refreshSelectedDestinationLanguage(language) {
    const destination = selectedDestination;
    if (!destination) return;

    if (destinationTranslationController) destinationTranslationController.abort();
    const translationController = new AbortController();
    destinationTranslationController = translationController;
    const requestId = ++destinationLanguageRequestId;
    let properties = null;
    const sourceName = destination.sourceName || destination.name;
    const fallbackSourceAddress = destination.sourceAddress || destination.address;
    const cachedName = destination.localizedName ||
        (destination.nameIsLocalized ? destination.name : getCachedTranslation(sourceName));
    const cachedAddress = destination.addressIsLocalized
        ? destination.sourceAddress
        : getCachedTranslation(fallbackSourceAddress);

    if (language === 'vi') {
        destination.name = cachedName || UI.text('translationPendingName');
        destination.address = cachedAddress
            ? UI.formatAddress(cachedAddress)
            : UI.text('translationPendingAddress');
        destination.subtitle = destination.address;
        UI.setSearchValue(destination.name);
        UI.updatePlaceDetailText({
            name: destination.name,
            subtitle: destination.subtitle,
            address: destination.address
        });
    } else {
        destination.name = sourceName;
        destination.address = fallbackSourceAddress;
        destination.subtitle = fallbackSourceAddress;
        UI.setSearchValue(destination.name);
        UI.updatePlaceDetailText({
            name: destination.name,
            subtitle: destination.subtitle,
            address: destination.address
        });
    }

    try {
        try {
            properties = await fetchPhotonPropertiesAt(destination.coord);
        } catch (error) {
            console.warn('Unable to refresh selected place from Photon', error);
        }
        if (requestId !== destinationLanguageRequestId ||
            selectedDestination !== destination || UI.getLanguage() !== language) return;

        const englishName = properties
            ? getLocalizedPhotonValue(properties, 'name', 'en') || sourceName
            : sourceName;
        const addressFromProperties = properties &&
            getLocalizedPhotonAddress(properties, 'en', englishName);
        const englishAddress = addressFromProperties ||
            fallbackSourceAddress;
        destination.sourceName = englishName;
        destination.sourceAddress = englishAddress;
        if (addressFromProperties) destination.addressIsLocalized = false;

        let name;
        let address;
        let subtitle;
        if (language === 'vi') {
            const localizedName = properties?.['name:vi'] || destination.localizedName;
            const [translatedName, translatedAddress] = await Promise.all([
                localizedName
                    ? Promise.resolve(localizedName)
                    : translateTextToVietnamese(englishName, translationController.signal),
                destination.addressIsLocalized
                    ? Promise.resolve(englishAddress)
                    : translateTextToVietnamese(englishAddress, translationController.signal)
            ]);
            if (requestId !== destinationLanguageRequestId ||
                selectedDestination !== destination || UI.getLanguage() !== language) return;
            name = translatedName || UI.text('translationUnavailableName');
            address = translatedAddress
                ? UI.formatAddress(translatedAddress)
                : UI.text('translationUnavailableAddress');
            subtitle = address;
            destination.nameIsLocalized = Boolean(localizedName);
            if (localizedName) destination.localizedName = localizedName;
        } else {
            name = englishName;
            address = englishAddress;
            const subtitleParts = properties ? [
                getLocalizedPhotonValue(properties, 'district', 'en'),
                getLocalizedPhotonValue(properties, 'city', 'en') ||
                    getLocalizedPhotonValue(properties, 'county', 'en'),
                getLocalizedPhotonValue(properties, 'state', 'en')
            ].filter((value, index, parts) =>
                value && value !== name && parts.indexOf(value) === index
            ) : [];
            subtitle = subtitleParts.join(', ') || address;
            destination.nameIsLocalized = false;
        }

        destination.name = name;
        destination.address = address;
        destination.subtitle = subtitle;
        updateStoredPlaceLanguage(destination);
        UI.setSearchValue(name);

        const detailCard = document.getElementById('place-detail-card');
        if (detailCard && !detailCard.hidden) UI.updatePlaceDetailText({ name, subtitle, address });

        refreshRecentPlacesUI();
        if (routeActive && navigationSteps && prevSample) {
            updateNavigationProgress(prevSample.coord);
        } else if (routeActive) {
            const modeKey = activeRouteMode === 'motorbike' ? 'modeMotorbike' : 'modeCar';
            UI.setStatus('routeComplete', { name, modeKey });
        } else {
            UI.setStatus('destination', { name });
        }
    } catch (error) {
        if (requestId === destinationLanguageRequestId && UI.getLanguage() === language) {
            console.warn('Unable to localize selected destination', error);
        }
    } finally {
        if (destinationTranslationController === translationController) {
            destinationTranslationController = null;
        }
    }
}

function searchNearbyCategory(categoryKey) {
    const category = NEARBY_CATEGORIES[categoryKey];
    if (!category) return;

    activeNearbyCategory = categoryKey;
    cancelSuggestionSearch();
    const query = category[UI.getLanguage()];
    UI.setSearchValue(query);
    UI.setNearbyVisible(false);
    UI.setStatus('nearbySearching', { category: UI.text(category.labelKey) });
    UI.showSuggestionMessage('suggestionsLoading');
    fetchPlaceSuggestions(query, { nearby: true });
}

function handleSearchInput(query, immediate) {
    activeNearbyCategory = null;
    clearTimeout(searchDebounceTimer);
    if (searchAbortController) {
        searchAbortController.abort();
        searchAbortController = null;
    }
    if (selectedDestination && query !== selectedDestination.name) {
        resetDestination();
    }

    UI.setNearbyVisible(query.length === 0);
    if (query.length < 2) {
        UI.clearSuggestions();
        return;
    }

    const search = () => {
        UI.showSuggestionMessage('suggestionsLoading');
        fetchPlaceSuggestions(query);
    };

    if (immediate) {
        search();
    } else {
        searchDebounceTimer = setTimeout(search, 350);
    }
}

window.addEventListener('app-languagechange', (event) => {
    const language = event.detail?.language || UI.getLanguage();
    UI.customizeMapLabels(map);
    if (UI.isSuggestionsVisible()) {
        if (activeNearbyCategory) {
            searchNearbyCategory(activeNearbyCategory);
        } else {
            handleSearchInput(UI.getSearchValue().trim(), true);
        }
    }
    if (routeActive && navigationSteps && prevSample) {
        updateNavigationProgress(prevSample.coord);
    }
    if (selectedDestination) {
        refreshSelectedDestinationLanguage(language);
    }
    refreshRecentPlacesUI();
});

function endJourney({ arrived = false } = {}) {
    navigationSteps = null;
    activeStepIndex = 0;
    currentManeuverData = null;
    UI.hideTurnBanner();
    UI.closePlaceDetail();
    UI.closeSearch();
    resetDestination({ clearSearch: true });
    currentBearing = 0;
    puckHeading = 0;
    UI.rotatePuck(0, 0, 0);
    map.setPadding({ top: 65, right: 0, bottom: 150, left: 0 });
    map.easeTo({
        center: userMarker.getLngLat().toArray(),
        bearing: 0,
        pitch: is3D ? 60 : 0,
        zoom: 16,
        duration: 650
    });
    if (arrived) UI.setStatus('arrivedMessage');
}

// Phân tích hành động rẽ từ maneuver OSRM
function resolveManeuver(step, destinationName) {
    const maneuver = step.maneuver || {};
    const type = (maneuver.type || '').toLowerCase();
    const modifier = (maneuver.modifier || '').toLowerCase();
    let street = step.name || '';

    let iconKey = 'straight';
    let actionKey = 'maneuverStraight';
    let prepType = 'on';

    if (type === 'arrive') {
        iconKey = 'arrive';
        actionKey = 'maneuverArrive';
        prepType = 'at';
        if (!street && destinationName) street = destinationName;
    } else if (type === 'depart') {
        iconKey = 'depart';
        actionKey = 'maneuverDepart';
        prepType = 'on';
    } else if (type.includes('roundabout') || type.includes('rotary')) {
        iconKey = 'roundabout';
        actionKey = 'maneuverRoundabout';
        prepType = 'onto';
    } else if (modifier === 'uturn') {
        iconKey = 'uturn';
        actionKey = 'maneuverUturn';
        prepType = 'on';
    } else if (modifier === 'sharp left') {
        iconKey = 'sharpLeft';
        actionKey = 'maneuverSharpLeft';
        prepType = 'onto';
    } else if (modifier === 'left') {
        iconKey = 'turnLeft';
        actionKey = 'maneuverTurnLeft';
        prepType = 'onto';
    } else if (modifier === 'slight left') {
        iconKey = 'slightLeft';
        actionKey = 'maneuverSlightLeft';
        prepType = 'onto';
    } else if (modifier === 'sharp right') {
        iconKey = 'sharpRight';
        actionKey = 'maneuverSharpRight';
        prepType = 'onto';
    } else if (modifier === 'right') {
        iconKey = 'turnRight';
        actionKey = 'maneuverTurnRight';
        prepType = 'onto';
    } else if (modifier === 'slight right') {
        iconKey = 'slightRight';
        actionKey = 'maneuverSlightRight';
        prepType = 'onto';
    } else if (modifier === 'straight' || type === 'continue' || type === 'new name') {
        iconKey = 'straight';
        actionKey = 'maneuverStraight';
        prepType = 'on';
    } else {
        iconKey = 'straight';
        actionKey = 'maneuverContinue';
        prepType = 'on';
    }

    return { iconKey, actionKey, street, prepType };
}

function getRouteStreetKey(step, language) {
    const location = step?.maneuver?.location;
    if (!step?.name || !Array.isArray(location) || location.length < 2 ||
        !location.every(Number.isFinite)) return '';
    return `${language}:${location[0].toFixed(5)},${location[1].toFixed(5)}:${step.name}`;
}

async function localizeRouteStreet(step, language, key) {
    if (!key || localizedRouteStreets.has(key) || pendingRouteStreetLocalizations.has(key)) return;
    const location = step.maneuver.location;
    pendingRouteStreetLocalizations.add(key);

    try {
        const properties = await fetchPhotonPropertiesAt(location);
        const localizedStreet = properties && (
            properties[`street:${language}`] ||
            properties.street ||
            properties[`name:${language}`] ||
            properties.name
        );
        const street = localizedStreet || step.name;
        localizedRouteStreets.set(key, street);

        const activeStep = navigationSteps && navigationSteps[activeStepIndex];
        if (routeActive && UI.getLanguage() === language &&
            currentManeuverData && getRouteStreetKey(activeStep, language) === key) {
            currentManeuverData.street = street;
            UI.setTurnBanner(currentManeuverData);
        }
    } catch (error) {
        localizedRouteStreets.set(key, step.name);
        console.warn('Unable to localize route street name', error);
    } finally {
        pendingRouteStreetLocalizations.delete(key);
    }
}

// Cập nhật khoảng cách, cảnh báo rẽ và tự chuyển bước khi xe đi qua điểm rẽ
function updateNavigationProgress(currentCoord) {
    if (!routeActive || !navigationSteps || navigationSteps.length === 0) return;

    const vehicleMode = activeRouteMode || puckMode || 'motorbike';
    const isMotorbike = vehicleMode === 'motorbike';
    const earlyThreshold = isMotorbike ? 150 : 250;
    const immediateThreshold = isMotorbike ? 35 : 55;
    const passThreshold = isMotorbike ? 22 : 38;
    const cornerThreshold = isMotorbike ? 45 : 75;

    // Tự chuyển sang bước rẽ kế tiếp sau khi đi qua điểm rẽ
    while (activeStepIndex < navigationSteps.length - 1) {
        const targetLoc = navigationSteps[activeStepIndex].maneuver?.location;
        if (!targetLoc) break;
        const distToTarget = getDistanceMeters(currentCoord, targetLoc);
        const nextLoc = navigationSteps[activeStepIndex + 1].maneuver?.location;
        if (!nextLoc) break;
        const distToNext = getDistanceMeters(currentCoord, nextLoc);
        const legDist = getDistanceMeters(targetLoc, nextLoc);

        if (distToTarget <= passThreshold || (distToTarget <= cornerThreshold && distToNext < legDist)) {
            activeStepIndex++;
        } else {
            break;
        }
    }

    const step = navigationSteps[activeStepIndex];
    if (!step) return;

    const targetLoc = step.maneuver?.location || (selectedDestination ? selectedDestination.coord : currentCoord);
    const rawDist = getDistanceMeters(currentCoord, targetLoc);
    const isArrivalStep = activeStepIndex === navigationSteps.length - 1 || step.maneuver?.type === 'arrive';
    const isArrived = isArrivalStep && rawDist <= (isMotorbike ? 20 : 30);
    const distanceMeters = isArrived ? 0 : rawDist;

    let warningLevel = 'normal';
    if (isArrived) {
        warningLevel = 'arrived';
    } else if (distanceMeters <= immediateThreshold) {
        warningLevel = 'imminent';
    } else if (distanceMeters <= earlyThreshold) {
        warningLevel = 'early';
    }

    const destinationName = selectedDestination ? selectedDestination.name : '';
    const resolved = resolveManeuver(step, destinationName);
    const language = UI.getLanguage();
    const streetKey = getRouteStreetKey(step, language);
    if (streetKey && localizedRouteStreets.has(streetKey)) {
        resolved.street = localizedRouteStreets.get(streetKey);
    }
    const nextStep = navigationSteps[activeStepIndex + 1];
    const nextResolved = nextStep ? resolveManeuver(nextStep, destinationName) : null;
    const nextStreetKey = nextStep ? getRouteStreetKey(nextStep, language) : '';
    if (nextStreetKey && localizedRouteStreets.has(nextStreetKey)) {
        nextResolved.street = localizedRouteStreets.get(nextStreetKey);
    }

    currentManeuverData = {
        iconKey: resolved.iconKey,
        actionKey: resolved.actionKey,
        street: resolved.street,
        prepType: resolved.prepType,
        distanceMeters,
        warningLevel,
        isArrived,
        destinationName,
        vehicleMode,
        nextActionKey: nextResolved?.actionKey || '',
        nextStreet: nextResolved?.street || '',
        nextPrepType: nextResolved?.prepType || 'on'
    };

    UI.setTurnBanner(currentManeuverData);
    if (streetKey) void localizeRouteStreet(step, language, streetKey);
    if (nextStreetKey) void localizeRouteStreet(nextStep, language, nextStreetKey);

    const activeModeKey = vehicleMode === 'motorbike' ? 'modeMotorbike' : 'modeCar';
    if (isArrived) {
        UI.setStatus('arrivedMessage');
    } else if (warningLevel === 'imminent') {
        UI.setStatus('statusTurnImminent', {
            action: UI.text(resolved.actionKey),
            distance: UI.formatDistance(distanceMeters)
        });
    } else if (warningLevel === 'early') {
        UI.setStatus('statusTurnEarly', {
            action: UI.text(resolved.actionKey),
            distance: UI.formatDistance(distanceMeters)
        });
    } else {
        UI.setStatus('routeComplete', {
            name: destinationName,
            modeKey: activeModeKey
        });
    }

    updateNavigationHud(currentCoord);
    if (isArrived) {
        endJourney({ arrived: true });
        return;
    }

}

async function recalculateActiveRoute(currentCoord) {
    if (!isNavigating || !routeActive || !selectedDestination || rerouteInProgress ||
        Date.now() - lastRerouteAt < 8000) return;

    rerouteInProgress = true;
    lastRerouteAt = Date.now();
    const destination = selectedDestination;
    const requestId = ++routeRequestId;
    const modeKey = activeRouteMode === 'motorbike' ? 'modeMotorbike' : 'modeCar';
    UI.setStatus('routeRecalculating', { name: destination.name, modeKey });

    try {
        const route = await requestOsrmRoute(currentCoord, destination.coord);
        if (requestId !== routeRequestId || !isNavigating || selectedDestination !== destination) return;
        if (!route) {
            UI.setStatus('routeNotFound');
            return;
        }

        drawRouteLayer({
            type: 'Feature',
            properties: { vehicleMode: activeRouteMode },
            geometry: route.geometry
        });
        navigationSteps = route.legs?.[0]?.steps || [];
        activeStepIndex = navigationSteps.length > 1 ? 1 : 0;
        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.max(1, Math.round(route.duration / 60));
        UI.setRouteInfo('routeSummary', { km, mins });

        if (navigationSteps.length) {
            updateNavigationProgress(currentCoord);
        } else {
            UI.setNavigationMetrics({
                speedKmh: smoothedSpeed,
                remainingDistanceMeters: route.distance,
                remainingSeconds: route.duration,
                arrivalTime: Date.now() + route.duration * 1000
            });
        }
    } catch (error) {
        if (requestId === routeRequestId && isNavigating) {
            console.error('Unable to recalculate the active route', error);
            UI.setStatus('routeError');
        }
    } finally {
        rerouteInProgress = false;
    }
}

// 5. Start/End: quản lý lộ trình OSRM từ vị trí hiện tại đến điểm đã chọn
async function runRouteToDestination() {
    if (routeActive) {
        endJourney();
        return;
    }
    if (!selectedDestination) {
        UI.setStatus('routeSearchRequired');
        return;
    }
    if (puckMode !== 'motorbike' && puckMode !== 'car') {
        UI.setStatus('vehicleRequired');
        return;
    }

    const destination = selectedDestination;
    const routeMode = puckMode;
    const requestId = ++routeRequestId;
    const startCoord = prevSample
        ? prevSample.coord
        : userMarker.getLngLat().toArray();
    const endCoord = destination.coord;
    const language = UI.getLanguage();

    const modeKey = routeMode === 'motorbike' ? 'modeMotorbike' : 'modeCar';
    UI.setStatus('routeLoading', { name: destination.name, modeKey });
    UI.setRunEnabled(false);
    UI.setRoutePending(true);
    UI.setNearbyVisible(false);

    try {
        const route = await requestOsrmRoute(startCoord, endCoord, language);
        if (requestId !== routeRequestId || selectedDestination !== destination) return;
        if (!route) {
            UI.setStatus('routeNotFound');
            return;
        }

        const routeGeoJSON = {
            type: 'Feature',
            properties: { vehicleMode: routeMode },
            geometry: route.geometry
        };

        drawRouteLayer(routeGeoJSON);
        routeActive = true;
        activeRouteMode = routeMode;
        UI.setRouteActive(true);
        isNavigating = true;
        isCameraFollowing = true;
        followUser = true;
        UI.setNavigationActive(true);
        UI.setCameraFollowing(true);
        UI.setRecenterActive(true);
        UI.setSpeedVisible(true);
        UI.setNearbyVisible(false);
        map.setPadding({ top: 125, right: 0, bottom: 105, left: 0 });
        void acquireNavigationWakeLock();
        sendEspHudState(true);

        const km = (route.distance / 1000).toFixed(1);
        const mins = Math.max(1, Math.round(route.duration / 60));
        UI.setRouteInfo('routeSummary', { km, mins });

        navigationSteps = route.legs?.[0]?.steps || [];
        if (navigationSteps.length > 0) {
            activeStepIndex = navigationSteps.length > 1 ? 1 : 0;
            updateNavigationProgress(startCoord);
        } else {
            activeStepIndex = 0;
            UI.setNavigationMetrics({
                speedKmh: smoothedSpeed,
                remainingDistanceMeters: route.distance,
                remainingSeconds: route.duration,
                arrivalTime: Date.now() + route.duration * 1000
            });
        }

        if (isNavigating) {
            map.easeTo({
                center: prevSample ? prevSample.coord : startCoord,
                zoom: 18.8,
                pitch: is3D ? 60 : 0,
                bearing: currentBearing,
                duration: 900
            });
        }
    } catch (err) {
        if (requestId === routeRequestId) UI.setStatus('routeError');
    } finally {
        UI.setRoutePending(false);
        UI.setRunEnabled(routeActive || Boolean(selectedDestination && puckMode !== 'pointer'));
    }
}

// 6. Xử lý GPS thực tế + lọc trễ nhịp + tốc độ
function calculateBearing(start, end) {
    const toRad = d => d * Math.PI / 180;
    const dLng = toRad(end[0] - start[0]);
    const lat1 = toRad(start[1]), lat2 = toRad(end[1]);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function lerpAngle(start, end, amt) {
    let diff = end - start;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    return start + diff * amt;
}

function getDistanceMeters(p1, p2) {
    const R = 6371000;
    const dLat = (p2[1] - p1[1]) * Math.PI / 180;
    const dLng = (p2[0] - p1[0]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getDistanceToRouteMeters(point, coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return Infinity;
    const latScale = 110540;
    const lngScale = 111320 * Math.cos(point[1] * Math.PI / 180);
    let minimum = Infinity;

    for (let index = 0; index < coordinates.length - 1; index++) {
        const start = coordinates[index];
        const end = coordinates[index + 1];
        const ax = (start[0] - point[0]) * lngScale;
        const ay = (start[1] - point[1]) * latScale;
        const dx = (end[0] - start[0]) * lngScale;
        const dy = (end[1] - start[1]) * latScale;
        const lengthSquared = dx * dx + dy * dy;
        const projection = lengthSquared === 0
            ? 0
            : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
        minimum = Math.min(minimum, Math.hypot(ax + projection * dx, ay + projection * dy));
    }

    return minimum;
}

function getRemainingRouteMetrics(currentCoord) {
    if (!navigationSteps?.length || !selectedDestination) {
        const remainingDistanceMeters = selectedDestination
            ? getDistanceMeters(currentCoord, selectedDestination.coord)
            : 0;
        const speedMetersPerSecond = Math.max(3, smoothedSpeed / 3.6);
        return {
            remainingDistanceMeters,
            remainingSeconds: remainingDistanceMeters / speedMetersPerSecond
        };
    }

    const step = navigationSteps[activeStepIndex];
    const target = step?.maneuver?.location || selectedDestination.coord;
    const distanceToTarget = getDistanceMeters(currentCoord, target);
    const stepDistance = Math.max(0, Number(step?.distance) || 0);
    const stepDuration = Math.max(0, Number(step?.duration) || 0);
    let remainingDistanceMeters = distanceToTarget;
    let remainingSeconds = stepDistance > 0
        ? stepDuration * Math.min(1, distanceToTarget / stepDistance)
        : 0;

    for (let index = activeStepIndex + 1; index < navigationSteps.length; index++) {
        remainingDistanceMeters += Math.max(0, Number(navigationSteps[index].distance) || 0);
        remainingSeconds += Math.max(0, Number(navigationSteps[index].duration) || 0);
    }

    if (remainingSeconds <= 0 && remainingDistanceMeters > 0) {
        remainingSeconds = remainingDistanceMeters / Math.max(3, smoothedSpeed / 3.6);
    }
    return { remainingDistanceMeters, remainingSeconds };
}

async function requestOsrmRoute(startCoord, endCoord, language = UI.getLanguage()) {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url, { headers: { 'Accept-Language': language } });
    if (!res.ok) throw new Error(`OSRM route failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.routes?.[0] || null;
}

function updateNavigationHud(currentCoord) {
    if (!isNavigating) return;
    const { remainingDistanceMeters, remainingSeconds } = getRemainingRouteMetrics(currentCoord);
    UI.setNavigationMetrics({
        speedKmh: smoothedSpeed,
        remainingDistanceMeters,
        remainingSeconds,
        arrivalTime: Date.now() + remainingSeconds * 1000
    });
}

function maybeRecalculateOffRoute(currentCoord, accuracy) {
    if (!Number.isFinite(accuracy) || accuracy > 35) return;
    const routeCoordinates = currentRouteGeoJSON?.geometry?.coordinates;
    if (isNavigating && getDistanceToRouteMeters(currentCoord, routeCoordinates) > 45) {
        void recalculateActiveRoute(currentCoord);
    }
}

async function acquireNavigationWakeLock() {
    if (!navigator.wakeLock?.request) return;
    try {
        const lock = await navigator.wakeLock.request('screen');
        if (!isNavigating) {
            await lock.release();
            return;
        }
        navigationWakeLock = lock;
        lock.addEventListener('release', () => {
            if (navigationWakeLock === lock) navigationWakeLock = null;
        }, { once: true });
    } catch (error) {
        console.warn('Screen Wake Lock is unavailable', error);
    }
}

function releaseNavigationWakeLock() {
    const lock = navigationWakeLock;
    navigationWakeLock = null;
    if (!lock) return;
    try {
        void Promise.resolve(lock.release()).catch((error) => {
            console.warn('Unable to release Screen Wake Lock', error);
        });
    } catch (error) {
        console.warn('Unable to release Screen Wake Lock', error);
    }
}

function sendEspHudState(active) {
    const bridge = window.EspHudBridge;
    if (!bridge) return;
    if (typeof bridge.postMessage !== 'function') {
        console.warn('EspHudBridge.postMessage is unavailable');
        return;
    }
    try {
        bridge.postMessage(JSON.stringify({ active: Boolean(active) }));
    } catch (error) {
        console.error('Unable to send navigation state to EspHudBridge', error);
    }
}

document.addEventListener('visibilitychange', () => {
    if (isNavigating && document.visibilityState === 'visible' && !navigationWakeLock) {
        void acquireNavigationWakeLock();
    }
});

function startGPS() {
    if (watchId !== null) return;
    if (!('geolocation' in navigator)) {
        UI.setStatus('gpsUnsupported');
        return;
    }
    UI.setGpsRunning(true);
    UI.setStatus('gpsStarting');
    followUser = true;
    UI.setRecenterActive(true);
    prevSample = null;
    smoothedSpeed = 0;
    UI.setSpeedVisible(routeActive);

    try {
        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, speed, heading, accuracy } = pos.coords;
                const pt = [longitude, latitude];
                const dtSec = prevSample ? (pos.timestamp - prevSample.time) / 1000 : 0;
                const distM = prevSample ? getDistanceMeters(prevSample.coord, pt) : 0;
                const isStaleGap = prevSample !== null && dtSec > 3.5;

                UI.setGpsActive(true);
                if (!selectedDestination) {
                    UI.setRouteInfo('accuracy', { meters: Math.round(accuracy) });
                }

                let rawKmh = 0;
                if (isStaleGap || accuracy > 35) {
                    rawKmh = 0;
                    if (!selectedDestination) {
                        UI.setStatus(isStaleGap ? 'gpsStale' : 'gpsWeak');
                    }
                } else {
                    if (!selectedDestination) {
                        UI.setStatus('gpsActive');
                    }
                    if (typeof speed === 'number' && !Number.isNaN(speed) && speed >= 0) {
                        rawKmh = speed * 3.6;
                    } else if (prevSample && dtSec >= 0.8 && accuracy <= 25 && distM > Math.max(4, accuracy * 0.7)) {
                        rawKmh = (distM / dtSec) * 3.6;
                    }
                }

                smoothedSpeed = rawKmh < 2.5 ? 0 : (smoothedSpeed === 0 ? rawKmh : smoothedSpeed + 0.35 * (rawKmh - smoothedSpeed));
                UI.setSpeed(smoothedSpeed < 2.5 ? 0 : Math.round(smoothedSpeed));
                UI.setSpeedVisible(routeActive || smoothedSpeed >= 2.5);

                let targetBearing = null;
                if (!isStaleGap && accuracy <= 35 && rawKmh >= 3) {
                    if (typeof heading === 'number' && !Number.isNaN(heading)) {
                        targetBearing = heading;
                    } else if (prevSample && distM > 6 && accuracy <= 25) {
                        targetBearing = calculateBearing(prevSample.coord, pt);
                    }
                }

                if (targetBearing !== null) {
                    currentBearing = lerpAngle(currentBearing, targetBearing, 0.25);
                    puckHeading = lerpAngle(puckHeading, targetBearing, 0.25);
                }
                UI.rotatePuck(puckHeading, map.getBearing(), map.getPitch());

                userMarker.setLngLat(pt);

                // Cập nhật dẫn đường theo vị trí GPS thực tế
                if (routeActive && navigationSteps?.length) {
                    updateNavigationProgress(pt);
                } else if (isNavigating) {
                    updateNavigationHud(pt);
                    if (selectedDestination && getDistanceMeters(pt, selectedDestination.coord) <= 25) {
                        endJourney({ arrived: true });
                    }
                }
                if (isNavigating && !isStaleGap) maybeRecalculateOffRoute(pt, accuracy);

                if (isNavigating && isCameraFollowing && accuracy <= 100) {
                    map.easeTo({
                        center: pt,
                        bearing: currentBearing,
                        zoom: 18.8,
                        pitch: is3D ? 60 : 0,
                        duration: 450
                    });
                } else if (!isNavigating && followUser && accuracy <= 100) {
                    map.jumpTo({ center: pt, bearing: currentBearing });
                }

                prevSample = { coord: pt, time: pos.timestamp };
            },
            (err) => {
                UI.setGpsActive(false);
                UI.setStatus('gpsError', { message: err.message });
                if (err.code === 1) {
                    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                    UI.setGpsRunning(false);
                }
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
    } catch (err) {
        watchId = null;
        UI.setGpsRunning(false);
        UI.setStatus('gpsStartError', { message: err.message });
    }
}

function stopGPS() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    UI.setGpsRunning(false);
    UI.setGpsActive(false);
    if (selectedDestination) {
        UI.setStatus('destination', { name: selectedDestination.name });
    } else {
        UI.setStatus('gpsStopped');
    }
    UI.setSpeed(0);
    smoothedSpeed = 0;
    UI.setSpeedVisible(routeActive);
    prevSample = null;
}

map.on('style.load', () => {
    UI.resetMapStyle();
    UI.customizeMapLabels(map);
    if (currentRouteGeoJSON) {
        drawRouteLayer(currentRouteGeoJSON);
    }
});

UI.setStatus('ready');
UI.setRouteInfo('accuracyEmpty');
UI.setPuckMode(puckMode);
UI.set3DActive(is3D);
UI.setDestinationReady(false);
UI.setRouteActive(false);
UI.setRunEnabled(false);
UI.setSpeedVisible(false);

UI.bindSearch({
    onInput: handleSearchInput,
    onSubmit: searchPlace,
    onNearbyCategory: searchNearbyCategory,
    onClose: cancelSuggestionSearch
});

function recenterMap() {
    followUser = true;
    if (isNavigating) {
        isCameraFollowing = true;
        UI.setCameraFollowing(true);
        UI.setRecenterActive(true);
        const target = prevSample ? prevSample.coord : userMarker.getLngLat().toArray();
        map.easeTo({
            center: target,
            zoom: 18.8,
            bearing: currentBearing,
            pitch: is3D ? 60 : 0,
            duration: 650
        });
        return;
    }
    UI.setRecenterActive(true);
    const target = prevSample ? prevSample.coord : userMarker.getLngLat().toArray();
    map.easeTo({ center: target, zoom: 16, bearing: currentBearing, duration: 450 });
}

UI.bindControls({
    onTheme: () => {
        isLightMode = UI.toggleLightMode(map, STYLES);
        UI.setStatus(isLightMode ? 'themeLight' : 'themeDark');
    },
    on3D: () => {
        is3D = !is3D;
        localStorage.setItem('gps_view_mode', is3D ? '3d' : '2d');
        UI.set3DActive(is3D);
        map.easeTo({ pitch: is3D ? 60 : 0, duration: 450 });
    },
    onNorth: () => {
        currentBearing = 0;
        map.easeTo({ bearing: 0, duration: 350 });
    },
    onPuckMode: (mode) => {
        if (!PUCK_MODES.has(mode) || mode === 'pointer') {
            throw new RangeError(`Unsupported Puck mode: ${mode}`);
        }
        puckMode = mode;
        preferredVehicleMode = mode;
        UI.setPuckMode(puckMode);
        localStorage.setItem('gps_puck_mode', puckMode);
        UI.setRunEnabled(Boolean(selectedDestination) && !routeActive);
        if (selectedDestination && !routeActive) {
            fetchRoutePreview(selectedDestination.coord);
        }
    },
    onRecenter: () => recenterMap(),
    onRun: runRouteToDestination,
    onEndTrip: () => endJourney(),
    onGPS: () => watchId === null ? startGPS() : stopGPS(),
    onTurnBannerClick: () => {
        if (navigationSteps && activeStepIndex < navigationSteps.length) {
            const targetLoc = navigationSteps[activeStepIndex].maneuver?.location;
            if (targetLoc) {
                map.flyTo({ center: targetLoc, zoom: 17, duration: 600 });
                followUser = false;
                if (isNavigating) isCameraFollowing = false;
                UI.setCameraFollowing(false);
                UI.setRecenterActive(false);
            }
        }
    }
});

// Kết nối các sự kiện trên Thẻ chi tiết địa điểm
UI.bindPlaceDetailEvents({
    onClose: () => {
        resetDestination({ clearSearch: true });
    },
    onRoute: () => {
        if (puckMode === 'pointer') {
            const defaultMode = preferredVehicleMode || 'motorbike';
            puckMode = defaultMode;
            preferredVehicleMode = defaultMode;
            UI.setPuckMode(defaultMode);
            localStorage.setItem('gps_puck_mode', defaultMode);
            UI.setRunEnabled(true);
        }
        runRouteToDestination();
    },
    onSave: () => {
        if (selectedDestination) {
            toggleSavePlace(selectedDestination);
        }
    },
    onShare: () => {
        if (selectedDestination) {
            shareCoordinates(selectedDestination);
        }
    },
    onClearRecent: () => {
        clearRecentPlaces();
    }
});

map.once('load', () => {
    map.setPadding({ bottom: 150, top: 65 });
    startGPS();
    refreshRecentPlacesUI();
});
