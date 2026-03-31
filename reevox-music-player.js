// ═══════════════════════════════════════════════════════════
// 🎵 REEVOX MUSIC - PLAYER GLOBAL
// Ce fichier gère le player flottant sur TOUTES les pages
// ═══════════════════════════════════════════════════════════

(function() {
    'use strict';

    // Vérifier si le player existe déjà
    if (document.getElementById('globalMusicPlayer')) return;

    // Créer le HTML du player
    const playerHTML = `
        <div id="globalMusicPlayer" style="display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; background: rgba(20, 10, 40, 0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(168, 85, 247, 0.3); box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);">
            <div style="max-width: 1280px; margin: 0 auto; padding: 12px 24px;">
                
                <!-- Barre de progression -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; margin-bottom: 6px; color: #d8b4fe;">
                        <span id="globalCurrentTime">0:00</span>
                        <div id="globalProgressBar" style="flex: 1; height: 6px; background: rgba(168, 85, 247, 0.2); border-radius: 10px; cursor: pointer; position: relative;">
                            <div id="globalProgressFill" style="height: 100%; background: linear-gradient(to right, #a855f7, #ec4899); border-radius: 10px; width: 0%; transition: width 0.1s;"></div>
                        </div>
                        <span id="globalDuration">0:00</span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
                    
                    <!-- Info musique -->
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                        <img id="globalPlayerCover" src="" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/150/a855f7/ffffff?text=♪'">
                        <div style="min-width: 0; flex: 1;">
                            <h4 id="globalPlayerTitle" style="font-weight: 700; font-size: 14px; margin: 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Aucune musique</h4>
                            <p id="globalPlayerArtist" style="font-size: 12px; margin: 0; color: #d8b4fe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">-</p>
                        </div>
                    </div>

                    <!-- Contrôles -->
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <button id="globalPrevBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: white; padding: 0;">⏮️</button>
                        <button id="globalPlayBtn" style="background: linear-gradient(to right, #a855f7, #ec4899); border: none; width: 48px; height: 48px; border-radius: 50%; font-size: 20px; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center;">▶️</button>
                        <button id="globalNextBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: white; padding: 0;">⏭️</button>
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1; justify-content: flex-end;">
                        <button id="globalVolumeBtn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: white;">🔊</button>
                        <input type="range" id="globalVolumeSlider" min="0" max="100" value="70" style="width: 100px; cursor: pointer;">
                        <button id="globalCloseBtn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #ef4444;" title="Fermer">✕</button>
                    </div>
                </div>
            </div>
        </div>
        <audio id="globalAudioPlayer" preload="metadata"></audio>
    `;

    // Injecter le player dans la page
    document.body.insertAdjacentHTML('beforeend', playerHTML);

    // Variables globales
    let audio = document.getElementById('globalAudioPlayer');
    let currentTrack = null;
    let queue = [];
    let currentIndex = 0;
    let isPlaying = false;

    // Éléments DOM
    const player = document.getElementById('globalMusicPlayer');
    const playBtn = document.getElementById('globalPlayBtn');
    const prevBtn = document.getElementById('globalPrevBtn');
    const nextBtn = document.getElementById('globalNextBtn');
    const closeBtn = document.getElementById('globalCloseBtn');
    const volumeBtn = document.getElementById('globalVolumeBtn');
    const volumeSlider = document.getElementById('globalVolumeSlider');
    const progressBar = document.getElementById('globalProgressBar');
    const progressFill = document.getElementById('globalProgressFill');
    const currentTimeEl = document.getElementById('globalCurrentTime');
    const durationEl = document.getElementById('globalDuration');
    const coverEl = document.getElementById('globalPlayerCover');
    const titleEl = document.getElementById('globalPlayerTitle');
    const artistEl = document.getElementById('globalPlayerArtist');

    // Charger l'état sauvegardé
    function loadState() {
        const savedTrack = localStorage.getItem('reevox_music_track');
        const savedTime = localStorage.getItem('reevox_music_time');
        const savedQueue = localStorage.getItem('reevox_music_queue');
        const savedIndex = localStorage.getItem('reevox_music_index');
        const wasPlaying = localStorage.getItem('reevox_music_playing') === 'true';

        if (savedTrack) {
            currentTrack = JSON.parse(savedTrack);
            if (savedQueue) queue = JSON.parse(savedQueue);
            if (savedIndex) currentIndex = parseInt(savedIndex);
            
            loadTrack(currentTrack);
            if (savedTime) audio.currentTime = parseFloat(savedTime);
            
            player.style.display = 'block';
            
            if (wasPlaying) {
                audio.play().catch(() => {});
            }
        }
    }

    // Charger une musique
    function loadTrack(track) {
        if (!track) return;
        
        currentTrack = track;
        audio.src = track.url;
        coverEl.src = track.cover || 'https://via.placeholder.com/150/a855f7/ffffff?text=♪';
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
        
        player.style.display = 'block';
        
        document.title = `${track.title} - ${track.artist} | Reevox Music`;
        
        saveState();
        setupMediaSession(track);
    }

    // Sauvegarder l'état
    function saveState() {
        if (currentTrack) {
            localStorage.setItem('reevox_music_track', JSON.stringify(currentTrack));
            localStorage.setItem('reevox_music_time', audio.currentTime);
            localStorage.setItem('reevox_music_queue', JSON.stringify(queue));
            localStorage.setItem('reevox_music_index', currentIndex);
            localStorage.setItem('reevox_music_playing', isPlaying);
        }
    }

    // Media Session API
    function setupMediaSession(track) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: 'Reevox Music',
                artwork: [
                    { src: track.cover || 'https://via.placeholder.com/512/a855f7/ffffff?text=♪', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                audio.play();
                playBtn.textContent = '⏸️';
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                audio.pause();
                playBtn.textContent = '▶️';
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => previousTrack());
            navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
        }
    }

    // Format du temps
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Mise à jour de la progression
    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
        
        if (Math.floor(audio.currentTime) % 5 === 0) {
            saveState();
        }

        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate,
                    position: audio.currentTime
                });
            } catch (e) {}
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
        nextTrack();
    });

    // Contrôles
    playBtn.addEventListener('click', () => {
        if (!currentTrack) return;
        
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸️';
            isPlaying = true;
        } else {
            audio.pause();
            playBtn.textContent = '▶️';
            isPlaying = false;
        }
        saveState();
    });

    function previousTrack() {
        if (currentIndex > 0) {
            currentIndex--;
            loadTrack(queue[currentIndex]);
            audio.play();
            isPlaying = true;
            saveState();
        }
    }

    function nextTrack() {
        if (currentIndex < queue.length - 1) {
            currentIndex++;
            loadTrack(queue[currentIndex]);
            audio.play();
            isPlaying = true;
            saveState();
        }
    }

    prevBtn.addEventListener('click', previousTrack);
    nextBtn.addEventListener('click', nextTrack);

    // Volume
    audio.volume = 0.7;

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
        localStorage.setItem('reevox_music_volume', volumeSlider.value);
    });

    volumeBtn.addEventListener('click', () => {
        if (audio.muted) {
            audio.muted = false;
            volumeBtn.textContent = '🔊';
        } else {
            audio.muted = true;
            volumeBtn.textContent = '🔇';
        }
    });

    // Charger le volume sauvegardé
    const savedVolume = localStorage.getItem('reevox_music_volume');
    if (savedVolume) {
        volumeSlider.value = savedVolume;
        audio.volume = savedVolume / 100;
    }

    // Seek
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        audio.currentTime = audio.duration * percentage;
    });

    // Fermer le player
    closeBtn.addEventListener('click', () => {
        if (confirm('Fermer le player ? La musique sera arrêtée.')) {
            audio.pause();
            audio.currentTime = 0;
            player.style.display = 'none';
            playBtn.textContent = '▶️';
            isPlaying = false;
            currentTrack = null;
            queue = [];
            currentIndex = 0;
            
            localStorage.removeItem('reevox_music_track');
            localStorage.removeItem('reevox_music_time');
            localStorage.removeItem('reevox_music_queue');
            localStorage.removeItem('reevox_music_index');
            localStorage.removeItem('reevox_music_playing');
            
            document.title = document.title.split(' | ')[0];
        }
    });

    // Sauvegarder avant de quitter
    window.addEventListener('beforeunload', saveState);
    document.addEventListener('visibilitychange', saveState);

    // Charger l'état au démarrage
    loadState();

    // Exposer des fonctions globales pour que d'autres pages puissent les utiliser
    window.ReevoxMusic = {
        play: function(track) {
            currentTrack = track;
            queue = [track];
            currentIndex = 0;
            loadTrack(track);
            audio.play();
            isPlaying = true;
        },
        addToQueue: function(track) {
            queue.push(track);
            saveState();
        },
        getState: function() {
            return {
                currentTrack,
                queue,
                currentIndex,
                isPlaying
            };
        }
    };

    console.log('🎵 Reevox Music Player chargé !');
})();
