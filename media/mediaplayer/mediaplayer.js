let selectedProvider = 'vidlink';

async function getApiKey() {
    try {
        const response = await fetch('apis/config.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json().then(config => config.apiKey);
    } catch (error) {
        console.error('Failed to fetch API key:', error);
        return null;
    }
}

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        throw error;
    }
}


function promptUserForLanguage(languages) {
    return new Promise((resolve, reject) => {
        // Create modal elements
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content bg-gray-900 rounded-lg p-6';

        const modalTitle = document.createElement('h2');
        modalTitle.className = 'text-xl font-bold mb-4 text-white';
        modalTitle.innerText = 'Select a Language';

        const languageList = document.createElement('ul');
        languageList.className = 'language-list';

        languages.forEach(language => {
            const listItem = document.createElement('li');
            listItem.className = 'language-item cursor-pointer hover:bg-gray-700 p-2 rounded text-white';
            listItem.innerText = language;
            listItem.addEventListener('click', () => {
                // Remove modal
                document.body.removeChild(modalOverlay);
                resolve(language);
            });
            languageList.appendChild(listItem);
        });

        // Append elements
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(languageList);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
    });
}


async function getMovieEmbedUrl(mediaId, provider, apiKey, language=null) {
    const primaryColor = '#FFFFFF';
    const secondaryColor = '#FFFFFF';
    const iconColor = '#FFFFFF';

    switch (provider) {
        case 'vidsrc':
            return `https://vidsrc.cc/v3/embed/movie/${mediaId}?autoPlay=true`;
        case 'vidsrc2':
            return `https://vidsrc2.to/embed/movie/${mediaId}`;
            case 'filmxy':
            try {
                if (!language) {
                    throw new Error('Language is required for filmxy provider');
                }

                const languageCode = language.toLowerCase();
                const url = `https://cinescrape.com/global/${languageCode}/${mediaId}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                const m3u8Link = data.streamData.data.link;
                if (!m3u8Link) throw new Error('No m3u8 link found');
                return m3u8Link;
            } catch (error) {
                console.error('Error fetching video from filmxy:', error);
                throw error;
            }

            
        case 'vidsrcxyz':
            return `https://vidsrc.xyz/embed/movie/${mediaId}`;
        case 'embedsoap':
            return `https://www.embedsoap.com/embed/movie/?id=${mediaId}`;
        case 'autoembed':
            return `https://player.autoembed.cc/embed/movie/${mediaId}`;
        case 'smashystream':
            return `https://player.smashy.stream/movie/${mediaId}`;
        case 'anime':
            return `https://anime.autoembed.cc/embed/${mediaId}-episode-1`;
        case '2animesub':
            return `https://2anime.xyz/embed/${mediaId}-episode-1`;
        case '2embed':
            return `https://www.2embed.cc/embed/${mediaId}`;
        case 'nontonGo':
            return `https://www.NontonGo.win/embed/movie/${mediaId}`;
        case 'AdminHiHi':
            const movieSlug = mediaId.replace(/\s+/g, '-');
            return `https://embed.anicdn.top/v/${movieSlug}-dub/1.html`;
        case 'vidlink':
            return `https://vidlink.pro/movie/${mediaId}?primaryColor=${primaryColor}&secondaryColor=${secondaryColor}&iconColor=${iconColor}&autoplay=false`;
        case 'vidlinkdub':
            return `https://vidlink.pro/movie/${mediaId}?player=jw&multiLang=true&primaryColor=${primaryColor}&secondaryColor=${secondaryColor}&iconColor=${iconColor}`;
        case 'vidsrcnl':
            return `https://player.vidsrc.nl/embed/movie/${mediaId}`;
        case 'vidsrc.rip':
            return `https://vidsrc.rip/embed/movie/${mediaId}`;
        case 'vidbinge':
            return `https://vidbinge.dev/embed/movie/${mediaId}`;
        case 'moviesapi':
            return `https://moviesapi.club/movie/${mediaId}`;
        case 'moviee':
            return `https://moviee.tv/embed/movie/${mediaId}`;
        case 'multiembed':
            return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1`;
        case 'embedsu':
            return `https://embed.su/embed/movie/${mediaId}`;
        case 'multiembedvip':
            return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1`;
        case 'vidsrcicu':
            return `https://vidsrc.icu/embed/movie/${mediaId}`;
        case 'cinescrape':
            try {
                const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
                await new Promise(resolve => setTimeout(resolve, randomDelay)); 
                const response = await fetch(`https://cinescrape.com/movie/${mediaId}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                const videoData = data.data[0] || null;

                if (!videoData || !videoData.quality_list) throw new Error('No video data available');
                const qualityOrder = ['4K', '1080P', '720P', '360P'];
                let selectedSource = null;

                for (let quality of qualityOrder) {
                    for (let video of data.data) {
                        selectedSource = video.quality_list.find(source => source.quality === quality);
                        if (selectedSource) break;
                    }
                    if (selectedSource) break;
                }

                if (!selectedSource) throw new Error('No suitable video source found');

                let videoUrl = selectedSource.download_url;
                const urlObj = new URL(videoUrl);
                urlObj.protocol = 'https:';
                urlObj.hostname = 'mp4.febbox.net';
                videoUrl = urlObj.toString();

                return videoUrl;
            } catch (error) {
                console.error('Error fetching video from Cinescrape:', error);
                throw error;
            }
            case 'trailer':
            try {
                const trailerUrl = await fetchTrailer(mediaId, 'movie', apiKey);
                if (!trailerUrl) throw new Error('Trailer not found');
                return trailerUrl;
            } catch (error) {
                console.error('Error fetching trailer for movie:', error);
                throw error;
            }

        default:
            throw new Error('Provider not recognized.');
    }
}

// Define loading messages
const loadingMessages = [
    { message: "Contacting server...", icon: "<i class='fas fa-satellite'></i>" },
    { message: "Fetching data...", icon: "<i class='fas fa-download'></i>" },
    { message: "URL received...", icon: "<i class='fas fa-link'></i>" },
    { message: "Parsing data...", icon: "<i class='fas fa-search'></i>" },
    { message: "Streaming in 4K HDR...", icon: "<i class='fas fa-tv'></i>" },
    { message: "Almost ready...", icon: "<i class='fas fa-hourglass-half'></i>" }
];

// Function to show loading screen and initiate progress
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressBar = document.getElementById('progressBar');
    const loadingMessage = document.getElementById('loadingMessage');

    let currentProgress = 0;
    loadingScreen.classList.remove('hidden');

    // Interval to simulate loading progress and change messages
    const interval = setInterval(() => {
        if (currentProgress >= 100) {
            clearInterval(interval);
            loadingScreen.classList.add('hidden');
        } else {
            currentProgress += Math.floor(Math.random() * 15) + 5;
            progressBar.style.width = `${currentProgress}%`;
            const messageIndex = Math.min(Math.floor(currentProgress / 20), loadingMessages.length - 1);
            loadingMessage.innerHTML = `${loadingMessages[messageIndex].icon} ${loadingMessages[messageIndex].message}`;
        }
    }, 2000);
}
// Function to hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.classList.add("hidden");
}

async function getTvEmbedUrl(mediaId, seasonId, episodeId, provider, apiKey) {
    const primaryColor = '#FFFFFF';
    const secondaryColor = '#FFFFFF';
    const iconColor = '#ffffff';

    switch (provider) {
        case 'vidsrc':
            return `https://vidsrc.cc/v3/embed/tv/${mediaId}/${seasonId}/${episodeId}?autoPlay=true&autoNext=true`;
        case 'vidsrcpro':
            return `https://vidsrc.pro/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'vidsrc2':
            return `https://vidsrc2.to/embed/tv/${mediaId}?season=${seasonId}&episode=${episodeId}`;
        case 'vidsrcxyz':
            return `https://vidsrc.xyz/embed/tv/${mediaId}?season=${seasonId}&episode=${episodeId}`;
        case 'embedsoap':
            return `https://www.embedsoap.com/embed/tv/?id=${mediaId}&s=${seasonId}&e=${episodeId}`;
        case 'autoembed':
            return `https://player.autoembed.cc/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'smashystream':
            return `https://player.smashy.stream/tv/${mediaId}?s=${seasonId}&e=${episodeId}`;
        case 'anime':
            return `https://anime.autoembed.cc/embed/${media.name.replace(/\s+/g, '-').toLowerCase()}-episode-${episodeId}`;
        case 'nontonGo':
            return `https://www.NontonGo.win/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'nontonGoAlt':
            return `https://www.NontonGo.win/embed/tv/?id=${mediaId}&s=${seasonId}&e=${episodeId}`;
        case '2animesub':
            return `https://2anime.xyz/embed/${media.name.replace(/\s+/g, '-').toLowerCase()}-episode-${episodeId}`;
        case '2embed':
            return `https://www.2embed.skin/embedtv/${mediaId}&s=${seasonId}&e=${episodeId}`;
        case 'AdminHiHi':
            const tvSlug = media.name.replace(/\s+/g, '-');
            return `https://embed.anicdn.top/v/${tvSlug}-dub/${episodeId}.html`;
        case 'moviesapi':
            return `https://moviesapi.club/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'vidlink':
            return `https://vidlink.pro/tv/${mediaId}/${seasonId}/${episodeId}?primaryColor=${primaryColor}&secondaryColor=${secondaryColor}&iconColor=${iconColor}&nextbutton=true&autoplay=false`;
        case 'vidlinkdub':
            return `https://vidlink.pro/tv/${mediaId}/${seasonId}/${episodeId}?player=jw&multiLang=true`;
        case 'vidsrcnl':
            return `https://player.vidsrc.nl/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'vidsrc.rip':
            return `https://vidsrc.rip/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'vidbinge':
            return `https://vidbinge.dev/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'moviee':
            return `https://moviee.tv/embed/tv/${mediaId}?seasion=${seasonId}&episode=${episodeId}`;
        case 'multiembed':
            return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${seasonId}&e=${episodeId}`;
        case 'multiembedvip':
            return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1&s=${seasonId}&e=${episodeId}`;
        case 'vidsrcicu':
            return `https://vidsrc.icu/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'embedsu':
            return `https://embed.su/embed/tv/${mediaId}/${seasonId}/${episodeId}`;
        case 'cinescrape':
            try {
                const randomDelay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
                await new Promise(resolve => setTimeout(resolve, randomDelay));  
                const response = await fetch(`https://cinescrape.com/tvshow/${mediaId}/${seasonId}/${episodeId}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                if (!data.data || data.data.length === 0) throw new Error('No video data available');

                // Define the desired quality order
                const qualityOrder = ['4K', '1080P', '720P', '360P'];
                let selectedSource = null;

                for (let quality of qualityOrder) {
                    for (let video of data.data) {
                        const sources = video.quality_list.filter(source => source.quality === quality);
                        if (sources.length > 0) {
                            selectedSource = sources.reduce((highestBitrateSource, currentSource) =>
                                currentSource.bitrate > highestBitrateSource.bitrate ? currentSource : highestBitrateSource
                            );
                            break;
                        }
                    }
                    if (selectedSource) break;
                }

                if (!selectedSource) throw new Error('No suitable video source found');

                const urlObj = new URL(selectedSource.download_url);
                urlObj.protocol = 'https:';
                urlObj.hostname = 'mp4.febbox.net';
                const videoUrl = urlObj.toString();

                return videoUrl;
            } catch (error) {
                console.error('Error fetching video from Cinescrape:', error);
                throw error;
            }
            case 'trailer':
                try {
                    const trailerUrl = await fetchTrailer(mediaId, 'tv', apiKey);
                    if (!trailerUrl) throw new Error('Trailer not found');
                    return trailerUrl;
                } catch (error) {
                    console.error('Error fetching trailer for TV show:', error);
                    throw error;
                }
    
            default:
                throw new Error('Provider not recognized.');
        }
    }


// Define the functions first
function enableOrientationLock() {
    const element = document.documentElement; // Lock the orientation for the whole page
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
            console.warn('Orientation lock failed:', err);
        });
    } else {
        console.warn('Orientation lock not supported on this device.');
    }
    // Optionally, make element fullscreen
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
        });
    }
}


function disableOrientationLock() {
    if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock().catch(err => {
            console.warn('Orientation unlock failed:', err);
        });
    }
    // Exit fullscreen mode
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
            console.warn('Exiting fullscreen failed:', err);
        });
    }
}

// Now add the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    const orientationLockToggle = document.getElementById('orientationLockToggle');
    const orientationLockEnabled = JSON.parse(localStorage.getItem('orientationLock')) || false;
    orientationLockToggle.checked = orientationLockEnabled;

    // Update lock orientation based on stored preference
    if (orientationLockEnabled) {
        enableOrientationLock();
    }

    // Event listener for the toggle switch
    orientationLockToggle.addEventListener('change', (event) => {
        const isEnabled = event.target.checked;
        localStorage.setItem('orientationLock', isEnabled);
        
        if (isEnabled) {
            enableOrientationLock();
        } else {
            disableOrientationLock();
        }
    });
});




function attemptFullscreenAndLockOrientation(element) {
    const orientationLockEnabled = JSON.parse(localStorage.getItem('orientationLock')) || false;
    if (!element || !orientationLockEnabled) return;

    // Request Fullscreen
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
        });
    }

    // Lock Screen Orientation to Landscape
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
            console.warn('Orientation lock failed:', err);
        });
    }
}


    
async function fetchMediaData(mediaId, mediaType, apiKey) {
    return fetchJson(`https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}`);
}

async function fetchCastData(mediaId, mediaType, apiKey) {
    return fetchJson(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/credits?api_key=${apiKey}`);
}

async function fetchTrailer(mediaId, mediaType, apiKey) {
    const data = await fetchJson(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?api_key=${apiKey}`);
    const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}


async function displaySelectedMedia(media, mediaType) {
    const $selectedMovie = $('#selectedMovie');
    const $mediaSection = $('#selectedMediaSection');
    const apiKey = await getApiKey();

    if (!media || !media.id) {
        $mediaSection.addClass('hidden');
        return;
    } else {
        $mediaSection.removeClass('hidden');

        document.getElementById('selectedMediaSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    if (!apiKey) return console.error('API key is not available.');

    try {
        const [mediaData, castData] = await Promise.all([
            fetchMediaData(media.id, mediaType, apiKey),
            fetchCastData(media.id, mediaType, apiKey)
        ]);

        const genres = mediaData.genres?.map(genre => genre.name).join(', ') || 'Unknown Genre';
        const language = mediaData.original_language?.toUpperCase() || 'Unknown';
        const releaseDate = media.release_date || media.first_air_date || 'Unknown Release Date';
        const productionCompanies = mediaData.production_companies?.map(company => company.name).join(', ') || 'Unknown Production Companies';
        const budget = mediaType === 'movie' ? (mediaData.budget ? `$${mediaData.budget.toLocaleString()}` : 'Unknown') : 'N/A';
        const revenue = mediaType === 'movie' ? (mediaData.revenue ? `$${mediaData.revenue.toLocaleString()}` : 'Unknown') : 'N/A';

        const ratings = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-star text-yellow-400"></i>
                <span class="text-lg font-semibold text-white">${(mediaData.vote_average || 0).toFixed(1)}</span>
                <span class="text-sm text-gray-400">/10</span>
            </div>`;
        const popularity = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-fire text-orange-500"></i>
                    <span class="text-lg font-semibold text-white">${(mediaData.popularity || 0).toFixed(1)}</span>
                    <span class="text-sm text-gray-400">Popularity</span>
                </div>`;

        const castList = castData.cast.slice(0, 5).map(actor => `
                <div class="flex-shrink-0 w-28 mx-2 text-center">
                    <div class="w-28 h-28 mx-auto mb-2 rounded-full overflow-hidden border-2 border-purple-500 shadow-lg">
                        <img src="${actor.profile_path ? 'https://image.tmdb.org/t/p/w500' + actor.profile_path : 'path/to/placeholder-image.jpg'}" alt="${actor.name}" 
                             class="w-full h-full object-cover" onerror="this.src='path/to/placeholder-image.jpg';">
                    </div>
                    <p class="text-white font-semibold text-sm truncate">${actor.name}</p>
                    <p class="text-gray-400 text-xs truncate">${actor.character}</p>
                </div>
            `).join('');

        let runtime;

        if (mediaType === 'movie') {
            runtime = `${mediaData.runtime || 'N/A'} min`;
        } else if (mediaType === 'tv') {
            runtime = `${Math.round(mediaData.episode_run_time.reduce((a, b) => a + b, 0) / mediaData.episode_run_time.length)} min per episode`;
        }

        const template = await fetch('media/mediaTemplate.html').then(response => response.text());

        $selectedMovie.html(template
            .replace(/{{poster_path}}/g, `${media.poster_path}`)
            .replace(/{{title_or_name}}/g, media.title || media.name)
            .replace(/{{release_date_or_first_air_date}}/g, releaseDate)
            .replace(/{{overview}}/g, media.overview || 'No overview available.')
            .replace(/{{type}}/g, mediaType === 'movie' ? 'Movie' : 'TV Show')
            .replace(/{{language}}/g, `${language}`)
            .replace(/{{genres}}/g, `${genres}`)
            .replace(/{{runtime}}/g, `${runtime}`)
            .replace(/{{budget}}/g, `${budget}`)
            .replace(/{{revenue}}/g, `${revenue}`)
            .replace(/{{ratings}}/g, ratings)
            .replace(/{{popularity}}/g, popularity)
            .replace(/{{cast_list}}/g, castList)
            .replace(/{{production_companies}}/g, `${productionCompanies}`)
        );

        const $videoPlayer = $('#videoPlayer');
        const $movieInfo = $('#movieInfo');
        const $playButton = $('#playButton');
        const $closePlayerButton = $('#closePlayerButton');
        const $languageSelect = $('#languageSelect');
        const $providerSelect = $('#providerSelect');
        const $selectEpisodeButton = $('#selectEpisodeButton');
        const $episodeModal = $('#episodeModal');

        let selectedProvider = 'vidsrc';
        let selectedEpisode = null;
        let selectedSeason = null;
        let episodesData = [];
        let seasonsData = [];

        if (mediaType === 'tv') {
            seasonsData = mediaData.seasons.filter(season => season.season_number !== 0);
        }

        window.addEventListener('message', function(event) {
            if (event.origin !== 'https://vidlink.pro') {
                return;
            }

            if (event.data && event.data.type === 'MEDIA_DATA') {
                // Get the media data from the message
                const mediaData = event.data.data;

                // Save the media data to localStorage
                localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
            }
        });
        async function updateVideo() {
            try {
                // Determine the selected provider and ensure API key is present
                const provider = $providerSelect.length ? $providerSelect.val() : selectedProvider;
                const apiKey = await getApiKey();
                if (!apiKey) return console.error('API key is not available.');
                
                let endpoint;
        
                // Check if the selected provider is for a trailer
                if (provider === 'trailer') {
                    // Trailer handling for movies and TV shows
                    if (mediaType === 'movie') {
                        endpoint = await getMovieEmbedUrl(media.id, provider, apiKey);
                    } else if (mediaType === 'tv') {
                        if (!selectedSeason || !selectedEpisode) {
                            alert('Please select a season and an episode.');
                            return;
                        }
                        endpoint = await getTvEmbedUrl(media.id, selectedSeason, selectedEpisode, provider, apiKey);
                    }
                } else if (mediaType === 'tv') {
                    // Non-trailer TV show handling
                    if (!selectedSeason || !selectedEpisode) {
                        alert('Please select a season and an episode.');
                        return;
                    }
                    if (provider === 'cinescrape') showLoadingScreen();
                    endpoint = await getTvEmbedUrl(media.id, selectedSeason, selectedEpisode, provider, apiKey);
                } else {
                    // Non-trailer movie handling
                    if (provider === 'filmxy') {
                        // Prompt for language selection with filmxy provider
                        const languages = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu'];
                        const selectedLanguage = await promptUserForLanguage(languages);
                        if (!selectedLanguage) {
                            alert('No language selected.');
                            return;
                        }
                        showLoadingScreen();
                        endpoint = await getMovieEmbedUrl(media.id, provider, apiKey, selectedLanguage);
                    } else if (provider === 'cinescrape') {
                        showLoadingScreen();
                        endpoint = await getMovieEmbedUrl(media.id, provider, apiKey);
                    } else {
                        endpoint = await getMovieEmbedUrl(media.id, provider, apiKey);
                    }
                }
        
                // Display video based on provider
                if (provider === 'trailer') {
                    // Trailer display in an iframe
                    const iframeHtml = `
                        <iframe src="${endpoint}" id="videoIframe" class="video-iframe" allowfullscreen loading="lazy" style="width: 100%; height: 600px;"></iframe>
                    `;
                    $videoPlayer.html(iframeHtml).removeClass('hidden');
                    $movieInfo.children().not($videoPlayer).addClass('hidden');
                    $closePlayerButton.removeClass('hidden');
        
                    // Attempt to enter fullscreen and lock orientation
                    attemptFullscreenAndLockOrientation(document.getElementById('videoIframe'));
                } else if (provider === 'cinescrape') {
                    // Cinescrape specific video setup
                    const videoHtml = `
                        <video id="mp4VideoPlayer" loading="lazy" preload="metadata" crossorigin="anonymous" controls style="height: 1000px; width: 100%;" class="video-element">
                            <source data-src="${endpoint}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                    $videoPlayer.html(videoHtml).removeClass('hidden');
                    $movieInfo.children().not($videoPlayer).addClass('hidden');
                    $closePlayerButton.removeClass('hidden');
        
                    // Lazy load video source
                    const videoElement = document.getElementById('mp4VideoPlayer');
                    const sourceElement = videoElement.querySelector('source');
                    if ('IntersectionObserver' in window) {
                        const observer = new IntersectionObserver((entries, observer) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    sourceElement.src = sourceElement.getAttribute('data-src');
                                    videoElement.load();
                                    observer.unobserve(videoElement);
                                }
                            });
                        });
                        observer.observe(videoElement);
                    } else {
                        sourceElement.src = sourceElement.getAttribute('data-src');
                        videoElement.load();
                    }
        
                    // Attempt to enter fullscreen and lock orientation when video is ready
                    videoElement.addEventListener('loadedmetadata', () => {
                        attemptFullscreenAndLockOrientation(videoElement);
                    });
                } else if (provider === 'filmxy') {
                    // HLS setup for filmxy provider
                    const playerHtml = `
                        <video id="hlsVideoPlayer" loading="lazy" crossorigin="anonymous" preload="metadata" controls style="width: 100%; height: auto;" class="video-element">
                        </video>
                    `;
                    $videoPlayer.html(playerHtml).removeClass('hidden');
                    $movieInfo.children().not($videoPlayer).addClass('hidden');
                    $closePlayerButton.removeClass('hidden');
        
                    const videoElement = document.getElementById('hlsVideoPlayer');
                    if ('IntersectionObserver' in window && Hls.isSupported()) {
                        const observer = new IntersectionObserver((entries, observer) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const hls = new Hls({ lowLatencyMode: true, backBufferLength: 90 });
                                    hls.loadSource(endpoint);
                                    hls.attachMedia(videoElement);
                                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                                        videoElement.play();
                                        attemptFullscreenAndLockOrientation(videoElement);
                                    });
                                    observer.unobserve(videoElement);
                                }
                            });
                        });
                        observer.observe(videoElement);
                    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                        videoElement.src = endpoint;
                        videoElement.addEventListener('loadedmetadata', () => {
                            videoElement.play();
                            attemptFullscreenAndLockOrientation(videoElement);
                        });
                    } else {
                        alert('Your browser does not support HLS playback.');
                    }
                } else {
                    // Generic iframe display for other providers
                    const sandboxAttribute = provider === 'vidlink' ? 'sandbox="allow-same-origin allow-scripts allow-forms"' : '';
                    const referrerPolicy = provider === 'vidbinge' ? 'referrerpolicy="origin-when-cross-origin"' : '';
                    const iframeHtml = `
                        <iframe 
                            src="${endpoint}" 
                            id="videoIframe"
                            class="video-iframe" 
                            allowfullscreen 
                            preload="auto"
                            loading="lazy"
                            crossorigin="anonymous"
                            ${sandboxAttribute} 
                            ${referrerPolicy}>
                        </iframe>
                    `;
                    $videoPlayer.html(iframeHtml).removeClass('hidden');
                    $movieInfo.children().not($videoPlayer).addClass('hidden');
                    $closePlayerButton.removeClass('hidden');
        
                    $('iframe').one('load', function () {
                        const iframeWindow = this.contentWindow;
                        if (iframeWindow) {
                            try {
                                iframeWindow.document.addEventListener('click', (event) => {
                                    const target = event.target.tagName;
                                    if (target === 'A' || target === 'BUTTON') event.preventDefault();
                                });
                                iframeWindow.open = () => null;
                                iframeWindow.eval(`(function() { window.open = () => null; })();`);
                                ['beforeunload', 'unload', 'submit'].forEach(eventType => {
                                    iframeWindow.document.addEventListener(eventType, event => event.preventDefault());
                                });
                            } catch (error) {
                                console.error('Error in iframe event handling:', error);
                            }
                        }
                    });
        
                    // Attempt to enter fullscreen and lock orientation
                    attemptFullscreenAndLockOrientation(document.getElementById('videoIframe'));
                }
            } catch (error) {
                console.error('Error updating video:', error);
            }
        }
        
        


        async function closeVideoPlayer() {
            $videoPlayer.html('').addClass('hidden');
            $movieInfo.children().removeClass('hidden');
            $closePlayerButton.addClass('hidden');
        }

        function adjustIframeSize() {
            const $iframe = $('#dynamicIframe');
            const viewportWidth = $(window).width();
            const viewportHeight = $(window).height();
            $iframe.css({
                width: `${viewportWidth}px`,
                height: `${viewportHeight}px`
            });
        }

        $(window).on('resize', adjustIframeSize);
        adjustIframeSize();

        async function updateEpisodes(seasonNumber) {
            if (!seasonNumber) return;

            try {
                const season = await fetchJson(`https://api.themoviedb.org/3/tv/${media.id}/season/${seasonNumber}?api_key=${apiKey}`);

                const currentDate = new Date();

                const airedEpisodes = season.episodes.filter(episode => {
                    const airDate = new Date(episode.air_date);
                    return airDate <= currentDate;
                });

                if (airedEpisodes.length === 0) {
                    $('#runtime').html('No episodes have aired yet.');
                } else {
                    // Calculate total runtime for all aired episodes
                    const totalRuntime = airedEpisodes.reduce((total, episode) => total + (episode.runtime || 0), 0);
                    const averageRuntime = totalRuntime / airedEpisodes.length || 0;

                    $('#runtime').html(`Total Runtime: ${Math.round(totalRuntime)} min (${Math.round(averageRuntime)} min per episode)`);
                }

                episodesData = airedEpisodes.map(episode => ({
                    number: episode.episode_number,
                    name: episode.name || 'Untitled',
                    airDate: new Date(episode.air_date),
                    stillPath: episode.still_path,
                    overview: episode.overview || 'No description available.',
                    runtime: episode.runtime || 0
                }));

                selectedEpisode = null;

                $('#episodeGrid').html(renderEpisodeGrid(episodesData));

                $('.episodes-grid').scrollTop(0);

                attachEpisodeDescriptionToggle();

            } catch (error) {
                console.error('Failed to fetch season details:', error);
            }
        }


        function escapeHtml(str) {
            return str.replace(/[&<>"'()]/g, function (match) {
                const escape = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;',
                    '(': '&#40;',
                    ')': '&#41;'
                };
                return escape[match];
            });
        }

        function renderEpisodeGrid(episodes) {
            const storedData = JSON.parse(localStorage.getItem('vidLinkProgress') || '{}');
            const mediaData = storedData[media.id];
            const showProgress = mediaData && mediaData.type === 'tv' ? mediaData.show_progress : {};

            return episodes.map(episode => {
                const episodeKey = `s${selectedSeason}e${episode.number}`;
                let progressPercentage = 0;
                let watchedMinutes = 0;
                let durationMinutes = 0;

                if (showProgress && showProgress[episodeKey] && showProgress[episodeKey].progress && showProgress[episodeKey].progress.duration > 0) {
                    watchedMinutes = Math.round(showProgress[episodeKey].progress.watched / 60); // Convert seconds to minutes
                    durationMinutes = Math.round(showProgress[episodeKey].progress.duration / 60); // Convert seconds to minutes
                    progressPercentage = (showProgress[episodeKey].progress.watched / showProgress[episodeKey].progress.duration) * 100;
                    progressPercentage = Math.min(Math.max(progressPercentage, 0), 100); // Ensure between 0 and 100
                }

                return `
        <div class="episode-item bg-gradient-to-br from-black via-gray-900 to-purple-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 cursor-pointer relative group" data-episode-number="${episode.number}">
            <div class="relative">
                <img 
                    src="${episode.stillPath ? 'https://image.tmdb.org/t/p/w780' + episode.stillPath : 'https://via.placeholder.com/780x439?text=No+Image'}"
                    data-src-high="${episode.stillPath ? 'https://image.tmdb.org/t/p/original' + episode.stillPath : ''}" 
                    alt="Episode ${episode.number}"
                    class="w-full h-48 sm:h-40 object-cover lazyload transition-opacity duration-500"
                    loading="lazy"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                <div class="absolute bottom-2 left-2">
                    <h3 class="text-purple-300 text-sm font-semibold">E${episode.number}: ${escapeHtml(episode.name)}</h3>
                </div>
                <button class="description-toggle absolute top-2 right-2 text-white bg-purple-700 bg-opacity-80 rounded-full p-2 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-info-circle"></i>
                </button>
                <div class="absolute bottom-0 left-0 w-full h-2 bg-gray-800">
                    <div class="h-full bg-purple-600" style="width: ${progressPercentage}%;"></div>
                </div>
            </div>
            <div class="p-4 relative bg-black bg-opacity-70">
                <p class="text-purple-200 text-xs mb-2"><i class="fas fa-calendar-alt mr-1"></i>${episode.airDate ? new Date(episode.airDate).toLocaleDateString() : 'Unknown'}</p>
                <p class="text-purple-300 text-xs mt-1">Watched: ${watchedMinutes} min / ${durationMinutes} min</p>
                
                <!-- Description content with improved styling and transition -->
                <div class="description-content hidden mt-2 text-purple-100 text-sm bg-black bg-opacity-95 p-6 rounded-lg absolute inset-0 overflow-y-auto z-30 transition transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 duration-300 ease-in-out">
                    <button class="close-description absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full focus:outline-none">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3 class="text-purple-400 text-lg font-bold mb-4">Episode ${episode.number}: ${escapeHtml(episode.name)}</h3>
                    <p>${escapeHtml(episode.overview)}</p>
                </div>
            </div>
        </div>
        `;
            }).join('');
        }

        function renderSeasonList(seasons) {
            const storedData = JSON.parse(localStorage.getItem('vidLinkProgress') || '{}');
            const mediaData = storedData[media.id];
            const showProgress = mediaData && mediaData.type === 'tv' ? mediaData.show_progress : {};

            return seasons.map(season => {
                const seasonNumber = season.season_number;
                const episodesInSeason = season.episode_count;

                let episodesWatched = 0;
                for (let key in showProgress) {
                    if (showProgress.hasOwnProperty(key)) {
                        const [s, e] = key.split('e');
                        const seasonNum = parseInt(s.substring(1), 10);

                        if (seasonNum === seasonNumber && showProgress[key].progress && showProgress[key].progress.watched > 0) {
                            episodesWatched++;
                        }
                    }
                }

                const progressPercentage = episodesInSeason > 0 ? Math.round((episodesWatched / episodesInSeason) * 100) : 0;

                return `
            <div class="season-item flex items-center mb-4 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition relative group" data-season-number="${seasonNumber}">
                <div class="relative w-20 h-28">
                    <!-- Progressive Loading: Start with w200, load original when needed -->
                    <img 
                        src="${season.poster_path ? 'https://image.tmdb.org/t/p/w200' + season.poster_path : 'https://via.placeholder.com/200x300?text=No+Image'}"
                        data-src-high="${season.poster_path ? 'https://image.tmdb.org/t/p/original' + season.poster_path : ''}" 
                        alt="Season ${seasonNumber}" 
                        class="w-full h-full object-cover rounded-lg shadow-md lazyload transition-opacity duration-500"
                        loading="lazy"
                    >
                    <div class="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </div>
                <div class="ml-4 flex-1 bg-black bg-opacity-60 p-2 rounded-lg">
                    <h4 class="text-purple-300 text-lg font-semibold">Season ${seasonNumber}</h4>
                    <p class="text-purple-200 text-sm mb-2">${season.episode_count} Episodes</p>
                    <div class="w-full bg-gray-800 h-2 rounded-full">
                        <div class="bg-purple-600 h-2 rounded-full" style="width: ${progressPercentage}%;"></div>
                    </div>
                    <p class="text-purple-200 text-xs mt-1">${episodesWatched} / ${season.episode_count} Episodes Watched</p>
                </div>
                <i class="fas fa-chevron-right text-purple-400 absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
        `;
            }).join('');
        }



        async function openEpisodeModal() {
            if (mediaType !== 'tv') {
                alert('Episode selection is only available for TV shows.');
                return;
            }

            if (seasonsData.length === 0) {
                alert('No seasons are available for this show.');
                return;
            }

            const storedData = JSON.parse(localStorage.getItem('vidLinkProgress') || '{}');
            const mediaData = storedData[media.id];
            let preselectedSeason = null;
            let preselectedEpisode = null;

            if (mediaData && mediaData.type === 'tv') {
                preselectedSeason = parseInt(mediaData.last_season_watched, 10);
                preselectedEpisode = parseInt(mediaData.last_episode_watched, 10);
            }

            const modalContent = `
        <div class="modal-overlay fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
            <div class="modal-container bg-gradient-to-br from-gray-900 via-purple-800 to-black rounded-3xl shadow-2xl overflow-hidden max-w-full w-full md:max-w-6xl md:w-auto max-h-full relative">
                <button id="closeModalButton" class="absolute top-6 right-6 text-purple-300 text-3xl hover:text-purple-500 focus:outline-none">&times;</button>
                <div class="flex flex-col md:flex-row h-full">
                    <div class="seasons-list md:w-1/3 w-full bg-black bg-opacity-80 overflow-y-auto custom-scrollbar max-h-screen">
                        <h3 class="text-2xl font-bold text-purple-300 p-6 border-b border-purple-700">Seasons</h3>
                        <div class="p-4 space-y-3">
                            ${renderSeasonList(seasonsData)}
                        </div>
                    </div>
                    <div class="episodes-grid md:w-2/3 w-full p-6 overflow-y-auto custom-scrollbar max-h-screen bg-gray-950 bg-opacity-90">
                        <h2 class="text-3xl font-bold text-purple-300 mb-6">Select Episode</h2>
                        <div class="mb-6">
                            <input type="text" id="episodeSearchInput" class="w-full p-3 bg-gray-800 text-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="Search episodes...">
                        </div>
                        <div id="episodeGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${renderEpisodeGrid([])} <!-- Initially empty; episodes will be loaded based on selected season -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;


            $episodeModal.html(modalContent).removeClass('hidden');

            // Close modal handler
            $('#closeModalButton').on('click', function() {
                $episodeModal.addClass('hidden').html('');
            });

            $('.season-item').on('click', async function() {
                const seasonNumber = $(this).data('season-number');
                selectedSeason = seasonNumber;

                $('.season-item').removeClass('bg-gray-700');
                $(this).addClass('bg-gray-700');

                await updateEpisodes(seasonNumber);

                attachEpisodeDescriptionToggle();
            });

            if (preselectedSeason && seasonsData.some(season => season.season_number === preselectedSeason)) {
                selectedSeason = preselectedSeason;
                $(`.season-item[data-season-number="${selectedSeason}"]`).addClass('bg-gray-700');
                await updateEpisodes(selectedSeason);
            } else {
                $('.season-item').first().click();
            }

            if (preselectedEpisode) {
                const checkEpisodesLoaded = setInterval(() => {
                    if ($('#episodeGrid').children().length > 0) {
                        selectEpisode(preselectedEpisode);
                        clearInterval(checkEpisodesLoaded);
                    }
                }, 100);
            }

            $('#episodeSearchInput').on('input', function() {
                const searchTerm = $(this).val().toLowerCase();
                const filteredEpisodes = episodesData.filter(episode =>
                    episode.name.toLowerCase().includes(searchTerm) ||
                    episode.number.toString().includes(searchTerm)
                );
                $('#episodeGrid').html(renderEpisodeGrid(filteredEpisodes));

                attachEpisodeDescriptionToggle();
            });

            $('#episodeGrid').on('click', '.episode-item', function(event) {
                if ($(event.target).closest('.description-toggle').length > 0 || $(event.target).closest('.description-content').length > 0) {
                    return;
                }
                const episodeNumber = $(this).data('episode-number');
                selectEpisode(episodeNumber);
                $episodeModal.addClass('hidden').html('');
            });

            function attachEpisodeDescriptionToggle() {
                $('.description-toggle').off('click').on('click', function(event) {
                    event.stopPropagation();
                    const $descriptionContent = $(this).closest('.episode-item').find('.description-content');
                    $descriptionContent.fadeToggle();
                });

                $('.close-description').off('click').on('click', function(event) {
                    event.stopPropagation();
                    $(this).closest('.description-content').fadeOut();
                });
            }

            attachEpisodeDescriptionToggle();
        }

        function selectEpisode(episodeNumber) {
            selectedEpisode = episodeNumber;
            const episode = episodesData.find(ep => ep.number === episodeNumber);
            if (episode) {
                $selectEpisodeButton.html(`<i class="fas fa-list mr-2"></i>Selected: S${selectedSeason}E${episode.number} - ${escapeHtml(episode.name)}`);
            } else {
                $selectEpisodeButton.text(`Episode ${episodeNumber} Selected`);
            }

            const storedData = JSON.parse(localStorage.getItem('vidLinkProgress') || '{}');
            const mediaId = media.id;
            let mediaData = storedData[mediaId];

            if (mediaData && mediaData.type === 'tv') {
                if (!storedData[mediaId]) {
                    storedData[mediaId] = {
                        id: media.id,
                        type: media.type,
                        title: media.title,
                        poster_path: media.poster_path,
                        backdrop_path: media.backdrop_path,
                        progress: {}, // general progress
                        last_updated: Date.now(),
                        number_of_episodes: media.number_of_episodes,
                        number_of_seasons: media.number_of_seasons,
                        last_season_watched: "",
                        last_episode_watched: "",
                        show_progress: {}
                    };
                    mediaData = storedData[mediaId];
                }

                const episodeKey = `s${selectedSeason}e${selectedEpisode}`;

                mediaData.last_season_watched = selectedSeason.toString();
                mediaData.last_episode_watched = selectedEpisode.toString();

                if (!mediaData.show_progress[episodeKey]) {
                    mediaData.show_progress[episodeKey] = {
                        season: selectedSeason.toString(),
                        episode: selectedEpisode.toString(),
                        progress: {
                            watched: 0,
                            duration: 0
                        },
                        last_updated: Date.now()
                    };
                }

                // Update last_updated timestamp
                mediaData.show_progress[episodeKey].last_updated = Date.now();

                storedData[mediaId] = mediaData;
                localStorage.setItem('vidLinkProgress', JSON.stringify(storedData));
            }
        }

        $playButton.on('click', updateVideo);
        $closePlayerButton.on('click', closeVideoPlayer);
        $languageSelect.on('change', function() {
            $providerSelect.toggleClass('hidden', $languageSelect.val() === 'fr');
            updateVideo();
        });
        $providerSelect.on('change', function() {
            selectedProvider = $(this).val();
            updateVideo();
        });
        $selectEpisodeButton.on('click', function() {
            openEpisodeModal();
        });


    } catch (error) {
        console.error('Failed to display selected media:', error);
    }
}
