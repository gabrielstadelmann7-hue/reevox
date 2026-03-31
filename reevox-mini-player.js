// ═══════════════════════════════════════════════════════════
// 🎵 REEVOX MUSIC - MINI PLAYER AVEC PLAYLISTS
// ═══════════════════════════════════════════════════════════

(function() {
    'use strict';

    if (window.location.pathname.includes('reevox-music.html')) return;
    
    const savedTrack = localStorage.getItem('reevox_music_track');
    if (!savedTrack) return;

    let isMinimized = localStorage.getItem('reevox_player_minimized') === 'true';

    const html = `
        <!-- Bouton flottant visible quand player caché -->
        <button id="reevoxShowBtn" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #a855f7, #ec4899);
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            color: white;
            box-shadow: 0 4px 20px rgba(168, 85, 247, 0.7);
            transition: transform 0.2s, opacity 0.3s;
            display: none;
            align-items: center;
            justify-content: center;
        " title="Afficher le player" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">🎵</button>

        <div id="reevoxMiniPlayer" style="
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 999998;
            background: linear-gradient(135deg, rgba(20, 10, 40, 0.98), rgba(45, 15, 77, 0.98));
            backdrop-filter: blur(20px);
            border-top: 2px solid rgba(168, 85, 247, 0.5);
            box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.8);
            font-family: 'Poppins', sans-serif;
            transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s ease;
        ">
            <!-- Bouton réduire -->
            <button id="toggleBtn" style="
                position: absolute;
                top: -34px;
                right: 60px;
                background: linear-gradient(135deg, #a855f7, #ec4899);
                border: none;
                padding: 6px 16px;
                border-radius: 8px 8px 0 0;
                font-size: 12px; font-weight: 700;
                cursor: pointer;
                color: white; box-shadow: 0 -4px 14px rgba(168, 85, 247, 0.5);
                letter-spacing: 1px;
                transition: background 0.2s;
            " onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">▼ RÉDUIRE</button>

            <div style="max-width: 1400px; margin: 0 auto; padding: 14px 24px;">
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 12px; font-size: 11px; margin-bottom: 6px; color: #d8b4fe; font-weight: 500;">
                        <span id="ct">0:00</span>
                        <div id="pb" style="flex: 1; height: 6px; background: rgba(168, 85, 247, 0.2); border-radius: 10px; cursor: pointer; overflow: hidden;">
                            <div id="pf" style="height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899); border-radius: 10px; width: 0%; transition: width 0.3s;"></div>
                        </div>
                        <span id="dur">0:00</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;">
                        <img id="cov" src="" style="width: 50px; height: 50px; border-radius: 9px; object-fit: cover; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);" onerror="this.src='https://via.placeholder.com/150/a855f7/ffffff?text=♪'">
                        <div style="min-width: 0; flex: 1;">
                            <h4 id="tit" style="font-weight: 700; font-size: 15px; margin: 0 0 3px 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">...</h4>
                            <p id="art" style="font-size: 12px; margin: 0; color: #d8b4fe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">-</p>
                        </div>
                    </div>
                    
                    <!-- Contrôles playlist -->
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button id="prevBtn" style="background: none; border: none; font-size: 22px; cursor: pointer; color: white; padding: 0; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Précédent">⏮️</button>
                        <button id="ply" style="background: linear-gradient(135deg, #a855f7, #ec4899); border: none; width: 48px; height: 48px; border-radius: 50%; font-size: 20px; cursor: pointer; color: white; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.5); transition: transform 0.2s; flex-shrink:0;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">▶️</button>
                        <button id="nextBtn" style="background: none; border: none; font-size: 22px; cursor: pointer; color: white; padding: 0; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Suivant">⏭️</button>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 14px; flex: 1; justify-content: flex-end;">
                        <button id="vol" style="background: none; border: none; font-size: 20px; cursor: pointer; color: white; padding: 0;">🔊</button>
                        <input type="range" id="vsl" min="0" max="100" value="70" style="width: 90px; cursor: pointer; accent-color: #a855f7;">
                        <a href="reevox-music.html" style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.5); padding: 7px 14px; border-radius: 9px; text-decoration: none; color: #a855f7; font-weight: 700; font-size: 12px;">🎵 Music</a>
                        <button id="cls" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #ef4444; padding: 0;" title="Fermer">✕</button>
                    </div>
                </div>
            </div>
        </div>
        <audio id="aud"></audio>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const player    = document.getElementById('reevoxMiniPlayer');
    const showBtn   = document.getElementById('reevoxShowBtn');
    const toggleBtn = document.getElementById('toggleBtn');
    const audio     = document.getElementById('aud');
    const playBtn   = document.getElementById('ply');
    const prevBtn   = document.getElementById('prevBtn');
    const nextBtn   = document.getElementById('nextBtn');
    const closeBtn  = document.getElementById('cls');
    const volBtn    = document.getElementById('vol');
    const volSlider = document.getElementById('vsl');
    const progressBar  = document.getElementById('pb');
    const progressFill = document.getElementById('pf');
    const currentTimeEl = document.getElementById('ct');
    const durationEl    = document.getElementById('dur');
    const coverEl  = document.getElementById('cov');
    const titleEl  = document.getElementById('tit');
    const artistEl = document.getElementById('art');

    let track  = JSON.parse(savedTrack);
    let playing = localStorage.getItem('reevox_music_playing') === 'true';
    let queue = JSON.parse(localStorage.getItem('reevox_music_queue') || '[]');
    let currentIndex = parseInt(localStorage.getItem('reevox_music_index') || '0');

    // ── MINIMIZE / SHOW ──────────────────────────────────────
    function minimize() {
        isMinimized = true;
        localStorage.setItem('reevox_player_minimized', 'true');
        player.style.transform  = 'translateY(110%)';
        player.style.opacity    = '0';
        player.style.pointerEvents = 'none';
        showBtn.style.display   = 'flex';
    }

    function expand() {
        isMinimized = false;
        localStorage.setItem('reevox_player_minimized', 'false');
        player.style.transform  = 'translateY(0)';
        player.style.opacity    = '1';
        player.style.pointerEvents = 'all';
        showBtn.style.display   = 'none';
    }

    toggleBtn.addEventListener('click', minimize);
    showBtn.addEventListener('click', expand);

    // État initial
    if (isMinimized) minimize(); else expand();

    // ── CHARGEMENT ───────────────────────────────────────────
    function loadTrack(trackData) {
        track = trackData;
        audio.src      = track.url;
        coverEl.src    = track.cover || 'https://via.placeholder.com/150/a855f7/ffffff?text=♪';
        titleEl.textContent  = track.title;
        artistEl.textContent = track.artist;
        
        localStorage.setItem('reevox_music_track', JSON.stringify(track));
    }

    loadTrack(track);

    const savedTime = localStorage.getItem('reevox_music_time');
    if (savedTime) audio.currentTime = parseFloat(savedTime);

    if (playing) {
        audio.play().catch(() => {});
        playBtn.textContent = '⏸️';
    }

    const savedVol = localStorage.getItem('reevox_music_volume') || 70;
    volSlider.value = savedVol;
    audio.volume    = savedVol / 100;

    // ── CONTRÔLES PLAYLIST ───────────────────────────────────
    function playNext() {
        if (queue.length === 0) return;
        currentIndex = (currentIndex + 1) % queue.length;
        loadTrack(queue[currentIndex]);
        audio.play();
        playing = true;
        playBtn.textContent = '⏸️';
        localStorage.setItem('reevox_music_index', currentIndex);
        localStorage.setItem('reevox_music_playing', 'true');
    }

    function playPrevious() {
        if (queue.length === 0) return;
        currentIndex = (currentIndex - 1 + queue.length) % queue.length;
        loadTrack(queue[currentIndex]);
        audio.play();
        playing = true;
        playBtn.textContent = '⏸️';
        localStorage.setItem('reevox_music_index', currentIndex);
        localStorage.setItem('reevox_music_playing', 'true');
    }

    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrevious);

    // Quand la musique se termine, jouer la suivante
    audio.addEventListener('ended', () => {
        if (queue.length > 0) {
            playNext();
        }
    });

    // ── CONTRÔLES ────────────────────────────────────────────
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸️';
            playing = true;
        } else {
            audio.pause();
            playBtn.textContent = '▶️';
            playing = false;
        }
        localStorage.setItem('reevox_music_playing', playing);
    });

    volSlider.addEventListener('input', () => {
        audio.volume = volSlider.value / 100;
        localStorage.setItem('reevox_music_volume', volSlider.value);
    });

    volBtn.addEventListener('click', () => {
        audio.muted      = !audio.muted;
        volBtn.textContent = audio.muted ? '🔇' : '🔊';
    });

    audio.addEventListener('timeupdate', () => {
        progressFill.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
        if (Math.floor(audio.currentTime) % 5 === 0)
            localStorage.setItem('reevox_music_time', audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        audio.currentTime = audio.duration * ((e.clientX - rect.left) / rect.width);
    });

    closeBtn.addEventListener('click', () => {
        if (confirm('Fermer le player ?')) {
            audio.pause();
            player.remove();
            showBtn.remove();
            ['reevox_music_track','reevox_music_time','reevox_music_queue',
             'reevox_music_index','reevox_music_playing','reevox_player_minimized']
            .forEach(k => localStorage.removeItem(k));
        }
    });

    function formatTime(s) {
        if (isNaN(s)) return '0:00';
        return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    }

    window.addEventListener('beforeunload', () => {
        localStorage.setItem('reevox_music_time', audio.currentTime);
        localStorage.setItem('reevox_music_playing', playing);
    });

    console.log('🎵 Mini Player avec playlists chargé !');
})();