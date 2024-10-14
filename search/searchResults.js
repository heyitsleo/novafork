$(document).ready(async function() {
    const API_BASE_URL = 'https://api.themoviedb.org/3';
    let apiKey;
    const genreMap = {};

    const handleError = (message, error) => console.error(message, error);

    const getApiKey = async () => {
        try {
            const { apiKey } = await $.getJSON('apis/config.json');
            return apiKey;
        } catch (error) {
            handleError('Failed to fetch API key.', error);
            return null;
        }
    };

    const fetchAllGenres = async () => {
        try {
            const [movieGenres, tvGenres] = await Promise.all([
                $.getJSON(`${API_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`),
                $.getJSON(`${API_BASE_URL}/genre/tv/list?api_key=${apiKey}&language=en-US`)
            ]);
            [...movieGenres.genres, ...tvGenres.genres].forEach(genre => {
                genreMap[genre.id] = genre.name;
            });
        } catch (error) {
            handleError('Failed to fetch genres.', error);
        }
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const showLoading = () => {
        $('#searchSuggestions').html('<div class="spinner"></div>').removeClass('hidden');
    };

    const highlightText = (text, query) => {
        const words = query.split(/\s+/).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    const displaySearchSuggestions = (results, query) => {
        const $searchSuggestions = $('#searchSuggestions');
        if (results.length === 0) {
            $searchSuggestions.html('<div class="no-suggestions">No suggestions available</div>').removeClass('hidden');
            return;
        }

        const suggestionsHTML = results.map(media => {
            const mediaTypeLabel = media.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show';
            const mediaTitle = media.title || media.name;
            const mediaRating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
            const highlightedTitle = highlightText(mediaTitle, query);
            const genreNames = (media.genre_ids || []).map(id => genreMap[id] || 'Unknown').slice(0, 2).join(', ');
            const year = media.release_date ? new Date(media.release_date).getFullYear() :
                (media.first_air_date ? new Date(media.first_air_date).getFullYear() : 'N/A');

            return `
                <div class="suggestion-item" data-id="${media.id}" data-type="${media.media_type}">
                    <img src="https://image.tmdb.org/t/p/w92${media.poster_path}" alt="${mediaTitle}" class="suggestion-poster">
                    <div class="suggestion-content">
                        <h4 class="suggestion-title">${highlightedTitle}</h4>
                        <div class="suggestion-details">
                            <span class="suggestion-type">${mediaTypeLabel}</span>
                            <span class="suggestion-year">${year}</span>
                        </div>
                        <div class="suggestion-meta">
                            <span class="suggestion-rating">⭐ ${mediaRating}</span>
                            <span class="suggestion-genres">${genreNames}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $searchSuggestions.html(suggestionsHTML).removeClass('hidden');

        $searchSuggestions.find('.suggestion-item').on('click', function() {
            const mediaId = $(this).data('id');
            const mediaType = $(this).data('type');
            fetchSelectedMedia(mediaId, mediaType);
            $searchSuggestions.addClass('hidden');
        });

        setupKeyboardNavigation($searchSuggestions);
    };

    const displaySearchResults = (results) => {
        const $mediaContainer = $('#mediaContainer');
        if (results.length === 0) {
            $mediaContainer.html('<div class="p-4 text-gray-400 text-center">No results found</div>');
            return;
        }

        const resultsHTML = results.map(media => {
            const genreNames = (media.genre_ids || []).map(id => genreMap[id] || 'Unknown').join(', ');
            const releaseDate = media.release_date || media.first_air_date || 'N/A';
            const formattedDate = releaseDate !== 'N/A' ? new Date(releaseDate).toLocaleDateString() : 'N/A';
            const ratingStars = '★'.repeat(Math.round(media.vote_average / 2)) + '☆'.repeat(5 - Math.round(media.vote_average / 2));

            return `
                <div class="media-card" data-id="${media.id}" data-type="${media.media_type}">
                    <img src="https://image.tmdb.org/t/p/w500${media.poster_path}" alt="${media.title || media.name}" class="media-image">
                    <div class="media-content">
                        <h3 class="media-title">${media.title || media.name}</h3>
                        <p class="media-type">${media.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show'}</p>
                        <div class="media-details">
                            <p class="media-genres">Genres: ${genreNames}</p>
                            <div class="media-rating">
                                <span class="rating-stars">${ratingStars}</span>
                                <span>${media.vote_average.toFixed(1)}/10</span>
                            </div>
                            <p class="media-release-date">Release: ${formattedDate}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $mediaContainer.html(resultsHTML);

        $mediaContainer.find('.media-card').on('click', function() {
            const mediaId = $(this).data('id');
            const mediaType = $(this).data('type');
            fetchSelectedMedia(mediaId, mediaType);
        });
    };

    const fetchSelectedMedia = async (mediaId, mediaType) => {
        try {
            const media = await $.getJSON(`${API_BASE_URL}/${mediaType}/${mediaId}?api_key=${apiKey}`);
            displaySelectedMedia(media, mediaType);

            const title = media.title || media.name;
            const formattedTitle = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            history.pushState({ title }, title, `?title=${formattedTitle}`);
        } catch (error) {
            handleError('An error occurred while fetching media details:', error);
        }
    };

    const fetchTopRatedMedia = async () => {
        try {
            const { results } = await $.getJSON(`${API_BASE_URL}/movie/top_rated?api_key=${apiKey}`);
            displaySearchResults(results);
        } catch (error) {
            handleError('An error occurred while fetching top-rated media:', error);
        }
    };

    const fetchUpcomingMedia = async () => {
        try {
            const { results } = await $.getJSON(`${API_BASE_URL}/movie/upcoming?api_key=${apiKey}&language=en-US`);
            const upcomingMovies = results.filter(media => new Date(media.release_date) > new Date());
            displayUpcomingMedia(upcomingMovies);
        } catch (error) {
            handleError('An error occurred while fetching upcoming media:', error);
        }
    };

    const displayUpcomingMedia = (mediaList) => {
        const upcomingMediaHTML = mediaList.map(media =>
            `<div class="text-zinc-300 mb-2"><span>${media.title}:</span> <span>${media.release_date}</span></div>`
        ).join('');
        $('#upcomingMedia').html(upcomingMediaHTML);
    };

    const setupKeyboardNavigation = ($container) => {
        const $items = $container.find('.suggestion-item');
        let currentIndex = -1;

        const selectItem = (index) => {
            $items.removeClass('selected').eq(index).addClass('selected');
        };

        $(document).on('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                currentIndex = (currentIndex + 1) % $items.length;
                selectItem(currentIndex);
                event.preventDefault();
            } else if (event.key === 'ArrowUp') {
                currentIndex = (currentIndex - 1 + $items.length) % $items.length;
                selectItem(currentIndex);
                event.preventDefault();
            } else if (event.key === 'Enter') {
                if (currentIndex >= 0 && currentIndex < $items.length) {
                    $items.eq(currentIndex).click();
                    event.preventDefault();
                }
            }
        });
    };

    const handleSearchInput = debounce(async () => {
        const query = $('#searchInput').val().trim();
        if (query.length < 2) {
            $('#searchSuggestions').empty().addClass('hidden');
            return;
        }

        showLoading();

        try {
            const { results } = await $.getJSON(`${API_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`);
            const filteredResults = results.filter(media => 
                media.media_type === 'movie' || media.media_type === 'tv'
            ).slice(0, 10);
            displaySearchSuggestions(filteredResults, query);
        } catch (error) {
            handleError('An error occurred while fetching search results:', error);
        }
    }, 300);

    $(window).on('popstate', async (event) => {
        const state = event.originalEvent.state;
        if (state && state.title) {
            const media = await searchMediaByTitle(state.title);
            if (media) {
                displaySelectedMedia(media, media.media_type);
            }
        }
    });

    const searchMediaByTitle = async (title) => {
        try {
            const { results } = await $.getJSON(`${API_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}&include_adult=false`);
            return results[0];
        } catch (error) {
            handleError('An error occurred while searching media by title:', error);
            return null;
        }
    };

    const init = async () => {
        apiKey = await getApiKey();
        if (apiKey) {
            await fetchAllGenres();
            await fetchTopRatedMedia();
            await fetchUpcomingMedia();
        }
    };

    await init();

    $('#searchInput').on('input', handleSearchInput);

    $('#randomButton').on('click', async () => {
        try {
            const { results } = await $.getJSON(`${API_BASE_URL}/trending/all/week?api_key=${apiKey}`);
            const randomMedia = results[Math.floor(Math.random() * results.length)];
            fetchSelectedMedia(randomMedia.id, randomMedia.media_type);
        } catch (error) {
            handleError('An error occurred while fetching trending media:', error);
        }
    });

    $('input[name="mediaType"]').on('change', function() {
        if ($(this).val() === 'top_rated') {
            fetchTopRatedMedia();
        }
    });
});